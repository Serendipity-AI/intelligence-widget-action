const core = require("@actions/core");
const fs = require("fs");
const AWS = require("aws-sdk");

const invalidateCloudFront = ({
  distributionId,
  accessKeyId,
  secretAccessKey,
  region,
  dest
}) =>
  new Promise((resolve, reject) => {
    console.log("Started invalidation of CloudFront...");

    const cloudFront = new AWS.CloudFront({
      apiVersion: "2019-03-26",
      accessKeyId,
      secretAccessKey,
      region
    });

    const params = {
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: +new Date(),
        Paths: {
          Quantity: 1,
          Items: [dest]
        }
      }
    };

    cloudFront.createInvalidation(params, (err, _) => {
      if (err) {
        console.log("Failed to invalidate CloudFront!");
        reject(err);
      } else {
        console.log("Successful invalidation CloudFront!");
        resolve();
      }
    });
  });

const uploadS3 = ({
  accessKeyId,
  secretAccessKey,
  region,
  file,
  bucket,
  dest
}) =>
  new Promise((reject, resolve) => {
    console.log("Started upload to S3...");
    const s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      accessKeyId,
      secretAccessKey,
      region
    });

    const body = fs.readFileSync(file);
    const params = {
      Body: body,
      Bucket: bucket,
      Key: dest
    };

    s3.upload(params, (err, _) => {
      if (err) {
        console.log("Failed upload to bucket!");
        reject(err);
      } else {
        console.log("Successful upload to bucket!");
        resolve();
      }
    });
  });

try {
  const file = core.getInput("FILE");
  const dest = core.getInput("DEST");
  const bucket = core.getInput("AWS_S3_BUCKET");
  const AWS_SECRET_KEY = core.getInput("AWS_SECRET_KEY");
  const AWS_SECRET_ID = core.getInput("AWS_SECRET_ID");
  const AWS_REGION = core.getInput("AWS_REGION");
  const distributionId = core.getInput("AWS_DISTRIBUTION_ID");

  if (
    !file ||
    !dest ||
    !bucket ||
    !AWS_SECRET_KEY ||
    !AWS_SECRET_ID ||
    !AWS_REGION
  ) {
    throw new Error("Not all inputs provided!");
  }

  (async () => {
    await uploadS3({
      accessKeyId: AWS_SECRET_ID,
      secretAccessKey: AWS_SECRET_KEY,
      region: AWS_REGION,
      file,
      bucket,
      dest
    });

    await invalidateCloudFront({
      distributionId,
      dest,
      accessKeyId: AWS_SECRET_ID,
      secretAccessKey: AWS_SECRET_KEY,
      region: AWS_REGION
    });
  })();
} catch (error) {
  core.setFailed(error.message);
}
