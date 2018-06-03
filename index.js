'use strict'

const AWS = require('aws-sdk')
const S3 = new AWS.S3({
  signatureVersion: 'v4'
})

const BUCKET = process.env.BUCKET
const KEY = process.env.KEY
const INREACHACCT = process.env.INREACHACCT

const request = require('request')
const togeojson = require('@mapbox/togeojson')
const DOMParser = require('xmldom').DOMParser

exports.handler = function(event, context, callback) {

  request({
    uri: 'https://inreach.garmin.com/feed/share/'+ INREACHACCT + '?d1=2012-10-16T06:19z',
    method: 'GET'
  }, function (err, res){
    const kml = new DOMParser().parseFromString(res.body);
    const json = togeojson.kml(kml)

    S3.putObject({
      Body: Buffer.from(JSON.stringify(json, null, 2)),
      Bucket: BUCKET,
      ContentType: 'application/json',
      Key: KEY
    }, function(){
      callback(null, {
        statusCode: '301',
        headers: {'location': [BUCKET, KEY].join('/')},
        body: ''
      })
    })
  })
}
