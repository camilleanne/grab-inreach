### grab inreach

A lambda function for scooping up the KML files from the Garmin InReach shared feed, converting to GeoJSON, and dumping it on S3.

The KML traces can get very large very quickly making them expensive to download and visualize. This branch extends the master branch by simplifiying the geometry with [@turf/simplify](https://www.npmjs.com/package/@turf/simplify) and compressing the final product as a geobuf using [@mapbox/geobuf](https://github.com/mapbox/geobuf).

These changes make the use of the final geometries much cheaper, but at higher processing costs. Depending on your usage you'll need to increase the time and memory available to your lamdba function.

### deploy

1. create a lambda function on AWS with a Cloudwatch scheduled trigger (InReach defaults to sending a new point every 10m, my script is scheduled for once an hour)
2. Set up environment variables through the AWS Cloudwatch console:
	* `BUCKET` (destination bucket of GeoJSON)
	* `KEY` (prefix and filename for JSON)
	* `INREACHACCT` (the public name of feed you are requesting)
	* `STARTDATE` (beginning of time frame for requested date in `YYYY-MM-DD`)
3. Give the lambda write permission to the destination `BUCKET`
4. If you set up the function with a name other than `grab-inreach` or in region other than `us-east-1`, edit `/lambda-package.sh`
5. run `./lamda-package.sh` to deploy script
