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
    console.log("Started invalidation of CloudFront 2...");

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
  new Promise((resolve, reject) => {
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

const performUpload = async ({ file, bucket, distributionId, ...rest }) => {
  try {
    console.log("Started stuff");
    await uploadS3({
      file,
      bucket,
      ...rest
    });
    console.log("First await is done");
    await invalidateCloudFront({
      distributionId,
      ...rest
    });
  } catch (err) {
    throw err;
  }
};

try {
  const file = core.getInput("FILE");
  const dest = core.getInput("DEST");
  const bucket = core.getInput("AWS_S3_BUCKET");
  const secretAccessKey = core.getInput("AWS_SECRET_KEY");
  const accessKeyId = core.getInput("AWS_SECRET_ID");
  const region = core.getInput("AWS_REGION");
  const distributionId = core.getInput("AWS_DISTRIBUTION_ID");

  if (
    !file ||
    !dest ||
    !bucket ||
    !secretAccessKey ||
    !accessKeyId ||
    !region
  ) {
    throw new Error("Not all inputs provided!");
  }
  performUpload({
    accessKeyId,
    secretAccessKey,
    region,
    file,
    bucket,
    dest,
    distributionId
  })
    .then(() => console.log("Done"))
    .catch(err => core.setFailed(err.message));
} catch (error) {
  core.setFailed(error.message);
}
