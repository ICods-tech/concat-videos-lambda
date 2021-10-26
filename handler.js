const s3Util = require("./s3-util");
const childProcessPromise = require("./child-process-promise.js");
const path = require("path");
const os = require("os");

const EXTENSION = ".mp4";
const OUTPUT_BUCKET = "icods-studio";
const MIME_TYPE = "video/mp4";

module.exports.handle = async ({ Records: records }, context) => {
  try {
    await Promise.all(
      records.map(async (record) => {
        const { key } = record.s3.object;
        const inputBucket = record.s3.bucket.name;
        const id = context.awsRequestId;
        const resultKey = key.replace(/\.[^.]+$/, EXTENSION);
        const workdir = os.tmpdir();
        const inputFile = path.join(workdir, id + path.extname(key));
        const inputFileIcods = path.join("icods.mp4");
        const outputFile = path.join(workdir, "converted-" + id + EXTENSION);

//➜ ffmpeg -loglevel error -y -i ./icods.mp4 -i ./icods.mp4 -filter_complex concat=n=2:v=1:a=1 output3.mp4  
/*➜ ffmpeg -i ${url} -i ./icods.mp4 -filter_complex 
  "[0:v] [0:a] [1:v] [1:a] concat=n=2:v=1:a=1 [v] [a]" -vsync 2 -map "[v]" -map "[a]" ${tmpPath}/${key}`
 */
       return s3Util
          .downloadFileFromS3(inputBucket, key, inputFile)
          .then(async () => {
            await childProcessPromise.spawn(
              "/opt/bin/ffmpeg",
              [
                "-loglevel",
                "error",
                "-y",
                "-i",
                inputFile,
                "-i",
                inputFileIcods,
                "-filter_complex",
                "concat=n=2:v=1:a=1",
                outputFile,
              ],
              { env: process.env, cwd: workdir }
            );
            s3Util.uploadFileToS3(
              OUTPUT_BUCKET,
              resultKey,
              outputFile,
              MIME_TYPE
            );
          })
      })
    );

    return {
      statusCode: 301,
      body: { ok: true },
    };
  } catch (err) {
    return err;
  }
};
