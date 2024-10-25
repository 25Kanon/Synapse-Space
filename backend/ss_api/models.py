from django.contrib.contenttypes.fields import GenericForeignKey
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.contrib.contenttypes.models import ContentType
import pyotp


class User(AbstractUser):
    # Add any additional fields here
    student_number = models.IntegerField(unique=True, null=True)
    first_name = models.CharField(max_length=200, null=False, blank=False)
    last_name = models.CharField(max_length=200, null=False, blank=False)
    email = models.CharField(max_length=200, null=False, blank=False, unique=True)
    program = models.CharField(max_length=200, null=True, blank=True)
    registration_form = models.URLField(max_length=None, null=True, blank=True)
    profile_pic = models.URLField(max_length=None, null=True, blank=True)
    interests = ArrayField(models.CharField(max_length=200), blank=True, null=True)
    bio = models.TextField(null=True, blank=True)
    otp_secret = models.CharField(max_length=32, default=pyotp.random_base32)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_google = models.BooleanField(default=True)
    pass

class Community(models.Model):
    name = models.CharField(max_length=255)
    imgURL = models.CharField(max_length=255, blank=True, null=True)
    bannerURL = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    rules = models.TextField()
    keyword = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Post(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, to_field='student_number', on_delete=models.CASCADE)
    posted_in = models.ForeignKey(Community, on_delete=models.CASCADE)

class Membership(models.Model):
    user = models.ForeignKey(User, to_field='student_number', on_delete=models.CASCADE)
    community = models.ForeignKey(Community, to_field='id', on_delete=models.CASCADE)
    role = models.CharField(max_length=255, default='member')

    def __str__(self):
        return f"{self.user.username} - {self.community.name}"

class Likes(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

class Comment(models.Model):
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
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
    object_id = models.PositiveIntegerField()
    concerning = GenericForeignKey('content_type', 'object_id')

    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=255, default='pending')
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    resolved_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resolved_reports', null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Report by {self.author.username} on {self.type}: {self.reason}"


