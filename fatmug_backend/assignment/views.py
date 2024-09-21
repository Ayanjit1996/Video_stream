from django.http import JsonResponse,Http404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from .models import Video,Subtitle
from django.shortcuts import get_object_or_404
from .forms import VideoUploadForm
from .util import parse_subtitles,create_directories,save_uploaded_video,extract_thumbnail,extract_subtitles,process_subtitles,save_subtitles,save_video_metadata
from django.views import View
from django.utils.decorators import method_decorator
import base64
import os
import subprocess
import json
import shutil

class VideoListView(View):
    def get(self, request):
        videos = Video.objects.all()
        video_list = []
        for video in videos:
            absolute_thumbnail_url = request.build_absolute_uri(video.thumbnail_path.replace(settings.MEDIA_ROOT, settings.MEDIA_URL))
            video_list.append({
                'id': video.id,
                'title': "_".join([part.capitalize() for part in video.vid_name.split("_")[1:]]).rsplit(".", 1)[0],
                'uploader': video.uploader,
                'created_at': video.created_at,
                'thumbnail_url': absolute_thumbnail_url
            })
        return JsonResponse(video_list, safe=False)
    
class DownloadSubtitleView(View):
    def get(self, request, video_id, language):
        try:
            subtitle = Subtitle.objects.get(video_id=video_id, language=language)
        except Subtitle.DoesNotExist:
            raise Http404("Subtitle not found")
        
        encoded_subtitle = base64.b64encode(subtitle.subtitle_file).decode('utf-8')
        parsed_subtitles = parse_subtitles(bytes(subtitle.subtitle_file).decode('utf-8'))
        timestamps = json.dumps(parsed_subtitles, ensure_ascii=False, indent=4)

        response_data = {
            'language': subtitle.language,
            'subtitle_file': encoded_subtitle,
            'subtitle': timestamps
        }
        return JsonResponse(response_data)

class PlayVideoView(View):
    def get(self, request, vid_id):
        video = get_object_or_404(Video, id=vid_id)
        subtitles = Subtitle.objects.filter(video=video)

        subtitle_list = []
        for subtitle in subtitles:
            subtitle_url = request.build_absolute_uri(f'/api/subtitles/{vid_id}/{subtitle.language}/')
            subtitle_list.append({
                'language': subtitle.language,
                'subtitle_file': subtitle_url
            })

        absolute_video_path = video.vid_path
        absolute_video_url = request.build_absolute_uri(absolute_video_path.replace(settings.MEDIA_ROOT, settings.MEDIA_URL))

        # Return the URL for the video and subtitles
        video_data = {
            'video_url': absolute_video_url,
            'subtitles': subtitle_list
        }
        
        return JsonResponse(video_data)

@method_decorator(csrf_exempt, name='dispatch')
class VideoUploadView(View):
    def post(self, request):
        form = VideoUploadForm(request.POST, request.FILES)
        print(request)
        if form.is_valid():
            video = form.cleaned_data['video']
            uploader = form.cleaned_data['uploader']
            file_extension = os.path.splitext(video.name)[1].lower()

            # Get the date and time and modify the filename
            Datetime = datetime.now()
            current_date = Datetime.strftime('%Y-%m-%d')
            video_name_modified = f"{Datetime.strftime('%Y%m%d%H%M%S')}_{os.path.splitext(video.name)[0]}"

            # Create all necessary directories
            dirs = create_directories(video_name=video_name_modified, current_date=current_date)

            # Save the uploaded video file to disk
            video_file_path = os.path.join(dirs['videos_dir'], video_name_modified + file_extension)
            save_uploaded_video(video, video_file_path)

            # Extract the thumbnail
            thumbnail_file_path = os.path.join(dirs['thumbnails_dir'], f"{video_name_modified}.jpg")
            try:
                extract_thumbnail(video_file_path, thumbnail_file_path)
            except RuntimeError as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

            # Extract subtitles
            try:
                languages = extract_subtitles(video_file_path)
                subtitles_file_path = os.path.join(dirs['subtitles_dir'], video_name_modified)
                process_subtitles(video_file_path, subtitles_file_path, languages)
            except RuntimeError as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

            video_data = {
                'vid_name': video_name_modified,
                'vid_path': video_file_path,
                'vid_seek_path': video_file_path,
                'thumbnail_path': thumbnail_file_path,
                'uploader': uploader,
                'created_at': Datetime
            }
            try:
                video = save_video_metadata(video_data)
                save_subtitles(languages, subtitles_file_path, video)
                
            except (ValueError, subprocess.CalledProcessError) as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
            subtitles_dir = os.path.join(settings.MEDIA_ROOT, 'subtitles')
            if os.path.exists(subtitles_dir):
                shutil.rmtree(subtitles_dir)

            return JsonResponse({'status': 'success', 'message': 'Video uploaded and processed successfully'}, status=200)
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)