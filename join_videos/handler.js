"use strict";

const AWS = require("aws-sdk");
const fs = require("fs");
const util = require("util");
const axios = require("axios");
const writeFile = util.promisify(fs.writeFile);

var s3 = new AWS.S3({
  accessKeyId: "AKIAQVRENJD3PMB75IML", //process.env.AWS_ACCESS_KEY, // AKIAQVRENJD3PMB75IML
  secretAccessKey: "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", //process.env.AWS_SECRET_KEY, //
  signatureVersion: "v4",
  region: "us-east-1", //process.env.AWS_REGION // east-1
});

module.exports.hello = async ({ Records: records }, context) => {
  try {
    await Promise.all(
      records.map(async (record) => {
        const { key } = record.s3.object;

        const params = {
          Bucket: "bucket-icods-videos",
          Expires: 3000,
          Key: key,
        };

        const url = await s3
          .getSignedUrlPromise("getObject", params)
          .catch((err) => {
            logger.error(err);
          });

        console.log({ url });

        const res = await axios.get(url, {
          responseType: "stream",
        });

        const istream = res.data;

        const ostream = fs.createWriteStream("./originalVideo.mp4");

        istream.pipe(ostream);

        // await S3.putObject({
        //   Body: optimized,
        //   Bucket: process.env.bucket,
        //   ContentType: "image/jpeg",
        //   Key: `compressed/${basename(key, extname(key))}.jpg`
        // }).promise();
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message:
            "Go Serverless v1.0! Your function executed successfully! 🥝🥝🥝",
          input: event,
        },
        null,
        2
      ),
    };
  } catch (error) {
    console.log(error);
  }
};

/*
"use strict";

const AWS = require("aws-sdk");
const sharp = require("sharp");
const { basename, extname } = require("path");

const s3 = new AWS.S3();

// module.exports.handle = async ({ Records: records }, context) => {
//   try {
// await Promise.all(
//   records.map(async record => {
//     const { key } = record.s3.object;

//     const image = await S3.getObject({
//       Bucket: process.env.bucket,
//       Key: key
//     }).promise();

//     const optimized = await sharp(image.Body)
//       .resize(1280, 720, { fit: "inside", withoutEnlargement: true })
//       .toFormat("jpeg", { progressive: true, quality: 50 })
//       .toBuffer();

//     await S3.putObject({
//       Body: optimized,
//       Bucket: process.env.bucket,
//       ContentType: "image/jpeg",
//       Key: `compressed/${basename(key, extname(key))}.jpg`
//     }).promise();
//   })
// );

//     return {
//       statusCode: 301,
//       body: { ok: true }
//     };
//   } catch (err) {
//     return err;
//   }
// };

exports.handle = async ({ Records: records }, context) => {
  try {
    await Promise.all(
      records.map(async record => {
        const { key } = record.s3.object;

        const video = await s3.getObject({
          Bucket: process.env.bucket,
          Key: key
        }).promise();

        console.log(video)

        // const optimized = await sharp(image.Body)
        //   .resize(1280, 720, { fit: "inside", withoutEnlargement: true })
        //   .toFormat("jpeg", { progressive: true, quality: 50 })
        //   .toBuffer();

        // await S3.putObject({
        //   Body: optimized,
        //   Bucket: process.env.bucket,
        //   ContentType: "video/mp4",
        //   Key: `compressed/${basename(key, extname(key))}.jpg`
        // }).promise();
      })
    );
  
    // exec(`ffmpeg -i ${originalVideoPath} -i ${endingVideoPath} -filter_complex "[0:v] [0:a] [1:v] [1:a] concat=n=2:v=1:a=1 [v] [a]" -vsync 2 -map "[v]" -map "[a]" ${outputVideo}`, (err, stdout, stderr) => {
    //   if (err) {
    //     console.error(err)
    //   } else {
    //     console.log("batatas fritas 🍟")
    //   }
    // })
  } 
  catch (err) {

  }
};

*/
