from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField


class User(AbstractUser):
    # Add any additional fields here
    student_number = models.IntegerField(unique=True, null=False)
    first_name = models.CharField(max_length=200, null=False, blank=False)
    last_name = models.CharField(max_length=200, null=False, blank=False)
    email = models.CharField(max_length=200, null=False, blank=False, unique=True)
    program = models.CharField(max_length=200, null=True, blank=True)
    registration_form = models.ImageField(upload_to='reg_forms/', null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    interests = ArrayField(models.CharField(max_length=200), blank=True, null=True)
    bio = models.TextField(null=True, blank=True)
    pass

class Community(models.Model):
    name = models.CharField(max_length=255)
    imgURL = models.CharField(max_length=255, blank=True, null=True)
    bannerURL = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    rules = models.TextField()
    keyword = models.CharField(max_length=255)
    owned_by = models.ForeignKey(User, to_field='student_number', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Membership(models.Model):
    user = models.ForeignKey(User, to_field='student_number', on_delete=models.CASCADE)
    community = models.ForeignKey(Community, to_field='id', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.community.name}"
# Create your models here.
