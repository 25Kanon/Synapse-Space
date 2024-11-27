import logging
import os

import pyotp
import requests
from django.contrib.contenttypes.models import ContentType
from django.core.cache import cache
from django.utils.timezone import now
from rest_framework_simplejwt.exceptions import TokenError
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
                     Notification, DislikedPost, Feedback, SystemSetting,
                     ModeratorSettings)


from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode

from django.contrib.auth import authenticate, get_user_model
from django.core.cache import cache
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.translation import gettext_lazy as _
import pyotp
import os
from azure.communication.email import EmailClient
from azure.core.exceptions import HttpResponseError
import base64
from django.utils.timezone import now

logger = logging.getLogger(__name__)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'student_number', 'first_name', 'last_name', 'email', 'username', 'bio', 'profile_pic', 'profile_banner', 'interests', 'password']
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure the password is write-only
        }
        
def validate_interests(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Interests must be a list of strings.")
        return value

def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # Hash the password
        user.save()
        return user


def generate_unique_username(first_name, last_name):
    base_username = f"{first_name.lower()}.{last_name.lower()}"
    while User.objects.filter(username=base_username).exists():
        base_username = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 9999)}"
    return base_username


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password']
        extra_kwargs = {
            'student_number': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'password': {'required': True, 'write_only': True},
        }


    def create(self, validated_data):
        if 'username' not in validated_data or not validated_data['username']:
            validated_data['username'] = generate_unique_username(validated_data['first_name'], validated_data['last_name'])
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return user


def get_setting(key, default=None):

    value = cache.get(key)
    if value is None:
        try:
            # Fetch from the database and update the cache
            value = SystemSetting.objects.get(key=key).value
            cache.set(key, value, timeout=3600)  # Cache for 1 hour
        except SystemSetting.DoesNotExist:
            value = default
    return value


def is_valid_email(email):
    # A simple regex for validating an email format
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None


def filterAllowedEmailDomains(username_or_email):
    # If it's an email, check if the domain is allowed
    if is_valid_email(username_or_email):
        allowed_domains = get_setting("ALLOWED_DOMAIN", "tip.edu.ph")
        allowed_domains = allowed_domains.split(",")
        allowed_domains = [domain.strip() for domain in allowed_domains]

        # Extract domain from the email
        domain = username_or_email.split('@')[-1]

        # Check if domain is allowed
        if domain not in allowed_domains:
            raise serializers.ValidationError({
                "message": _("Invalid email domain. Please try using an email issued by TIP.")
            })

        return username_or_email  # Return the email if it's valid

    else:
        # If it's not an email, treat it as a username (no domain check)
        return username_or_email


class CustomTokenObtainPairSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True, required=False)

    def validate(self, data):
        username_or_email = data.get('username_or_email')
        password = data.get('password')
        otp = data.get('otp')

        # Fetch settings dynamically
        MAX_LOGIN_ATTEMPTS = self.get_int_setting("MAX_LOGIN_ATTEMPTS", 3)
        LOCKOUT_DURATION = self.get_float_setting("LOCKOUT_DURATION", 600)
        OTP_RATE_LIMIT = self.get_int_setting("OTP_RATE_LIMIT", 60)
        OTP_INTERVAL = self.get_float_setting("OTP_INTERVAL", 300)

        # Check for required fields
        if not username_or_email or not password:
            raise serializers.ValidationError({
                "message": _("Both 'username_or_email' and 'password' are required.")
            })

        # Check if the user is locked out
        if self.is_locked_out(username_or_email, LOCKOUT_DURATION):
            raise serializers.ValidationError({
                "message": _(
                    f"Your account is locked due to {MAX_LOGIN_ATTEMPTS} failed login attempts. Please try again after {LOCKOUT_DURATION // 60} minutes."
                )
            })

        # Authenticate the user
        filterAllowedEmailDomains(username_or_email)

        user = self.authenticate_user(username_or_email, password)

        if not user:
            if self.track_failed_login(username_or_email, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION):
                raise serializers.ValidationError({
                    "message": _(f"Maximum({MAX_LOGIN_ATTEMPTS}) login attempts exceeded. Please try again after 10 minutes.")
                })
            raise serializers.ValidationError({
                "message": _("Invalid credentials. Please check your username or password.")
            })

        if user.is_google:
            raise serializers.ValidationError({
                "message": _("Please login with Google.")
            })


        if user.is_staff:
            raise serializers.ValidationError({
                "message": _("Invalid credentials. Please check your username or password.")
            })

        # Reset failed attempts after successful login
        self.reset_failed_login(username_or_email)

        # Handle OTP generation and verification
        if not otp:
            last_otp_time = cache.get(f"otp_generation:{user.id}")
            if last_otp_time and (now().timestamp() - last_otp_time) < OTP_RATE_LIMIT:
                raise serializers.ValidationError({
                    "message": _("OTP generation is rate-limited. Please try again in a minute.")
                })

            # Validate and generate OTP
            if not self.is_valid_secret(user.otp_secret):
                raise serializers.ValidationError({"message": _("Invalid OTP secret. Please contact support.")})

            totp = self.generate_otp(user.otp_secret, OTP_INTERVAL)
            body = f"Your OTP is: {totp}"
            self.send_otp(body, user.email, user.username)

            # Store OTP generation time in cache
            cache.set(f"otp_generation:{user.id}", now().timestamp(), OTP_RATE_LIMIT)
            return {'message': 'OTP required'}

        # Verify the provided OTP
        if not self.verify_otp(user.otp_secret, otp, OTP_INTERVAL):
            raise serializers.ValidationError({
                "message": _("The OTP you entered is incorrect or expired. Please try again.")
            })

        # Return token data upon successful OTP verification
        self.reset_failed_login(username_or_email)
        return self.get_token_data(user)

    def get_int_setting(self, key, default):
        """
        Helper function to retrieve a setting and convert it to an integer.
        If conversion fails, return the default value.
        """
        value = get_setting(key, default)
        try:
            return int(value)
        except (ValueError, TypeError):
            # Log the error for debugging if needed
            raise serializers.ValidationError({
                "message": _(f"Setting '{key}' is invalid or not an integer. Using default value.")
            })

    def get_float_setting(self, key, default):
        """
        Helper function to retrieve a setting and convert it to a float.
        If conversion fails, return the default value.
        """
        value = get_setting(key, default)
        try:
            return float(value)
        except (ValueError, TypeError):
            raise serializers.ValidationError({
                "message": _(f"Setting '{key}' is invalid or not a float. Using default value.")
            })

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

    def generate_otp(self, user_secret, otp_interval):
        """
        Generate a time-based OTP using the user's secret.
        """
        try:
            totp = pyotp.TOTP(user_secret, interval=otp_interval)
            generated_otp = totp.now()
            return generated_otp
        except Exception as e:
            raise serializers.ValidationError({"message": _("Error generating OTP. Please try again later.")})

    def verify_otp(self, user_secret, otp, otp_interval):
        """
        Verify the provided OTP against the user's secret.
        """
        try:
            totp = pyotp.TOTP(user_secret, interval=otp_interval)
            is_valid = totp.verify(otp)
            return is_valid
        except Exception as e:
            return False

    def is_valid_secret(self, secret):
        """
        Validate the user's OTP secret to ensure it is a valid Base32 string.
        """
        try:
            base64.b32decode(secret)
            return True
        except Exception as e:
            return False

    @staticmethod
    def send_otp(body, to_email, username):
        """
        Send the OTP to the user's email using Azure Communication Services.
        """
        connection_string = os.getenv('AZURE_ACS_CONNECTION_STRING')
        email_client = EmailClient.from_connection_string(connection_string)
        sender = os.getenv('AZURE_ACS_SENDER_EMAIL')
        # print(body)
        message = {
            "content": {
                'subject': 'One Time Password for Synapse Space',
                "plainText": body,
            },
            "recipients": {
                "to": [
                    {
                        "address": to_email,
                        "displayName": username
                    }
                ]
            },
            "senderAddress": sender
        }

        try:
            email_client.begin_send(message)
        except HttpResponseError as ex:
            raise serializers.ValidationError({"message": _("Failed to send OTP. Please try again later.")})

    def track_failed_login(self, username_or_email, max_attempts, lockout_duration):
        """
        Increment failed login attempts and lock the account if attempts exceed the limit.
        """
        attempts_key = f"failed_attempts:{username_or_email}"
        lockout_key = f"lockout:{username_or_email}"

        # Ensure lockout_duration is a valid number (float or int)
        lockout_duration = float(lockout_duration)  # Convert to float
        max_attempts = int(max_attempts)  # Convert to int
        attempts = cache.get(attempts_key, 0) + 1
        cache.set(attempts_key, attempts, lockout_duration)  # Set the attempts with the lockout_duration as timeout

        if attempts >= max_attempts:
            cache.set(lockout_key, True, lockout_duration)  # Lockout the user for the specified duration
            return True  # User is now locked out
        return False

    def is_locked_out(self, username_or_email, lockout_duration):
        """
        Check if the user is currently locked out.
        """
        lockout_key = f"lockout:{username_or_email}"
        return cache.get(lockout_key) is not None

    def reset_failed_login(self, username_or_email):
        """
        Reset the failed login attempts and lockout status for the user.
        """
        attempts_key = f"failed_attempts:{username_or_email}"
        lockout_key = f"lockout:{username_or_email}"
        cache.delete(attempts_key)
        cache.delete(lockout_key)


