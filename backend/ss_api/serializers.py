import logging
import os

import pyotp
import requests
from django.contrib.contenttypes.models import ContentType
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt import tokens, views as jwt_views, serializers as jwt_serializers, exceptions as jwt_exceptions
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken


from .models import (User, Community, Membership,
                     Post, Comment, SavedPost, LikedPost,
                     Reports, FriendRequest, Program,
                     Notification)

from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
import pyotp
from azure.communication.email import EmailClient
from azure.core.exceptions import HttpResponseError
import time
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode

logger = logging.getLogger(__name__)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'student_number', 'first_name', 'last_name', 'email', 'username', 'bio', 'profile_pic', 'profile_banner', 'password']
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure the password is write-only
        }

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # Hash the password
        user.save()
        return user

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'password']
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
        refresh = RefreshToken.for_user(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user.username,
            'student_number': user.student_number
        }

        # Add custom claims
        refresh.access_token['username'] = user.username

        return data

    def generate_otp(self, user):
        totp = pyotp.TOTP(user, interval=300)
        return totp.now()

    @staticmethod
    def send_otp(body, to_email, username):
        print(body)
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
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        # Add any other custom claims you want to include in the token

        return token

class VerifyAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','student_number', 'username','registration_form', 'profile_pic', 'interests', 'bio', 'program', 'is_verified', 'is_rejected', 'is_staff']

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        return data
        
class CookieTokenRefreshSerializer(jwt_serializers.TokenRefreshSerializer):
    refresh = None

    def validate(self, attrs):
        attrs['refresh'] = self.context['request'].COOKIES.get('refresh')
        if attrs['refresh']:
            try:
                # Add this line for debugging
                print(f"Refresh token from cookie: {attrs['refresh']}")
                
                return super().validate(attrs)
            except TokenError as e:
                # Add more detailed error handling
                print(f"TokenError: {str(e)}")
                raise jwt_exceptions.InvalidToken(f"Token is invalid or expired: {str(e)}")
        else:
            raise jwt_exceptions.InvalidToken('No valid token found in cookie \'refresh_token\'')

    # Add this method to verify the token manually
    def verify_token(self, token):
        from rest_framework_simplejwt.tokens import RefreshToken
        try:
            RefreshToken(token)
            return True
        except TokenError:
            return False  

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
        fields = ['id', 'name', 'description', 'rules', 'keyword', 'imgURL', 'bannerURL']


class CreateMembership(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = ['user', 'community']

class MembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    userAvatar = serializers.CharField(source='user.profile_pic', read_only=True)
    user_id = serializers.CharField(source='user.id', read_only=True, required=False)
    community = serializers.PrimaryKeyRelatedField(queryset=Community.objects.all())
    community_name = serializers.CharField(source='community.name', read_only=True)
    community_avatar = serializers.CharField(source='community.imgURL', read_only=True)
    status = serializers.CharField( read_only=True)

    class Meta:
        model = Membership
        fields = ['id', 'username', 'userAvatar', 'community', 'community_name', 'community_avatar', 'user_id', 'status']

class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ['id','bannerURL','imgURL','name', 'description', 'rules', 'keyword', 'privacy']

        def update(self, instance, validated_data):
            # Handle update logic
            if 'imgURL' in validated_data:
                instance.imgURL = validated_data['imgURL']
            if 'bannerURL' in validated_data:
                instance.bannerURL = validated_data['bannerURL']
            if 'description' in validated_data:
                instance.description = validated_data['description']
            if 'rules' in validated_data:
                instance.rules = validated_data['rules']
            if 'keyword' in validated_data:
                instance.keyword = validated_data['keyword']
            instance.save()
            return instance

class CommunityWithScoreSerializer(serializers.ModelSerializer):
    similarity_score = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Community
        fields = ['id', 'bannerURL', 'imgURL', 'name', 'description', 'rules', 'keyword', 'similarity_score']

    def to_representation(self, instance):
        # Add the similarity_score from the context
        representation = super().to_representation(instance)
        similarity_score = self.context.get('similarity_score')
        if similarity_score is not None:
            representation['similarity_score'] = similarity_score
        return representation



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
    userAvatar = serializers.CharField(source='created_by.profile_pic', read_only=True)
    isPinned = serializers.BooleanField(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'created_at', 'created_by', 'created_by_username', 'posted_in', 'userAvatar', 'isPinned']

    def get_created_by_username(self, obj):
        return obj.created_by.username

class getCommunityPostSerializer(serializers.ModelSerializer):
    created_by_username = serializers.SerializerMethodField()
    userAvatar = serializers.CharField(source='created_by.profile_pic', read_only=True)
    isPinned = serializers.BooleanField(read_only=True)
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'created_at', 'created_by', 'created_by_username', 'posted_in', 'userAvatar', 'isPinned']

    def get_created_by_username(self, obj):
        return obj.created_by.username


class PostSerializer(serializers.ModelSerializer):
    author_pic = serializers.SerializerMethodField()

    created_by_username = serializers.CharField(source="created_by.username")
    community_name = serializers.CharField(source="posted_in.name")
    class Meta:
        model = Post
        fields = [ 'id', 'title','content', 'created_at', 'created_by', 'author_pic', 'posted_in', 'created_by_username', 'community_name']


    def get_created_by_username(self, obj):
        return obj.created_by.username

    def get_community_name(self, obj):
        return obj.posted_in.name
    def get_author_pic(self, obj):
        return obj.created_by.profile_pic
    
