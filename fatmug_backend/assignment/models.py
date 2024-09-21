from django.db import models

class Video(models.Model):
    uploader = models.CharField(max_length=100, null=False)
    vid_path = models.CharField(max_length=255, null=False)
    vid_seek_path = models.CharField(max_length=255, null=False)
    thumbnail_path = models.CharField(max_length=255, null=False)
    vid_name = models.CharField(max_length=100, null=False)
    created_at = models.DateTimeField(null=False)

    def __str__(self):
        return f"Video: {self.vid_name}"
    
class Subtitle(models.Model):
    language = models.CharField(max_length=10, null=False)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    subtitle_file = models.BinaryField()

    def __str__(self):
        return f"{self.language} subtitles for {self.video.vid_name}"