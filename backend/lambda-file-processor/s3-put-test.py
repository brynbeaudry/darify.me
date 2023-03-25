import json
import index

with open('./s3-put-test-blob.json') as json_file:
    data = json.load(json_file)

# print(data)

index.lambda_handler(data, {})
