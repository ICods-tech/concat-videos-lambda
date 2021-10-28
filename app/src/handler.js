const s3Util = require("./s3-util");
const ffmpeg = require("fluent-ffmpeg");

if (process.env.NODE_ENV !== "dev") {
  if (process.env.FFMPEG_PATH) {
    console.log(`==> configuring ffmpeg path to ${process.env.FFMPEG_PATH}`);
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
  }
  if (process.env.FFPROBE_PATH) {
    console.log(`==> configuring ffprobe path to ${process.env.FFPROBE_PATH}`);
    ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
  }
}

const path = require("path");
const os = require("os");

const EXTENSION = ".mp4";
const MIME_TYPE = "video/mp4";

module.exports.concat = async ({ Records: records }, context) => {
  try {
    await Promise.all(
      records.map(async (record) => {
        const { key } = record.s3.object;
        console.log(`==> processing ${key}`);

        const inputBucket = record.s3.bucket.name;
        const id = context.awsRequestId;
        const resultKey = key.replace(/\.[^.]+$/, EXTENSION);
        const workdir = os.tmpdir();
        const inputFile = path.join(workdir, id + path.extname(key));
        const inputFileIcods = path.join(workdir, "icods.mp4");

        const mergedVideoName = `converted-${key}`;
        const mergedVideoPath = path.join(workdir, mergedVideoName);

        await s3Util.downloadFileFromS3(
          process.env.ICODS_VIDEO_BUCKET,
          process.env.ICODS_VIDEO_KEY,
          inputFileIcods
        );
        await s3Util.downloadFileFromS3(inputBucket, key, inputFile);

        console.log(`==> file ${key} downloaded successfuly`);

        console.log(`==> merging files into ${mergedVideoPath}`);

        const mergedVideo = ffmpeg();
        mergedVideo.addInput(inputFileIcods);
        mergedVideo.addInput(inputFile);
        await new Promise((resolve, reject) => {
          mergedVideo.on("error", function (err) {
            console.log("An error occurred: " + err.message);
            reject(err);
          });
          mergedVideo.on("end", function () {
            console.log("Merging finished !");

            resolve();
          });
          mergedVideo.mergeToFile(mergedVideoPath);
        });
        console.log(`==> Uploading video to s3`);

        await s3Util.uploadFileToS3(
          process.env.ICODS_VIDEO_OUTPUT_BUCKET,
          resultKey,
          mergedVideoPath,
          MIME_TYPE
        );
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
