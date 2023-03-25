### Prerequisites:
1. Must have a blob in S3 whose key matches the uuid for an entry in the dare DDB table
2. For local testing, that key must be in the s3-put-test-blob.json file

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