class CustomTokenObtainPairSerializerStaff(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True, required=False)

    def validate(self, data):
        username_or_email = data.get('username_or_email')
        password = data.get('password')
        otp = data.get('otp')

        # Fetch settings dynamically
        MAX_LOGIN_ATTEMPTS = self.get_int_setting("MAX_LOGIN_ATTEMPTS", 3)
        LOCKOUT_DURATION = self.get_float_setting("LOCKOUT_DURATION", 600)
        OTP_RATE_LIMIT = self.get_int_setting("OTP_RATE_LIMIT", 60)
        OTP_INTERVAL = self.get_float_setting("OTP_INTERVAL", 300)

        # Check for required fields
        if not username_or_email or not password:
            raise serializers.ValidationError({
                "message": _("Both 'username_or_email' and 'password' are required.")
            })

        # Check if OTP interval is a valid number
        if OTP_INTERVAL <= 0:
            raise serializers.ValidationError({
                "message": _("Invalid OTP interval configuration. It must be a positive number.")
            })

        # Check for required fields
        if not username_or_email or not password:
            raise serializers.ValidationError({
                "message": _("Both 'username_or_email' and 'password' are required.")
            })

        # Check if the user is locked out
        if self.is_locked_out(username_or_email, LOCKOUT_DURATION):
            raise serializers.ValidationError({
                "message": _(
                    f"Your account is locked due to {MAX_LOGIN_ATTEMPTS} failed login attempts. Please try again after {LOCKOUT_DURATION // 60} minutes."
                )
            })

        filterAllowedEmailDomains(username_or_email)
        # Authenticate the user
        user = self.authenticate_user(username_or_email, password)
        if not user:
            if self.track_failed_login(username_or_email, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION):
                raise serializers.ValidationError({
                    "message": _(f"Maximum login({MAX_LOGIN_ATTEMPTS}) attempts exceeded. Please try again after 10 minutes.")
                })
            raise serializers.ValidationError({
                "message": _("Invalid credentials. Please check your username or password.")
            })

        if user.is_google:
            raise serializers.ValidationError({
                "message": _("Please login with Google.")
            })



        if not user.is_staff:
            raise serializers.ValidationError({
                "message": _("You are not authorized to login here.")
            })

        # Reset failed attempts after successful login
        self.reset_failed_login(username_or_email)

        # Handle OTP generation and verification
        if not otp:
            last_otp_time = cache.get(f"otp_generation:{user.id}")
            if last_otp_time and (now().timestamp() - last_otp_time) < OTP_RATE_LIMIT:
                raise serializers.ValidationError({
                    "message": _("OTP generation is rate-limited. Please try again in a minute.")
                })

            # Validate and generate OTP
            if not self.is_valid_secret(user.otp_secret):
                raise serializers.ValidationError({"message": _("Invalid OTP secret. Please contact support.")})

            totp = self.generate_otp(user.otp_secret, OTP_INTERVAL)
            body = f"Your OTP is: {totp}"
            self.send_otp(body, user.email, user.username)

            # Store OTP generation time in cache
            cache.set(f"otp_generation:{user.id}", now().timestamp(), OTP_RATE_LIMIT)
            return {'message': 'OTP required'}

        # Verify the provided OTP
        if not self.verify_otp(user.otp_secret, otp, OTP_INTERVAL):
            raise serializers.ValidationError({
                "message": _("The OTP you entered is incorrect or expired. Please try again.")
            })

        # Return token data upon successful OTP verification
        self.reset_failed_login(username_or_email)
        return self.get_token_data(user)


    def get_int_setting(self, key, default):
        """
        Helper function to retrieve a setting and convert it to an integer.
        If conversion fails, return the default value.
        """
        value = get_setting(key, default)
        try:
            return int(value)
        except (ValueError, TypeError):
            # Log the error for debugging if needed
            raise serializers.ValidationError({
                "message": _(f"Setting '{key}' is invalid or not an integer. Using default value.")
            })


    def get_float_setting(self, key, default):
        """
        Helper function to retrieve a setting and convert it to a float.
        If conversion fails, return the default value.
        """
        value = get_setting(key, default)
        try:
            return float(value)
        except (ValueError, TypeError):
            raise serializers.ValidationError({
                "message": _(f"Setting '{key}' is invalid or not a float. Using default value.")
            })


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

    def generate_otp(self, user_secret, otp_interval):
        """
        Generate a time-based OTP using the user's secret.
        """
        try:
            totp = pyotp.TOTP(user_secret, interval=otp_interval)
            generated_otp = totp.now()
            return generated_otp
        except pyotp.exceptions.InvalidSecretKey:
            raise serializers.ValidationError({"message": _("Invalid OTP secret. Please contact support.")})
        except Exception as e:
            # Log the exception or print for debugging
            print(f"Error generating OTP: {e}")
            raise serializers.ValidationError({"message": _("Error generating OTP. Please try again later.")})

    def verify_otp(self, user_secret, otp, otp_interval):
        """
        Verify the provided OTP against the user's secret.
        """
        try:
            totp = pyotp.TOTP(user_secret, interval=otp_interval)
            is_valid = totp.verify(otp)
            return is_valid
        except Exception as e:
            return False

    def is_valid_secret(self, secret):
        """
        Validate the user's OTP secret to ensure it is a valid Base32 string.
        """
        try:
            base64.b32decode(secret)
            return True
        except Exception as e:
            return False

    @staticmethod
    def send_otp(body, to_email, username):
        # print(body)
        """
        Send the OTP to the user's email using Azure Communication Services.
        """
        connection_string = os.getenv('AZURE_ACS_CONNECTION_STRING')
        email_client = EmailClient.from_connection_string(connection_string)
        sender = os.getenv('AZURE_ACS_SENDER_EMAIL')

        message = {
            "content": {
                'subject': 'One Time Password for Synapse Space',
                "plainText": body,
            },
            "recipients": {
                "to": [
                    {
                        "address": to_email,
                        "displayName": username
                    }
                ]
            },
            "senderAddress": sender
        }

        try:
            email_client.begin_send(message)
        except HttpResponseError as ex:
            raise serializers.ValidationError({"message": _("Failed to send OTP. Please try again later.")})

    def track_failed_login(self, username_or_email, max_attempts, lockout_duration):
        """
        Increment failed login attempts and lock the account if attempts exceed the limit.
        """
        attempts_key = f"failed_attempts:{username_or_email}"
        lockout_key = f"lockout:{username_or_email}"

        # Ensure lockout_duration is a valid number (float or int)
        lockout_duration = float(lockout_duration)  # Convert to float
        max_attempts = int(max_attempts)  # Convert to int
        attempts = cache.get(attempts_key, 0) + 1
        cache.set(attempts_key, attempts, lockout_duration)  # Set the attempts with the lockout_duration as timeout

        if attempts >= max_attempts:
            cache.set(lockout_key, True, lockout_duration)  # Lockout the user for the specified duration
            return True  # User is now locked out
        return False

    def is_locked_out(self, username_or_email, lockout_duration):
        """
        Check if the user is currently locked out.
        """
        lockout_key = f"lockout:{username_or_email}"
        return cache.get(lockout_key) is not None

    def reset_failed_login(self, username_or_email):
        """
        Reset the failed login attempts and lockout status for the user.
        """
        attempts_key = f"failed_attempts:{username_or_email}"
        lockout_key = f"lockout:{username_or_email}"
        cache.delete(attempts_key)
        cache.delete(lockout_key)


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
    
    def validate_name(self, value):
        """Ensure the community name is unique."""
        if Community.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A community with this name already exists.")
        return value


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
        fields = ['id', 'username', 'userAvatar', 'community', 'community_name', 'community_avatar', 'user_id', 'status', 'role']

