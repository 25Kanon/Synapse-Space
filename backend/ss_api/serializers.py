import os

import pyotp
import requests
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken


from .models import (User, Community, Membership, 
                     Post, Comment, SavedPost, LikedPost,)

from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
import pyotp
from azure.communication.email import EmailClient
from azure.core.exceptions import HttpResponseError
import time

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'student_number', 'username', 'first_name', 'last_name', 'registration_form', 'email', 'password', 'profile_pic', 'interests', 'bio']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['student_number', 'first_name', 'last_name', 'email', 'username', 'password']
        extra_kwargs = {
            'student_number': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'username': {'required': True},
            'email': {'required': True},
            'password': {'required': True, 'write_only': True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            student_number=validated_data['student_number'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return user

last_otp_generation = {}
failed_login_attempts = {}
lockout_times = {}

class CustomTokenObtainPairSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True, required=False)

    def validate(self, data):
        username_or_email = data.get('username_or_email')
        password = data.get('password')
        otp = data.get('otp')

        if not username_or_email or not password:
            raise serializers.ValidationError(_("Must include 'username_or_email' and 'password'"))

        user = self.authenticate_user(username_or_email, password)
        if not user:
            failed_attempts = failed_login_attempts.get(username_or_email, 0)
            failed_attempts += 1
            failed_login_attempts[username_or_email] = failed_attempts

            if failed_attempts >= 3:
                # Raise a validation error and lock the user out for 10 minutes
                lockout_times[username_or_email] = time.time() + 600  # Store the lockout time
                raise serializers.ValidationError(_("Maximum login attempts exceeded. Please try again later."))

            raise serializers.ValidationError(_('Invalid credentials'))

        # Reset the failed login attempts count for the user
        failed_login_attempts[username_or_email] = 0

        # Check if the user is currently locked out
        lockout_time = lockout_times.get(username_or_email)
        if lockout_time and lockout_time > time.time():
            raise serializers.ValidationError(_("User is currently locked out. Please try again later."))

        if not otp:
            last_generation_time = last_otp_generation.get(user.id)
            if last_generation_time and time.time() - last_generation_time < 60:
                raise serializers.ValidationError(_("OTP generation is rate-limited. Please try again later."))

            totp = self.generate_otp(user.otp_secret)
            body = f"Your OTP is: {totp}"
            self.send_otp(body, user.email, user.username)

            # Update the last OTP generation time for the user
            last_otp_generation[user.id] = time.time()

            return {'message': 'OTP required'}

        totp = pyotp.TOTP(user.otp_secret, interval=300)
        if not totp.verify(otp):
            raise serializers.ValidationError(_(totp.now()))

        return self.get_token_data(user)

    def authenticate_user(self, username_or_email, password):
        """
        Authenticate the user by either username or email.
        """
        user = authenticate(username=username_or_email, password=password)

        if not user:
            UserModel = get_user_model()
            try:
                user_obj = UserModel.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except UserModel.DoesNotExist:
                return None

        return user

    def get_token_data(self, user):
        """
        Generate token pair with additional custom claims if needed.
        """
        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': str(refresh.access_token['username']),
            'student_number': str(refresh.access_token['student_number'])
        }

        # Add any custom claims to the access token here
        # Example: refresh.access_token['attribute'] = "value"

        return data

    def generate_otp(self, user):
        totp = pyotp.TOTP(user, interval=300)
        return totp.now()

    def send_otp(self, body, to_email, username):
        connection_string = os.getenv('AZURE_ACS_CONNECTION_STRING')
        email_client = EmailClient.from_connection_string(connection_string)
        sender = os.getenv('AZURE_ACS_SENDER_EMAIL')
        recipient_email = to_email
        message = {
            "content":  {
                'subject': 'One Time Password for Synapse Space',
                "plainText": body,
            },
             "recipients": {
                "to": [
                    {
                        "address": recipient_email,
                        "displayName": username
                    }
                ]
            },
            "senderAddress": sender
        }

        try:
            response = email_client.begin_send(message)
        except HttpResponseError as ex:
            print('Exception:')
            print(ex)
            raise Exception(ex)

    @classmethod
    def get_token(cls, user):
        """
        Override this method to add custom claims to the token.
        """
        token = RefreshToken.for_user(user)
        token['username'] = user.username
        token['student_number'] = user.student_number

        # Add custom claims here if required in the future
        # Example: token['custom_claim'] = "custom_value"

        return token
class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, data):
        refresh = data.get('refresh')
        if not refresh:
            raise serializers.ValidationError("Refresh token is required")
        return data

class CreateCommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ['id', 'name', 'description', 'rules', 'keyword', 'owned_by', 'imgURL', 'bannerURL']


class CreateMembership(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = ['user', 'community']

class MembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)
    community_avatar = serializers.CharField(source='community.imgURL', read_only=True)

    class Meta:
        model = Membership
        fields = ['username','community', 'community_name', 'community_avatar']

class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ['id','bannerURL','imgURL','name', 'description', 'rules', 'keyword', 'owned_by']
class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

    def validate_image(self, value):
        # Add any validation you want here (e.g., file size, format)
        return value

class CreatePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'posted_in']

    def validate(self, data):
        if not data.get('title'):
            raise serializers.ValidationError("Title is required")
        if not data.get('content'):
            raise serializers.ValidationError("Content is required")
        if not data.get('posted_in'):
            raise serializers.ValidationError("A community must be selected")
        return data

class CommunityPostSerializer(serializers.ModelSerializer):
    created_by_username = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'created_at', 'created_by', 'created_by_username', 'posted_in']

    def get_created_by_username(self, obj):
        return obj.created_by.username

class getCommunityPostSerializer(serializers.ModelSerializer):
    created_by_username = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'created_at', 'created_by', 'created_by_username', 'posted_in']

    def get_created_by_username(self, obj):
        return obj.created_by.username

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    author = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 'parent', 'post', 'replies']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def get_replies(self, obj):
        replies = Comment.objects.filter(parent=obj)
        return CommentSerializer(replies, many=True).data
class CreateCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content', 'parent', 'post']

class SavedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedPost
        fields = ['post', 'created_at']

class LikedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikedPost
        fields = ['user', 'post', 'created_at']