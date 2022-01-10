const s3Util = require("./s3-util");
const ffmpeg = require("fluent-ffmpeg");

if (process.env.NODE_ENV !== "dev") {
  if (process.env.FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
  }
  if (process.env.FFPROBE_PATH) {
    ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
  }
}

const path = require("path");
const os = require("os");

const EXTENSION = ".mp4";
const MIME_TYPE = "video/mp4";
const RESOLUTION = "1080x1920";
const CODEC = "libx264";
module.exports.concat = async ({ Records: records }, context) => {
  try {
    await Promise.all(
      records.map(async (record) => {
        async function resizeVideo(file) {}
        const { key } = record.s3.object;

        const inputBucket = record.s3.bucket.name;
        const id = context.awsRequestId;
        const resultKey = key.replace(/\.[^.]+$/, EXTENSION);
        const workdir = os.tmpdir();
        let inputFile = path.join(workdir, id + path.extname(key));
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

        console.log(`==> Get file size info`);
        let resolutionFullHd = false;
        await new Promise(async (resolve, reject) => {
          await ffmpeg.ffprobe(inputFile, function (err, metadata) {
            if (err) {
              console.error(err);
            } else {
              const { streams } = metadata;
              streams.forEach((stream) => {
                if (stream.codec_type === "video") {
                  const { width, height } = stream;
                  if (width === 1080 && height === 1920) {
                    console.log("==> Full HD detected");
                    resolutionFullHd = true;
                  }
                }
              });
              resolve();
            }
          });
        });
        if (!resolutionFullHd) {
          console.log("==> Init resize video...");
          const resizeVideoOut = path.join(workdir, id + "-resized.mp4");
          await new Promise((resolve, reject) => {
            ffmpeg(inputFile)
              .output(resizeVideoOut)
              .videoCodec(CODEC)
              .size(RESOLUTION)
              .on("error", function (err) {
                console.log("An error occurred: " + err.message);
              })
              .on("start", function (e) {
                console.log(e);
              })
              .on("end", function () {
                inputFile = resizeVideoOut
                console.log("==> Finished resize video!");
                resolve();
              })
              .run();
          });
        }
        
        await new Promise((resolve, reject) => {
          ffmpeg()
            .addInput(inputFile)
            .addInput(inputFileIcods)
            .outputFPS(60)
            .videoCodec(CODEC)
            .on("error", function (err) {
              console.log("An error occurred: " + err.message);
              reject(err);
            })
            .on("start", function (e) {
              console.log(e);
            })
            .on("end", function () {
              console.log("Merging finished !");
              resolve();
            })
            .mergeToFile(mergedVideoPath);
        });

        await s3Util.uploadFileToS3(
          process.env.ICODS_VIDEO_OUTPUT_BUCKET,
          resultKey,
          mergedVideoPath,
          MIME_TYPE
        );
        // delete old video
        await s3Util.deleteFileToS3(inputBucket, key);
      })
    );

    return {
      statusCode: 301,
      body: { ok: true },
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
