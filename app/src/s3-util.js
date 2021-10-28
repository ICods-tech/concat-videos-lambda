const aws = require('aws-sdk')
const	fs = require('fs')
const	s3 = new aws.S3()

const downloadFileFromS3 = function (bucket, fileKey, filePath) {
  console.log("downloading", bucket, fileKey, filePath);
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
  console.log("UPLOADING", bucket, fileKey, filePath);
  return s3
    .upload({
      Bucket: bucket,
      Key: fileKey,
      Body: fs.createReadStream(filePath),
      //ContentType: contentType,
    })
    .promise();
};

module.exports.downloadFileFromS3 = downloadFileFromS3;
module.exports.uploadFileToS3 = uploadFileToS3;
