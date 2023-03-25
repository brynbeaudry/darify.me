import json
import urllib.parse
import boto3
import requests

# print('Loading function')

s3 = boto3.client('s3')


def lambda_handler(event, context):
    # print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')

    # Get prompt from Firebase
    try:
        print('Getting prompt from firebase for file: {}'.format(key))

    except Exception as e:
        print(e)
        print('Failed to update firebase with result for object: {}'.format(key))
        raise e

    # Download the file
    try:
        # response = s3.get_object(Bucket=bucket, Key=key)
        s3.download_file(bucket, key, key)

        # print("CONTENT TYPE: " + response['ContentType'])
        # return response['ContentType']


    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e

    # Do things with the file <MATT INSERT ML SCRIPT HERE>
    try:
        with open('./'+key) as fileData:
            print(fileData.read())

    except Exception as e:
        print(e)
        print('Failed to process the object: {}'.format(key))
        raise e

    # Upload result to Firebase
    try:
        print('uploading file to firebase')

    except Exception as e:
        print(e)
        print('Failed to update firebase with result for object: {}'.format(key))
        raise e