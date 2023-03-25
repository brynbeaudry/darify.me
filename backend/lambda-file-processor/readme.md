### Prerequisites:
1. Must have a blob in S3 whose key matches the uuid for an entry in the dare DDB table
2. For local testing,:
   1. That object key must be the value of the object key in the s3-put-test-blob.json file
   2. resnet-34_kinetics.onnx must be in the files_activity_recognition folder

### Add credentials to the environment
```bash
awsume darify
```

### Preparing packages for upload:
```bash
pip3 install --target ./package -r requirements.txt
```

### Testing the handler locally
```bash
python3 s3-put-test.py
```