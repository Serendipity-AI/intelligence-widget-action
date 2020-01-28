const core = require("@actions/core");
const fs = require("fs");
const AWS = require("aws-sdk");

const upload = async ({ awsConfig, file, bucket, contentType, distributionId, dest }) => {
  try {
    const s3 = new AWS.S3({ apiVersion: "2006-03-01", ...awsConfig });
    const cloudFront = new AWS.CloudFront({
      apiVersion: "2019-03-26",
      ...awsConfig
    });
    console.log("Uploading file to S3");
    await s3
      .upload({
        Body: fs.readFileSync(file),
        Bucket: bucket,
        Key: dest,
        ContentType: contentType
      })
      .promise();

    if (!distributionId) {
      return;
    }

    console.log("Invalidating CloudFront distribution");
    await cloudFront
      .createInvalidation({
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: `${+new Date()}`,
          Paths: {
            Quantity: 1,
            Items: ["/" + dest]
          }
        }
      })
      .promise();
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
  const contentType = core.getInput("CONTENT_TYPE")

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
  upload({
    awsConfig: {
      accessKeyId,
      secretAccessKey,
      region
    },
    file,
    bucket,
    dest,
    contentType,
    distributionId
  })
    .then(() => console.log("Successfully uploaded file"))
    .catch(err => core.setFailed(err.message));
} catch (error) {
  core.setFailed(error.message);
}
