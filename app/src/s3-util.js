const aws = require('aws-sdk')
const	fs = require('fs')
const	s3 = new aws.S3()

const downloadFileFromS3 = function (bucket, fileKey, filePath) {
  return new Promise(function (resolve, reject) {
    const file = fs.createWriteStream(filePath);
    const stream = s3
      .getObject({
        Bucket: bucket,
        Key: fileKey,
      })
      .createReadStream();
    stream.on("error", reject);
    file.on("error", reject);
    file.on("finish", function () {
      console.log("downloaded", bucket, fileKey);
      resolve(filePath);
    });
    stream.pipe(file);
  });
};
const uploadFileToS3 = function (bucket, fileKey, filePath, contentType) {
  console.log("uploading", bucket, fileKey, filePath);
  return s3
    .upload({
      Bucket: bucket,
      Key: fileKey,
      Body: fs.createReadStream(filePath),
      ACL: "public-read",
      ContentType: contentType,
    })
    .promise();
};
const deleteFileToS3 = function (bucket, key) {
  console.log("removing", key, bucket);
  return s3
    .deleteObject({
      Bucket: bucket,
      Key: key,
    })
    .promise();
};

module.exports.downloadFileFromS3 = downloadFileFromS3;
module.exports.uploadFileToS3 = uploadFileToS3;
module.exports.deleteFileToS3 = deleteFileToS3;
