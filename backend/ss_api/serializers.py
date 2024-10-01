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

class CustomTokenObtainPairSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username_or_email = data.get('username_or_email')
        password = data.get('password')

        if username_or_email and password:
            user = self.authenticate_user(username_or_email, password)
            if user:
                data = self.get_token_data(user)
            else:
                raise serializers.ValidationError(_('Invalid credentials'))
        else:
            raise serializers.ValidationError(_("Must include 'username_or_email' and 'password'"))

        return data

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

class CreatePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'created_by', 'posted_in']
        read_only_fields = ['created_by']

    def create(self, validated_data):
        return Post.objects.create(**validated_data)



class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

    def validate_image(self, value):
        # Add any validation you want here (e.g., file size, format)
        return value


class CommunityPostSerializer(serializers.ModelSerializer):
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
    class Meta:
        model = Comment
        fields = ['comment', 'created_at']

class SavedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedPost
        fields = ['post', 'created_at']

class LikedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikedPost
        fields = ['post', 'created_at']