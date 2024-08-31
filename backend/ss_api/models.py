from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField


class Student(AbstractUser):
    # Add any additional fields here
    student_id = models.IntegerField(unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=200, null=False, blank=False)
    last_name = models.CharField(max_length=200, null=False, blank=False)
    program = models.CharField(max_length=200, null=True, blank=True)
    registration_form = models.ImageField(upload_to='reg_forms/', null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    interests = ArrayField(models.CharField(max_length=200), blank=True, null=True)
    bio = models.TextField(null=True, blank=True)
    pass
# Create your models here.
