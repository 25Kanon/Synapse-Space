from django.urls import path
from .views import (RegisterView, LoginView, LogoutView, CommunityCreateView,
                    MembershipListView,
                    CommunityDetailView, CommunityMembersListView, PostCreateView, getCommunityPosts, UserProfileView,
                    UserActivitiesView, CommunityListView, JoinCommunityView, getCommunityPost, likePostView,
                    unlikePostView, getPostLikesView, CommentCreateView, CommentDetailView, CommentUpdateView,
                    CommentDeleteView, PostCommentsView, GenerateSignedUrlView, MoveImageView, CheckAuthView,
                    CookieTokenRefreshView, UserListView)


urlpatterns = [
    # Auth URLs
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/memberships/', MembershipListView.as_view(), name='membership-list'),
    path('auth/check-auth/', CheckAuthView.as_view(), name='check-auth'),
     # User Profile URLs
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('activities/', UserActivitiesView.as_view(), name='user-activities'),

    # Community URLs
    path('community/create/', CommunityCreateView.as_view(), name='community-create'),
    path('community/<int:id>/', CommunityDetailView.as_view(), name='community-detail'),
    path('community/<int:community_id>/members/', CommunityMembersListView.as_view(), name='community-members-list'),
    path('community/<int:community_id>/post', PostCreateView.as_view(), name='community-create-post'),
    path('generate-signed-url/', GenerateSignedUrlView.as_view(), name='generate-signed-url'),
    path('move-image/',MoveImageView.as_view(), name='move-image'),
    path('community/<int:community_id>/posts/', getCommunityPosts.as_view(), name='community-posts-list'),
    path('community/<int:community_id>/join/', JoinCommunityView.as_view(), name='join-community'),
    path('community', CommunityListView.as_view(), name='community-list'),
    path('community/<int:community_id>/post/<int:post_id>', getCommunityPost.as_view(), name='post-view'),
    path('community/<int:community_id>/post/<int:post_id>/likes', getPostLikesView.as_view(), name='post-likes'),
    path('community/<int:community_id>/post/<int:post_id>/like', likePostView.as_view(), name='like-post'),
    path('community/<int:community_id>/post/<int:post_id>/unlike', unlikePostView.as_view(), name='unlike-post'),
    path('community/<int:community_id>/post/<int:post_id>/unlike', unlikePostView.as_view(), name='unlike-post'),
    path('comments/', CommentCreateView.as_view(), name='comment-create'),
    path('posts/<int:post_id>/comments/', PostCommentsView.as_view(), name='post-comments'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('comments/<int:pk>/update/', CommentUpdateView.as_view(), name='comment-update'),
    path('comments/<int:pk>/delete/', CommentDeleteView.as_view(), name='comment-delete'),
    
    # User URLs
    # path('user/<int:id>/', UserDetailView.as_view(), name='user-detail'),
    path('users/', UserListView.as_view(), name='user-list'),

]