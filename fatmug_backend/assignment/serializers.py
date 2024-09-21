from rest_framework import serializers
from .models import Video, Subtitle

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'vid_name','vid_seek_path', 'vid_path', 'thumbnail_path', 'uploader', 'created_at']

class SubtitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtitle
        fields = ['id', 'language', 'video', 'subtitle_file']