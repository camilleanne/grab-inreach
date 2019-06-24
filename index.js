'use strict'

const AWS = require('aws-sdk')
const S3 = new AWS.S3({
  signatureVersion: 'v4'
})

const BUCKET = process.env.BUCKET
const KEY = process.env.KEY
const INREACHACCT = process.env.INREACHACCT
const STARTDATE = process.env.STARTDATE

const request = require('request')
const togeojson = require('@mapbox/togeojson')
const DOMParser = require('xmldom').DOMParser

exports.handler = function(event, context, callback) {
  let missing = []
  if (!BUCKET) missing.push('BUCKET')
  if (!KEY) missing.push('KEY')
  if (!INREACHACCT) missing.push('INREACHACCT')
  if (!STARTDATE) missing.push('STARTDATE')
  if (missing.length) return callback(new Error('missing environment variable(s): ' + missing.toString()))

  request({
    uri: 'https://inreach.garmin.com/feed/share/'+ INREACHACCT + '?d1=' + STARTDATE + 'T00:00z',
    method: 'GET'
  }, function (err, res){
    const kml = new DOMParser().parseFromString(res.body)
    const json = togeojson.kml(kml)

    S3.putObject({
      Body: Buffer.from(JSON.stringify(json, null, 2)),
      Bucket: BUCKET,
      ContentType: 'application/json',
      Key: KEY
    }, function(err){
      if (err) return callback(err)
      callback(null, {
        statusCode: '301',
        headers: {'location': [BUCKET, KEY].join('/')},
        body: ''
      })
    })
  })
}
