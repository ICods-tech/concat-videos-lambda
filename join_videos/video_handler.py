import os
import boto3
import ffmpeg
from moviepy.editor import *

s3 = boto3.client('s3')
ENDING_SECTION = VideoFileClip("./icods.mp4")

def handle(event, context):
    records = event["Records"]
    
    for record in records:
        key = record["s3"]["object"]["key"]
        recorded_video_s3 = s3.get_object(Bucket="bucket-icods-videos", Key=key)
        recorded_video = VideoFileClip(recorded_video_s3)
        concatenated_clips = concatenate_videoclips([video_made, ENDING_SECTION])
        concatenated_clips.write_videofile("concatenated_video.mp4")
        convert_to_mkv("./concatenated_video.mp4")

        s3.put_object(
            Bucket="bucket-icods-videos",
            Key=key,
            Body="./concatenated_video.mkv",
            ServerSideEncryption='aws:kms',
        )

        os.remove("./concatenated_video.mkv")
    
    print("Concatenation done 🐱‍👤", key)
    
def convert_to_mkv(mp4_file):
    name, extension = os.path.splitext(mp4_file)
    output_name = name + ".mkv"
    ffmpeg.input(mp4_file).output(output_name).run()
    os.remove(mp4_file) 