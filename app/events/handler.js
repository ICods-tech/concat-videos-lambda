const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
console.log({ env: process.env.ICODS_VIDEO_BUCKET });

const event = {
  Records: [
    {
      eventVersion: "2.1",
      eventSource: "aws:s3",
      awsRegion: "us-east-1",
      eventTime: "2021-10-27T00:20:35.422Z",
      eventName: "ObjectCreated:CompleteMultipartUpload",
      userIdentity: {
        principalId: "A2MD2J2RYQRVR1",
      },
      requestParameters: {
        sourceIPAddress: "187.107.11.241",
      },
      responseElements: {
        "x-amz-request-id": "PCH0564TBCT0S44D",
        "x-amz-id-2":
          "Iv8T1ndCsBwgwPiL0iAhRM42p2+dzF1Seyk3azOnLAjYEIkxrQyW8u5RzsEspwim2gP9haS3AQ6dIGjxVZ8x3O6bfSCH4BzB",
      },
      s3: {
        s3SchemaVersion: "1.0",
        configurationId: "e0b2a598-604d-4e62-aca9-ba0df02604b2",
        bucket: {
          name: process.env.ICODS_VIDEO_BUCKET,
          ownerIdentity: {
            principalId: "A2MD2J2RYQRVR1",
          },
          arn: `arn:aws:s3:::${process.env.ICODS_VIDEO_BUCKET}`,
        },
        object: {
          key: process.env.ICODS_VIDEO_KEY,
          size: 32769573,
          eTag: "e88542aa6487c5bcf04d9cd0157610c0-2",
          sequencer: "0061789C890319C237",
        },
      },
    },
  ],
};

fs.writeFileSync(
  path.join(__dirname, "handler.json"),
  JSON.stringify(event),
  "utf8",
  () => {}
);
