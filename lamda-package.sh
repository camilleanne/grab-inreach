#!/usr/bin/env sh

# Run this script to package lambda for deploy

rm -rf ./function
rm -rf ./function.zip

mkdir ./function

npm install

cp -r ./node_modules/ ./function/node_modules/
cp ./index.js ./function/
cp ./package.json ./function/

zip -r function.zip ./function/*

rm -rf ./function/

echo "function.zip created"

echo "function uploading"

aws lambda update-function-code --function-name grab-inreach --zip-file fileb://function.zip --region us-east-1
