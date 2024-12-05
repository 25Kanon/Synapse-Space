from django.urls import path, include
from .views import (RegisterView, LoginView, LogoutView, ChangePasswordView, CommunityCreateView,
                    MembershipListView,
                    CommunityDetailView, CommunityMembersListView, PostCreateView, getCommunityPosts, UserProfileView,
                    UserActivitiesView, CommunityListView, JoinCommunityView, getCommunityPost, likePostView,
                    unlikePostView, getPostLikesView, CommentCreateView, CommentDetailView, CommentUpdateView,
                    CommentDeleteView, PostCommentsView, UserCommentsView, GenerateSignedUrlView, MoveImageView,
                    CheckAuthView,
                    CookieTokenRefreshView, CustomGoogleLogin, VerifyAccountView, ImageUploadView, UserListView,
                    CustomGoogleLogin, getMembershipRole, getCommunityStats, ReportsListCreateView, getReportsView,
                    SendFriendRequestView, ListFriendsView, RespondToFriendRequestView, ListSentFriendRequestsView,
                    modResolveView, getJoinedCommunityPosts, AcceptMembershipView, BanMembershipView,
                    UnbanMembershipView, getPendingCommunityMembersListView, CheckPendingMembershipView, PinPostView,
                    UserRecommendationsView, UnpinPostView, CommunityUpdateView, AllStudentsView, UpdateAccountView,
                    DeleteAccountView, CreateAccountView, PostCountView, UserCountView, NewUserCountView,
                    EngagementRateView, AllStaffsView, ProgramListView, ProgramEditView, ProgramDeleteView,
                    ProgramCreateView, UnverifiedStudentsViewSet, NotificationListView, MarkAsReadView,
                    AdminUserActivityLogView, AdminUserRecentActivityLogView, InteractionTrendView,
                    CommunityPostUpdateView, CommunityPostDeleteView, ResendOTPView, UnfriendView,
                    PasswordResetRequestView, PasswordResetView, getPostDislikesView, dislikePostView,
                    undislikePostView,
                    UpvoteCommentView, DownvoteCommentView, RemoveVoteView, FeedbackView, StaffLoginView, SettingsView,
                    UpdateSettingsView, ModeratorSettingsDetailView, getCommunityActivities, createCommunityActivity,
                    communityActivityParticipantView, activityRatingViewset, getCommunityView,
                    getJoinedCommunityActivities, NotInterestedView, PostRecommendationView, ActivityRecommendationView,
                    CombinedPostView, CombinedActivityView)
from django.contrib import admin