class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = [
            'id', 
            'bannerURL', 
            'imgURL', 
            'name', 
            'description', 
            'rules', 
            'keyword', 
            'privacy', 
            'member_count'
        ]

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
    reason = serializers.CharField(read_only=True, required=False)

    class Meta:
        model = Community
        fields = ['id', 'bannerURL', 'imgURL', 'name', 'description', 'rules', 'keyword', 'similarity_score', 'reason']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['similarity_score'] = self.context.get('similarity_score', None)
        representation['reason'] = self.context.get('reason', None)
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
    created_by_username = serializers.SerializerMethodField()
    community_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'created_at', 'created_by', 'author_pic',
            'posted_in', 'created_by_username', 'community_name'
        ]

    def get_created_by_username(self, obj):
        # Return username or handle missing user gracefully
        return obj.created_by.username if obj.created_by else "Unknown User"

    def get_community_name(self, obj):
        # Return community name or handle missing community gracefully
        return obj.posted_in.name if obj.posted_in else "Unknown Community"

    def get_author_pic(self, obj):
        # Return profile picture URL or a default placeholder
        return obj.created_by.profile_pic if obj.created_by and obj.created_by.profile_pic else "https://via.placeholder.com/150"
    
class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    author = serializers.CharField(source='author.username', read_only=True)
    author_pic = serializers.SerializerMethodField()
    vote_score = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()

    post_title = serializers.CharField(source="post.title", read_only=True)
    post_community = serializers.CharField(source="post.posted_in.name", read_only=True)
    post_community_id = serializers.IntegerField(source="post.posted_in.id", read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'author', 'created_at', 'updated_at',
            'post_id', 'post_title', 'post_community_id', 'post_community',
            'parent', 'post', 'replies', 'author_pic', 'vote_score', 'user_vote'
        ]
        read_only_fields = [
            'id', 'author', 'created_at', 'updated_at', 'author_pic', 'vote_score', 'user_vote'
        ]

    def get_replies(self, obj):
        replies = Comment.objects.filter(parent=obj)
        return CommentSerializer(replies, many=True, context=self.context).data

    def get_author_pic(self, obj):
        return obj.author.profile_pic

    def get_vote_score(self, obj):
        upvotes = obj.votes.filter(vote="upvote").count()
        downvotes = obj.votes.filter(vote="downvote").count()
        return upvotes - downvotes

    def get_user_vote(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            vote = obj.votes.filter(user=user).first()
            return vote.vote if vote else None
        return None



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
        
class DislikedPostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    author_pic = serializers.SerializerMethodField()

    class Meta:
        model = DislikedPost
        fields = ['user', 'post', 'created_at', 'username', 'author_pic']

    def get_author_pic(self, obj):
        return obj.user.profile_pic


class ContentSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    content = serializers.CharField()
    
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'rating', 'feedback', 'created_at']

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value']
        extra_kwargs = {
            'id': {'read_only': True}
        }

    def update(self, instance, validated_data):
        instance.value = validated_data.get('value', instance.value)
        instance.save()
        return instance
    
class ModeratorSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModeratorSettings
        fields = '__all__'