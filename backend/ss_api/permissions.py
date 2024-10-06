from rest_framework import permissions
from .models import Membership, Community

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