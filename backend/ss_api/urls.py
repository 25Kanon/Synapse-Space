from django.urls import path
from .views import RegisterView, LoginView, LogoutView, CustomTokenRefreshView, CommunityCreateView


urlpatterns = [
    # Auth URLs
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),

    # Community URLs
    path('community/create/', CommunityCreateView.as_view(), name='community-create'),
]