from collections import Counter
import cv2
import numpy as np
import requests
import boto3
import urllib.parse
import json
from boto3.dynamodb.types import TypeDeserializer

filepath_class_names = './files_activity_recognition/class_names_list.txt'
filepath_model = './files_activity_recognition/resnet-34_kinetics.onnx'
with open(filepath_class_names, 'r') as fh:
    class_names = fh.read().strip().split('\n')

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type (key is also UUID)
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(
        event['Records'][0]['s3']['object']['key'], encoding='utf-8')

    # Get prompt from Backend API
    try:
        print('Getting prompt from backend api for file: {}'.format(key))
        api_get_result = deserialize_dynamodb_data(
          requests.get('https://xdg792fpxd.execute-api.us-east-1.amazonaws.com/dev/dare/{}'.format(key)).content
        )
        print('Prompt for {} is {}'.format(key, api_get_result['prompt']))

    except Exception as e:
        print(e)
        print('Failed to retrieve a prompt from backend api for object: {}'.format(key))
        raise e

    # Download the file
    try:
        print('Getting file from s3 at: {}/{}'.format(bucket, key))
        s3.download_file(bucket, key, key)


    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e

    # Analyze the file with ML model(s)
    try:
        # with open('./'+key) as fileData:
        #     print(fileData.read())
        model = cv2.dnn.readNet(filepath_model)
        activity = video_activity(key, model)
        print(activity)
        # return {
        #     'statusCode': 200,
        #     'body': json.dumps(activity)
        # }
        if activity.lower() == api_get_result['prompt'].lower():
          activity_match_result = "true"
        else:
          activity_match_result = "false"

        print(activity_match_result)

    except Exception as e:
        print(e)
        print('Failed to process the object: {}'.format(key))
        raise e

    # Upload result to Backend API
    try:
        print('Posting result to backend api for file: {}'.format(key))
        api_put_result = {
            "uuid": key,
            "username": api_get_result['username'],
            "prompt": api_get_result['prompt'],
            "result": activity_match_result
        }

        postresult = requests.post('https://xdg792fpxd.execute-api.us-east-1.amazonaws.com/dev/dare', json=api_put_result)

        print('Post Result: {}'.format(postresult))

    except Exception as e:
        print(e)
        print('Failed to update backend api with result for object: {}'.format(key))
        raise e

# Functions

def preprocess(frames):
  model_img_w = 112    # as per model input image width
  model_img_h = 112    # as per model input image height
  # as per pre-trained model's mean values for normalization
  mean = (114.7748, 107.7354, 99.4750)
  # blob.shape is N x 3 x H x W ( samples, channels(RGB), width , height)
  blob = cv2.dnn.blobFromImages(frames, scalefactor=1, size=(
      model_img_w, model_img_h), mean=mean, swapRB=True, crop=True)
  blob = np.transpose(blob, (1, 0, 2, 3))  # resulting shape is 3 x N x H x W
  # resulting shape is 1 x 3 x N x H x W # 1 is for the batch dimension, required for input to the model
  blob = np.expand_dims(blob, axis=0)
  return blob


def get_video_frames(vcap, num_frames):
  frames = []
  for i in range(num_frames):
    grabbed, frame = vcap.read()
    if grabbed == False:
      break
    frames.append(frame)

  if len(frames) < num_frames:
    return -1
  else:
    return frames


def write_pred_on_frame(frame, pred_class_name):
  text = pred_class_name
  cv2.rectangle(frame, (0, 0), (150, 30), (0, 0, 0), -1)
  cv2.putText(frame, text, (10, 20), cv2.FONT_HERSHEY_SIMPLEX,
              0.6, (255, 255, 255), 1)
  return frame


def video_activity(filepath_in_video, model):
  vcap = cv2.VideoCapture(filepath_in_video)

  num_frames = 16  # number of frames passed to model for making single inference . this specification is as per the model used and should not be changed
  predicted_classes = []
  while True:
    frames = get_video_frames(vcap, num_frames)
    if frames == -1:
      break

    frames_processed = preprocess(frames)
    model.setInput(frames_processed)
    pred = model.forward()  # resulting pred.shape will be (1 , 400)
    pred_class_idx = np.argmax(pred)
    pred_class_name = class_names[pred_class_idx]
    predicted_classes.append(pred_class_name)

  activity_counts = Counter(predicted_classes)
  most_common_activity = activity_counts.most_common(1)[0][0]

  vcap.release()
  print(predicted_classes)
  return most_common_activity

def deserialize_dynamodb_data(dbdata):
  # Decode bytes to string
  dbdata_str = dbdata.decode('utf-8')

  # Deserialize JSON string into a Python dictionary
  dbdata_dict = json.loads(dbdata_str)

  # Extract the 'Item' dictionary
  item = dbdata_dict['Item']

  # Initialize TypeDeserializer
  deserializer = TypeDeserializer()

  # Deserialize the attribute values
  result_dict = {key: deserializer.deserialize(value) for key, value in item.items()}

  return result_dict
