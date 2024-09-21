from django import forms

class VideoUploadForm(forms.Form):
    video = forms.FileField()
    uploader = forms.CharField(max_length=100)