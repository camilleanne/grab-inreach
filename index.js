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
    uri: 'https://inreach.garmin.com/feed/share/'+ INREACHACCT + '?d1=2018-06-01T06:19z',
    method: 'GET'
  }, function (err, res){
    const kml = new DOMParser().parseFromString(res.body);
    let json = togeojson.kml(kml)

    json.features = json.features.map(function(r){
      const s = {}
      s.type = r.type
      s.geometry = r.geometry
      s.properties = {}
      s.properties['Latitude'] = r.properties['Latitude']
      s.properties['Longitude'] = r.properties['Longitude']
      s.properties['Time UTC'] = r.properties['Time UTC']
      s.properties['Time'] = r.properties['Time']
      s.properties['timestamp'] = r.properties['timestamp']
      s.properties['Valid GPS Fix'] = r.properties['Valid GPS Fix']
      return s
    })

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
