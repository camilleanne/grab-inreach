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
const simplify = require('@turf/simplify')
const geobuf = require('geobuf')
const Pbf = require('pbf')

exports.handler = function(event, context, callback) {
  const time = +new Date()
  request({
    uri: 'https://inreach.garmin.com/feed/share/'+ INREACHACCT + '?d1=2018-10-01T06:19z',
    method: 'GET'
  }, function (err, res){
    const kml = new DOMParser().parseFromString(res.body)
    let json = togeojson.kml(kml)

    const trace = json.features.pop()
    const options = {tolerance: 0.0025, highQuality: false}
    const simplified = simplify(trace, options)

    console.log('before', trace.geometry.coordinates.length, 'after', simplified.geometry.coordinates.length)
    console.log('request', time - +new Date())
    let output = {
      'type': 'FeatureCollection',
      'features': []
    }

    for (var i = 0; i < json.features.length; i ++) {
      var point = json.features[i];
      for (var x = 0; x < simplified.geometry.coordinates.length; x ++) {
        var stringpoint = simplified.geometry.coordinates[x];
        if (stringpoint[0] === point.geometry.coordinates[0] && stringpoint[1] === point.geometry.coordinates[1]) {
          const s = {}
          s['Latitude'] = point.properties['Latitude']
          s['Longitude'] = point.properties['Longitude']
          s['Time UTC'] = point.properties['Time UTC']
          s['Time'] = point.properties['Time']
          s['timestamp'] = point.properties['timestamp']
          s['Valid GPS Fix'] = point.properties['Valid GPS Fix']
          point.properties = s
          output.features.push(point)
        }
      }
    }

    output.features.push(simplified)
    const buffer = geobuf.encode(output, new Pbf());

    console.log(typeof buffer)

    S3.putObject({
      Body: Buffer.from(buffer),
      Bucket: BUCKET,
      Key: KEY
    }, function(err){
      if (err) return callback(err)
      console.log('total', time - +new Date())
      callback(null, {
        statusCode: '301',
        headers: {'location': [BUCKET, KEY].join('/')},
        body: ''
      })
    })
  })
}
