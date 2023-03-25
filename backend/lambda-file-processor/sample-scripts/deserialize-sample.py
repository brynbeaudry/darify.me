import json
import json
import boto3
from boto3.dynamodb.types import TypeDeserializer

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

dbddata = b'{"Item":{"uuid":{"S":"42b65bf0-43cf-4eff-b74c-173f3f347d68"},"result":{"S":"trimming or shaving beard"},"prompt":{"S":"laugh for 10 seconds"},"username":{"S":"Tommy"}}}'

result = deserialize_dynamodb_data(dbddata)
print(result['uuid'])