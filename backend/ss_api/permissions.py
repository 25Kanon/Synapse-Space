from rest_framework import permissions
from .models import Membership, Community
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

class IsCommunityMember(permissions.BasePermission):
    def has_permission(self, request, view):
        community_id = view.kwargs.get('community_id')
        if not community_id:
            return False

        try:
            community = Community.objects.get(id=community_id)
        except Community.DoesNotExist:
            return False

        return Membership.objects.filter(user=request.user, community=community).exists()

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)

class IsCommunityAdminORModerator(permissions.BasePermission):
    def has_permission(self, request, view):
        # Fetch community_id from URL kwargs
        community_id = view.kwargs.get('community_id')
        if not community_id:
            return False

        # Try to get the community and check membership with `role__in`
        try:
            community = Community.objects.get(id=community_id)
        except Community.DoesNotExist:
            return False

        return Membership.objects.filter(
            user=request.user,
            community=community,
            role__in=['admin', 'moderator']
        ).exists()

    def has_object_permission(self, request, view, obj):
        # Reuse `has_permission` logic for object-level permissions
        return self.has_permission(request, view)


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None
        else:
            raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token

