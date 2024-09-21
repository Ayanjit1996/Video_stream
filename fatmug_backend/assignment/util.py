import re
import subprocess
import json
import os
from datetime import datetime
from django.conf import settings
from .serializers import VideoSerializer, SubtitleSerializer
from .models import Video,Subtitle

def parse_subtitles(subtitle_text):
    subtitles_dict = {}
    regex = r'(\d{2}:\d{2}\.\d{3}) --> \d{2}:\d{2}\.\d{3}\n(.+?)(?=\n\d{2}:\d{2}\.\d{3}|$)'
    
    matches = re.findall(regex, subtitle_text, re.DOTALL)
    
    for match in matches:
        start_time = match[0]
        dialogue = match[1].replace('\n', ' ').strip()
        
        hours = '00' 
        minutes_seconds = start_time[:5]
        formatted_time = f"{hours}:{minutes_seconds}"
        subtitles_dict[formatted_time] = dialogue

    return subtitles_dict

def create_directories(video_name=None,current_date=None):

    # Base directories
    videos_dir = os.path.join(settings.MEDIA_ROOT, 'videos', current_date)
    subtitles_dir = os.path.join(settings.MEDIA_ROOT, 'subtitles', current_date)
    thumbnails_dir = os.path.join(settings.MEDIA_ROOT, 'thumbnails', current_date)

    os.makedirs(videos_dir, exist_ok=True)
    os.makedirs(subtitles_dir, exist_ok=True)
    os.makedirs(thumbnails_dir, exist_ok=True)

    return {
        'videos_dir': videos_dir,
        'subtitles_dir': subtitles_dir,
        'thumbnails_dir': thumbnails_dir,
    }

def save_uploaded_video(video, video_file_path):
    with open(video_file_path, 'wb+') as destination:
        for chunk in video.chunks():
            destination.write(chunk)

def extract_thumbnail(video_file_path, thumbnail_file_path):
    duration_cmd = [
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', video_file_path
    ]
    result = subprocess.run(duration_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode == 0:
        duration = float(result.stdout.strip())
        thumbnail_time = duration * 0.20  # 20% of video duration
        thumbnail_cmd = [
            'ffmpeg', '-ss', str(thumbnail_time), '-i', video_file_path,
            '-vframes', '1', '-f', 'image2', '-q:v', '2', thumbnail_file_path
        ]
        subprocess.run(thumbnail_cmd, check=True)
    else:
        raise RuntimeError('Failed to get video duration')

def extract_subtitles(video_file_path):
    cmd = [
        'ffprobe', '-v', 'quiet', '-show_entries',
        'stream=index,codec_type:stream_tags=language',
        '-of', 'json', video_file_path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    languages = set()
    
    if result.returncode == 0:
        data = json.loads(result.stdout)
        for stream in data['streams']:
            if 'tags' in stream and 'language' in stream['tags']:
                languages.add(stream['tags']['language'])
    else:
        raise RuntimeError('Failed to extract subtitles')

    return languages

def process_subtitles(video_file_path, subtitles_file_path, languages):
    sub_commands = []
    for lang in languages:
        command = f"ffmpeg -i {video_file_path} -map 0:s:m:language:{lang} {subtitles_file_path}_{lang}.vtt"
        sub_commands.append(command)

    for cmd in sub_commands:
        subprocess.run(cmd, shell=True, check=True)

def save_video_metadata(video_data):
    video_serializer = VideoSerializer(data=video_data)
    if video_serializer.is_valid():
        return video_serializer.save()
    else:
        raise ValueError(video_serializer.errors)

def save_subtitles(languages, subtitles_file_path, video):
    for lang in languages:
        subtitles_file_path_lang = f"{subtitles_file_path}_{lang}.vtt"
        if os.path.exists(subtitles_file_path_lang):
            with open(subtitles_file_path_lang, 'rb') as file:
                subtitle_data = file.read()
            subtitle = Subtitle(language=lang, video=video, subtitle_file=subtitle_data)
            subtitle.save()
        else:
            print(f"Subtitle file {subtitles_file_path_lang} does not exist.")
