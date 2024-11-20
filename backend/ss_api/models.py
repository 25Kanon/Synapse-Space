from django.contrib.contenttypes.fields import GenericForeignKey
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.contrib.contenttypes.models import ContentType
from django.utils.timezone import now
import pyotp

from django.db.models import JSONField

class Program(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class User(AbstractUser):
    # Add any additional fields here
    student_number = models.IntegerField(unique=True, null=True)
    first_name = models.CharField(max_length=200, null=False, blank=False)
    last_name = models.CharField(max_length=200, null=False, blank=False)
    email = models.CharField(max_length=200, null=False, blank=False, unique=True)
    program = models.ForeignKey(Program, max_length=200, null=True, blank=True, on_delete=models.SET_NULL)
    registration_form = models.URLField(max_length=None, null=True, blank=True)
    profile_pic = models.URLField(max_length=None, null=True, blank=True)
    profile_banner = models.URLField(max_length=None, null=True, blank=True)
    interests = ArrayField(models.CharField(max_length=200), blank=True, null=True)
    bio = models.TextField(null=True, blank=True)
    otp_secret = models.CharField(max_length=32, default=pyotp.random_base32)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_google = models.BooleanField(default=False)
    is_rejected = models.BooleanField(null=True)
    last_active = models.DateTimeField(default=now)
    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.is_verified = True
            self.is_staff = True
        super().save(*args, **kwargs)
        
    def is_online(self):
        """Check if the user is considered online (e.g., active in the last 5 minutes)."""
        from datetime import timedelta
        return now() - self.last_active < timedelta(minutes=5)


class Community(models.Model):
    name = models.CharField(max_length=255)
    imgURL = models.CharField(max_length=255, blank=True, null=True)
    bannerURL = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    rules = models.TextField()
    keyword = ArrayField(models.CharField(max_length=200), blank=True)
    privacy = models.CharField(max_length=255, default='public')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def is_admin_or_moderator(self, user):
        """Check if the user has an admin or moderator role in this community."""
        return Membership.objects.filter(
            user=user,
            community=self,
            role__in=['admin', 'moderator']
        ).exists()

    def is_community_admin(self, user):
        """Check if the user has an admin or moderator role in this community."""
        return Membership.objects.filter(
            user=user,
            community=self,
            role__in=['admin']
        ).exists()


class Post(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, to_field='id', on_delete=models.SET_NULL, null=True)
    posted_in = models.ForeignKey(Community, on_delete=models.CASCADE )
    isPinned = models.BooleanField(default=False)


class Membership(models.Model):
    user = models.ForeignKey(User, to_field='id', on_delete=models.CASCADE)
    community = models.ForeignKey(Community, to_field='id', on_delete=models.CASCADE)
    role = models.CharField(max_length=255, default='member')
    status = models.CharField(max_length=255, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.community.name}"


class Likes(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)


class Comment(models.Model):
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    post = models.ForeignKey('Post', on_delete=models.CASCADE)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.id}"


class SavedPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class LikedPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_posts')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='liked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_user_post_like')
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        Likes.objects.get_or_create(user=self.user, post=self.post)


class Reports(models.Model):
    REPORT_TYPES = [
        ('post', 'Post'),
        ('comment', 'Comment'),
        ('user', 'User'),
    ]

    type = models.CharField(max_length=255, choices=REPORT_TYPES)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    comment_post_id = models.ForeignKey(Post, on_delete=models.CASCADE, null=True)
    object_id = models.PositiveIntegerField()
    concerning = GenericForeignKey('content_type', 'object_id')

    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=255, default='pending')
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='resolved_reports', null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Report by {self.author.username} on {self.type}: {self.reason}"


class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    sender = models.ForeignKey(User, related_name='sent_friend_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_friend_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Friend request from {self.sender} to {self.receiver} ({self.status})"

    class Meta:
        unique_together = ('sender', 'receiver')  # A user cannot send multiple requests to the same user


class Friendship(models.Model):
    user1 = models.ForeignKey(User, related_name='friendships1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='friendships2', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user1} is friends with {self.user2}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = JSONField()  # Store the message as a JSON object
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - {self.title}"