class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    author = serializers.CharField(source='author.username', read_only=True)
    author_pic = serializers.SerializerMethodField()

    post_title = serializers.CharField(source="post.title", read_only=True)
    post_community = serializers.CharField(source="post.posted_in.name", read_only=True)
    post_community_id = serializers.IntegerField(source="post.posted_in.id", read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 'post_id', 'post_title', 'post_community_id', 'post_community', 'parent', 'post', 'replies', 'author_pic']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'author_pic']

    def get_replies(self, obj):
        replies = Comment.objects.filter(parent=obj)
        return CommentSerializer(replies, many=True).data

    def get_author_pic(self, obj):
        return obj.author.profile_pic



class CreateCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content', 'parent', 'post']

class SavedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedPost
        fields = ['post', 'created_at']

class LikedPostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    author_pic = serializers.SerializerMethodField()

    class Meta:
        model = LikedPost
        fields = ['user', 'post', 'created_at', 'username', 'author_pic']


    def get_username(self, obj):
        return obj.user.username
    def get_author_pic(self, obj):
        return obj.user.profile_pic
        
class ReportsSerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(
        queryset=ContentType.objects.all(),
        slug_field='model'
    )
    object_id = serializers.IntegerField()
    concerning = serializers.SerializerMethodField()
    reports = serializers.SerializerMethodField()
    author = serializers.CharField(source='author.username', read_only=True)
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    comment_post_id = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all(), required=False)

    class Meta:
        model = Reports
        fields = [
            'id', 'type', 'content', 'author', 'reason', 'timestamp',
            'reports', 'status', 'content_type', 'object_id', 'concerning', 'community', 'comment_post_id'
        ]

    def get_concerning(self, obj):
        # Return only the ID of the concerning object
        return obj.object_id

    def get_reports(self, obj):
        # Count the total number of reports related to this concerning object
        return Reports.objects.filter(
            content_type=obj.content_type,
            object_id=obj.object_id
        ).count()

    def create(self, validated_data):
        # Set the author to the current user
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
    
class FriendRequestSerializer(serializers.ModelSerializer):
    sender_profile_pic = serializers.CharField(source='sender.profile_pic', read_only=True)
    receiver_profile_pic = serializers.CharField(source='receiver.profile_pic', read_only=True)
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'sender_profile_pic', 'receiver_profile_pic', 'sender_name', 'receiver_name', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at', 'sender']  # Mark `sender` as read-only here

    def get_sender_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}"

    def get_receiver_name(self, obj):
        return f"{obj.receiver.first_name} {obj.receiver.last_name}"

    def validate(self, data):
        # Set the sender to the authenticated user after other validations
        data['sender'] = self.context['request'].user
        return data

    def create(self, validated_data):
        # The `sender` will already be set in `validate`, so proceed with creation
        return super().create(validated_data)


class FriendSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'profile_pic', 'username', 'email', 'last_active']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name']
        extra_kwargs = {
            'id': {'read_only': True}
        }

class DetailedUserSerializer(serializers.ModelSerializer):
    program = ProgramSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'student_number', 'first_name', 'last_name', 'email',
            'username', 'bio', 'profile_pic', 'profile_banner', 'program',
            'interests', 'is_verified', 'last_login', 'date_joined',
            'is_superuser', 'registration_form', 'is_staff', 'is_rejected'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'student_number', 'first_name', 'last_name', 'email', 'username', 'bio', 'profile_pic', 'profile_banner', 'program', 'interests', 'is_verified', 'date_joined', 'is_superuser', 'registration_form', 'password', 'is_staff', 'is_rejected']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        print("Validated data:", validated_data)
        logger.info("Validated data: %s", validated_data)
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        user.is_google = False
        if password is not None:
            user.set_password(password)
        user.save()
        return user

class NotificationSerializer(serializers.ModelSerializer):
    community_imgURL = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at', 'community_imgURL']

    def get_community_imgURL(self, obj):
        """
        Retrieve the community image URL from the notification's message.
        Assumes `message` contains `community_id`.
        """
        community_id = obj.message.get('community_id')
        if community_id:
            try:
                community = Community.objects.get(id=community_id)
                return community.imgURL
            except Community.DoesNotExist:
                return None
        return None
    
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            self.user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user is associated with this email.")
        return value

    def send_reset_email(self, reset_link):
        try:
            connection_string = os.getenv('AZURE_ACS_CONNECTION_STRING')
            email_client = EmailClient.from_connection_string(connection_string)
            sender = os.getenv('AZURE_ACS_SENDER_EMAIL')

            message = {
                "content": {
                    "subject": "Password Reset Request",
                    "plainText": f"Click the link below to reset your password:\n{reset_link}",
                },
                "recipients": {
                    "to": [{"address": self.user.email, "displayName": self.user.username}]
                },
                "senderAddress": sender,
            }
            print(message)
            response = email_client.begin_send(message)
            return response

        except HttpResponseError as ex:
            raise serializers.ValidationError(f"Failed to send email: {str(ex)}")

    def save(self):
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        reset_link = f"{os.getenv('FRONTEND_URL')}/reset-password/{uid}/{token}/"
        self.send_reset_email(reset_link)
        return reset_link
    
class PasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    uid = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user_id = force_bytes(urlsafe_base64_decode(data['uid'])).decode()
            self.user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError):
            raise serializers.ValidationError("Invalid user ID or token.")

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(self.user, data['token']):
            raise serializers.ValidationError("Invalid or expired token.")
        return data

    def save(self):
        self.user.set_password(self.validated_data['password'])
        self.user.save()