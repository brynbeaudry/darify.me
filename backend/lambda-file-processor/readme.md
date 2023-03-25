### Prerequisites:
1. Must have a blob in S3 whose key matches the uuid for an entry in the dare DDB table
2. The files_activity_recognition folder (including the resnet-34_kinetics.onnx file) must be in the ./package folder
3. For local testing:
   1. That object key must be the value of the object key in the s3-put-test-blob.json file
   2. the files_activity_recognition folder (including the resnet-34_kinetics.onnx file) must be in your system's /tmp folder (this matches where lambda layers are accessed from)

### Add credentials to the environment
```bash
awsume darify
```

### Preparing packages for upload:
```bash
# Lambda Layer

#cp -R ./files_activity_recognition ./package
pip3 install --target ./python/lib/python3.9/site-packages -r requirements.txt
mkdir ./python/lib/python3.9/site-packages/files_activity_recognition
cp -R ./files_activity_recognition/class_names_list.txt ./python/lib/python3.9/site-packages/files_activity_recognition
zip -r lambda-file-processor-layer.zip python

#Lambda function
#pip3 install --target ./package -r requirements.txt
#mkdir ./package/files_activity_recognition
#cp -R ./files_activity_recognition/class_names_list.txt ./package/files_activity_recognition
#(cd package && zip -r ../lambda-file-processor.zip .)
zip lambda-file-processor.zip ./index.py
```
pip3 install \
--platform manylinux2014_aarch64 \
--target=./package \
--implementation cp \
--python 3.9 \
--only-binary=:all: --upgrade \
-r requirements.txt

### Testing the handler locally
```bash
python3 s3-put-test.py
```