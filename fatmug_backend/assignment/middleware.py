import time
from django.conf import settings
from django.http import JsonResponse
from collections import defaultdict

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit = getattr(settings, 'RATE_LIMIT', 100)
        self.rate_limit_window = getattr(settings, 'RATE_LIMIT_WINDOW', 60)
        self.requests = defaultdict(list)

    def __call__(self, request):
        user_ip = self.get_client_ip(request)
        current_time = time.time()

        self.requests[user_ip] = [timestamp for timestamp in self.requests[user_ip] if timestamp > current_time - self.rate_limit_window]

        if len(self.requests[user_ip]) >= self.rate_limit:
            return JsonResponse({'error': 'Too many requests, please try again later.'}, status=429)

        self.requests[user_ip].append(current_time)
        response = self.get_response(request)
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')