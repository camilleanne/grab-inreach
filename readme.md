### grab inreach

A lambda function for scooping up the KML files from the Garmin InReach shared feed, converting to GeoJSON, and dumping it on S3.

### deploy

1. create a lambda function on AWS with a Cloudwatch scheduled trigger (InReach defaults to sending a new point every 10m, my script is scheduled for once an hour)
2. Set up environment variables:
	`BUCKET` (destination bucket of GeoJSON), `KEY` (prefix and filename for JSON), & `INREACHACCT` (the public name of feed you are requesting)
3. Give the lambda write permission to the destination `BUCKET`
4. If you set up the function with a name other than `grab-inreach` or in region other than `us-east-1`, edit `/lambda-package.sh`
5. run `./lamda-package.sh` to deploy script
