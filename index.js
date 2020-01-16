const core = require("@actions/core");
const fs = require("fs");
const AWS = require("aws-sdk");

try {
  const src = core.getInput("SRC");
  const dest = core.getInput("DEST");
  const bucket = core.getInput("AWS_S3_BUCKET");
  const AWS_SECRET_KEY = core.getInput("AWS_SECRET_KEY");
  const AWS_SECRET_ID = core.getInput("AWS_SECRET_ID");
  const AWS_REGION = core.getInput("AWS_REGION");

  if (
    !src ||
    !dest ||
    !bucket ||
    !AWS_SECRET_KEY ||
    !AWS_SECRET_ID ||
    !AWS_REGION
  ) {
    throw new Error("Not all inputs provided!");
  }

  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    accessKeyId: AWS_SECRET_ID,
    secretAccessKey: AWS_SECRET_KEY,
    region: AWS_REGION
  });

  console.log("Reading file: " + src);
  const body = fs.readdirSync(src);
  const params = {
    Body: body,
    Bucket: bucket,
    Key: dest
  };

  console.log("Starting upload...");
  s3.upload(params, (err, _) => {
    if (err) {
      console.log(`Failed upload to bucket!`);
      throw err;
    } else {
      console.log(`Successful upload to bucket!`);
    }
  });
} catch (error) {
  core.setFailed(error.message);
}