urlpatterns = [
    
    
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', MarkAsReadView.as_view(), name='mark-as-read'),

    # Auth URLs
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/memberships/', MembershipListView.as_view(), name='membership-list'),
    path('auth/check-auth/', CheckAuthView.as_view(), name='check-auth'),
    path('auth/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('verify/account/', VerifyAccountView.as_view(), name='verify-account'),
    path('upload/', ImageUploadView.as_view(), name='upload'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset/confirm/', PasswordResetView.as_view(), name='password_reset'),
    path('auth/staff/login/', StaffLoginView.as_view(), name='staff-login'),

    path('auth/google/', include('allauth.socialaccount.urls')),
    path('auth/login/google/', CustomGoogleLogin.as_view(), name='google_login'),
     # User Profile URLs
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/<int:user_id>/', UserProfileView.as_view(), name='user-profile-by-id'),  # Fetch another user's profile
    path('activities/<int:userId>/', UserActivitiesView.as_view(), name='user-activities'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('feedback/', FeedbackView.as_view(), name='feedback'),

    # Community URLs
    path('community/create/', CommunityCreateView.as_view(), name='community-create'),
    path('community/<int:id>/', CommunityDetailView.as_view(), name='community-detail'),
    path('community/get/<int:id>/', getCommunityView.as_view(), name='community-detail'),
    path('community/<int:community_id>/members/', CommunityMembersListView.as_view(), name='community-members-list'),
    path('community/<int:community_id>/membership/role/', getMembershipRole.as_view(), name='community-membership-role'),
    path('community/<int:community_id>/post', PostCreateView.as_view(), name='community-create-post'),
    path('generate-signed-url/', GenerateSignedUrlView.as_view(), name='generate-signed-url'),
    path('move-image/', MoveImageView.as_view(), name='move-image'),
    path('community/joined/posts/', getJoinedCommunityPosts.as_view(), name='joined-community-posts'),
    path('community/<int:community_id>/posts/', getCommunityPosts.as_view(), name='community-posts-list'),
    path('community/<int:community_id>/posts/', getCommunityActivities.as_view(), name='community-activities-list'),
    path('community/<int:community_id>/join/', JoinCommunityView.as_view(), name='join-community'),
    path('community/', CommunityListView.as_view(), name='community-list'),
    path('community/<int:community_id>/post/<int:post_id>', getCommunityPost.as_view(), name='post-view'),
    path('community/<int:community_id>/post/<int:post_id>/likes', getPostLikesView.as_view(), name='post-likes'),
    path('community/<int:community_id>/post/<int:post_id>/like', likePostView.as_view(), name='like-post'),
    path('community/<int:community_id>/post/<int:post_id>/unlike', unlikePostView.as_view(), name='unlike-post'),
    path('community/<int:community_id>/post/<int:post_id>/dislikes', getPostDislikesView.as_view(), name='post-dislikes'),
    path('community/<int:community_id>/post/<int:post_id>/dislike', dislikePostView.as_view(), name='dislike-post'),
    path('community/<int:community_id>/post/<int:post_id>/undislike', undislikePostView.as_view(), name='undislike-post'),
    path('community/<int:community_id>/stats', getCommunityStats.as_view(), name='community-stats'),
    path('community/<int:community_id>/reports', getReportsView.as_view(), name='community-report'),
    path('comments/', CommentCreateView.as_view(), name='comment-create'),
    path('posts/<int:post_id>/comments/', PostCommentsView.as_view(), name='post-comments'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('comments/user/<int:user_id>/', UserCommentsView.as_view(), name='user-comments'),
    path('comments/update/<int:pk>/', CommentUpdateView.as_view(), name='comment-update'),
    path('comments/delete/<int:pk>/', CommentDeleteView.as_view(), name='comment-delete'),
    path("comments/<int:comment_id>/upvote/", UpvoteCommentView.as_view(), name="upvote-comment"),
    path("comments/<int:comment_id>/downvote/", DownvoteCommentView.as_view(), name="downvote-comment"),
    path("comments/<int:comment_id>/remove-vote/", RemoveVoteView.as_view(), name="remove-vote"),
    
    path('<int:community_id>/create-report/', ReportsListCreateView.as_view(), name='report-create'),
    path('community/<int:community_id>/reports/resolve/<int:pk>/', modResolveView.as_view(), name='mod-approve'),
    path('community/<int:community_id>/pending-members/', getPendingCommunityMembersListView.as_view(), name='community-pending-members-list'),
    path('membership/accept/<int:community_id>/', AcceptMembershipView.as_view(), name='accept-membership'),
    path('membership/ban/<int:community_id>/', BanMembershipView.as_view(), name='accept-membership'),
    path('membership/unban/<int:community_id>/', UnbanMembershipView.as_view(), name='accept-membership'),
    path('community/<int:community_id>/post/<int:post_id>/pin/', PinPostView.as_view(), name='pin-post'),
    path('community/<int:community_id>/post/<int:post_id>/unpin/', UnpinPostView.as_view(), name='unpin-post'),
    path('community/update/<int:community_id>/', CommunityUpdateView.as_view(), name='community-update'),
    path('community/<int:community_id>/post/update/<int:post_id>/', CommunityPostUpdateView.as_view(), name='community-post-update'),
    path('community/<int:community_id>/post/delete/<int:post_id>/', CommunityPostDeleteView.as_view(), name='community-post-delete'),

    path('community/<int:community_id>/create/activity/', createCommunityActivity.as_view(), name='create-community-activity'),
    path('community/<int:community_id>/activities/', getCommunityActivities.as_view(), name='community-activities-list'),
    path('community/<int:community_id>/activity/<int:activity_id>/', communityActivityParticipantView.as_view(), name='activity-participants'),
    path('community/<int:community_id>/activity/<int:activity_id>/rating/', activityRatingViewset.as_view(), name='activity-rating'),
    path('community/joined/activities/', getJoinedCommunityActivities.as_view(), name='joined-community-activities'),


    path('not-interested/', NotInterestedView.as_view(), name='not-interested'),

    # User URLs
    # path('user/<int:id>/', UserDetailView.as_view(), name='user-detail'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('membership/check-pending/<int:community_id>/', CheckPendingMembershipView.as_view(), name='check-pending-membership'),

    path('friend/send-request/', SendFriendRequestView.as_view(), name='send_friend_request'),
    path('friend-requests/', ListSentFriendRequestsView.as_view(), name='list_friend_requests'),
    path('respond-request/<int:pk>/', RespondToFriendRequestView.as_view(), name='respond_to_friend_request'),
    path('friends/', ListFriendsView.as_view(), name='list_friends'),
    path('friendship/unfriend/<int:friend_id>/', UnfriendView.as_view(), name='unfriend'),
    
    path('recommendations/', UserRecommendationsView.as_view(), name='user-recommendations'),

    path('admin/users', AllStudentsView.as_view(), name='all-users'),
    path('admin/users/staffs', AllStaffsView.as_view(), name='all-staffs'),
    path('admin/account/update/', UpdateAccountView.as_view(), name='update-account'),
    path('admin/account/delete/<int:user_id>/', DeleteAccountView.as_view(), name='delete-account'),
    path('admin/account/create/', CreateAccountView.as_view(), name='create-account'),
    path('admin/posts/count/', PostCountView.as_view(), name='post-count'),
    path('admin/users/count/', UserCountView.as_view(), name='users-count'),
    path('admin/new-users/count', NewUserCountView.as_view(), name='new-users-count'),
    path('admin/engagement-rate/', EngagementRateView.as_view(), name='engagement-rate'),
    path('admin/program/', ProgramListView.as_view(), name='program-list'),
    path('admin/program/create/', ProgramCreateView.as_view(), name='program-create'),
    path('admin/program/update/<int:program_id>/', ProgramEditView.as_view(), name='program-update'),
    path('admin/program/delete/<int:program_id>/', ProgramDeleteView.as_view(), name='program-delete'),
    path('admin/users/unverified', UnverifiedStudentsViewSet.as_view(), name='unverified-users'),
    path('admin/recent-user-activity-log/', AdminUserRecentActivityLogView.as_view(), name='admin-recent-user-activity-log'),
    path('admin/user-activity-log/', AdminUserActivityLogView.as_view(), name='admin-user-activity-log'),
    path('admin/interactions/', InteractionTrendView.as_view(), name='admin-interactions'),
    path('admin/settings/', SettingsView.as_view(), name='admin-settings'),
    path('admin/update/settings/', UpdateSettingsView.as_view(), name='update-admin-settings'),
    path('moderator/settings/<int:community_id>/', ModeratorSettingsDetailView.as_view(), name='moderator-settings'),


    path('recommendations/posts/', PostRecommendationView.as_view(), name='post-recommendations'),
    path('recommendations/activities/', ActivityRecommendationView.as_view(), name='activity-recommendations'),

    path('recommendations/combined-posts/', CombinedPostView.as_view(), name='combined-posts'),
    path('recommendations/combined-activities/', CombinedActivityView.as_view(), name='combined-activities'),

    # path('check_profanity/', ProfanityCheckView.as_view(), name='check_profanity'),
]
