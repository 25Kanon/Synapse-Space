from django.urls import path
from .views import (RegisterView, LoginView, LogoutView, CustomTokenRefreshView, CommunityCreateView, MembershipListView,
                    CommunityDetailView, CommunityMembersListView, PostCreateView, 
                    ImageUploadView, getCommunityPosts, UserProfileView, 
                    UserActivitiesView, CommunityListView, JoinCommunityView, getCommunityPost, likePostView, unlikePostView, getLikedPostsView)


urlpatterns = [
    # Auth URLs
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/memberships/', MembershipListView.as_view(), name='membership-list'),

     # User Profile URLs
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('activities/', UserActivitiesView.as_view(), name='user-activities'),

    # Community URLs
    path('community/create/', CommunityCreateView.as_view(), name='community-create'),
    path('community/<int:id>/', CommunityDetailView.as_view(), name='community-detail'),
    path('community/<int:community_id>/members/', CommunityMembersListView.as_view(), name='community-members-list'),
    path('community/<int:community_id>/post', PostCreateView.as_view(), name='community-create-post'),
    path('community/upload/image', ImageUploadView.as_view(), name='community-upload-image'),
    path('community/<int:community_id>/posts/', getCommunityPosts.as_view(), name='community-posts-list'),
    path('community/<int:community_id>/join/', JoinCommunityView.as_view(), name='join-community'),
    path('community', CommunityListView.as_view(), name='community-list'),
    path('community/<int:community_id>/post/<int:post_id>', getCommunityPost.as_view(), name='post-view'),
    path('community/<int:community_id>/post/<int:post_id>/likes', getLikedPostsView.as_view(), name='liked-posts'),
    path('community/<int:community_id>/post/<int:post_id>/like', likePostView.as_view(), name='like-post'),
    path('community/<int:community_id>/post/<int:post_id>/unlike', unlikePostView.as_view(), name='unlike-post'),
]