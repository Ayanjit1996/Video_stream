from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.VideoListView.as_view(), name='video-list'),
    path('upload/',views.VideoUploadView.as_view(), name='video_upload'),
    path('subtitles/<int:video_id>/<str:language>/', views.DownloadSubtitleView.as_view(), name='download_subtitle'),
    path('play/<int:vid_id>/', views.PlayVideoView.as_view(), name='play_video'),
]
