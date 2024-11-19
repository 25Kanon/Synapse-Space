import hashlib

from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from django.contrib.contenttypes.models import ContentType
import requests
from django.db.models import Q
from django.conf import settings
import os
from datetime import datetime, timedelta

from django.utils import timezone

from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.password_validation import validate_password

# Rest Framework imports
from rest_framework import generics, permissions, status, serializers
from rest_framework.decorators import api_view
from rest_framework import exceptions as rest_exceptions, response, decorators as rest_decorators, permissions as rest_permissions
from rest_framework.generics import get_object_or_404, UpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt import tokens, views as jwt_views, serializers as jwt_serializers, exceptions as jwt_exceptions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.serializers import ValidationError

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView


# Azure Blob Storage imports
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions

# Other third-party library imports
import uuid
import logging
from urllib.parse import parse_qsl, urljoin, urlparse, unquote

from . import adapters
# Local imports
from .models import Community, Membership, Post, LikedPost, Likes, Comment, User, Reports, Friendship, FriendRequest, \
    Program, Notification, SavedPost
from .serializers import (UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
                          CustomTokenRefreshSerializer, CreateCommunitySerializer, CreateMembership,
                          MembershipSerializer, CommunitySerializer, CreatePostSerializer,
                          CommunityPostSerializer, getCommunityPostSerializer, LikedPostSerializer, CommentSerializer,
                          CreateCommentSerializer, CookieTokenRefreshSerializer, VerifyAccountSerializer,
                          ReportsSerializer, FriendRequestSerializer, FriendSerializer, CommunityWithScoreSerializer,
                          DetailedUserSerializer, CreateUserSerializer, ProgramSerializer, NotificationSerializer,
                          PostSerializer, SavedPostSerializer)
from .permissions import IsCommunityMember, CookieJWTAuthentication, IsCommunityAdminORModerator, IsCommunityAdmin, \
    IsSuperUser, RefreshCookieJWTAuthentication, IsStaff

from .recommender import get_hybrid_recommendations

from django.conf import settings

from rest_framework.pagination import PageNumberPagination

logger = logging.getLogger(__name__)


class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        logger.debug(f"Received data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            return Response({
                "user": UserSerializer(user, context=self.get_serializer_context()).data,
            })
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyAccountView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = VerifyAccountSerializer(data=request.data, partial=True)  # Allows partial updates

        if serializer.is_valid():
            # Update the fields for the user
            user.student_number = serializer.validated_data.get('student_number', user.student_number)
            user.username = serializer.validated_data.get('username', user.username)
            user.registration_form = serializer.validated_data.get('registration_form', user.registration_form)
            user.profile_pic = serializer.validated_data.get('profile_pic', user.profile_pic)

            # Handle interests as an array
            interests = serializer.validated_data.get('interests', user.interests)
            if isinstance(interests, list):
                user.interests = interests  # Assign the list directly

            user.bio = serializer.validated_data.get('bio', user.bio)
            user.program = serializer.validated_data.get('program', user.program)
            user.is_verified = serializer.validated_data.get('is_verified', user.is_verified)
            user.is_rejected = serializer.validated_data.get('is_rejected', user.is_rejected)

            logger.error(user)

            user.save()

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def create_cometchat_user(user):
    # Prepare the payload for CometChat
    payload = {
        "metadata": {
            "@private": {
                "email": user.email,  # Use user's email
            }
        },
        "uid": "ss"+user.id,
        "name": user.username,  # Use username or full name if needed
    }

    # Include avatar if profile_pic is present
    if user.profile_pic:
        payload["avatar"] = user.profile_pic

    # Headers for CometChat API
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "apikey": os.getenv('COMET_CHAT_KEY')
    }

    # Send the POST request to CometChat
    cometAppID = os.getenv('COMET_CHAT_APP_ID')
    url = f"https://{cometAppID}.api-in.cometchat.io/v3/users"
    try:
        response = requests.post(url, json=payload, headers=headers)

        # Check if the request was successful
        if response.status_code == 200:
            logger.info(f"CometChat user created successfully for {user.username}")
        else:
            logger.error(f"Failed to create CometChat user: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending request to CometChat: {e}")


def update_cometchat_user(user):
    # Prepare the payload for updating the CometChat user
    payload = {
        "metadata": {
            "@private": {
                "email": user.email,  # Use user's email
            }
        },
        "unset": ["avatar"],  # Unset the avatar field
        "name": user.username,  # Use username or full name if needed
        "avatar": user.profile_pic if user.profile_pic else None  # Include avatar if profile_pic is present
    }

    # Headers for CometChat API
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "apikey": os.getenv('COMET_CHAT_KEY')
    }

    # Send the PUT request to CometChat
    cometAppID = os.getenv('COMET_CHAT_APP_ID')
    url = f"https://{cometAppID}.api-in.cometchat.io/v3/users/{user.id}"
    try:
        response = requests.put(url, json=payload, headers=headers)

        # Check if the request was successful
        if response.status_code == 200:
            logger.info(f"CometChat user updated successfully for {user.username}")
        else:
            logger.error(f"Failed to update CometChat user: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending request to CometChat: {e}")


def delete_cometchat_user(user):
    # Prepare the payload for deleting the CometChat user
    payload = {
        "permanent": "false"
    }

    # Headers for CometChat API
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "apikey": os.getenv('COMET_CHAT_KEY')
    }

    # Send the DELETE request to CometChat
    cometAppID = os.getenv('COMET_CHAT_APP_ID')
    url = f"https://{cometAppID}.api-in.cometchat.io/v3/users/{user.id}"
    try:
        response = requests.delete(url, json=payload, headers=headers)

        # Check if the request was successful
        if response.status_code == 200:
            logger.info(f"CometChat user deleted successfully for {user.username}")
        else:
            logger.error(f"Failed to delete CometChat user: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending request to CometChat: {e}")

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        response_data = serializer.validated_data

        # Check if OTP is required
        if 'message' in response_data and response_data['message'] == 'OTP required':
            # Respond with a message indicating OTP is required
            return Response({'message': 'OTP required'}, status=status.HTTP_200_OK)

        # If OTP is provided and valid, generate the token response
        response = Response(response_data, status=status.HTTP_200_OK)

        # Set cookies for access_token and refresh_token
        if 'access' in response_data:
            response.set_cookie(
                'access',
                response_data['access'],
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE']
            )
        if 'refresh' in response_data:
            response.set_cookie(
                'refresh',
                response_data['refresh'],
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE']
            )

        return response

class CookieTokenRefreshView(jwt_views.TokenRefreshView):

    authentication_classes = [RefreshCookieJWTAuthentication]
    # permission_classes = [IsAuthenticated]
    serializer_class = CookieTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh')
        logger.error(f"Refresh token: {refresh_token}")
        if not refresh_token:
            return Response({"detail": "Refresh token not found in cookies."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            data = {'access': str(refresh.access_token)}

            if refresh.check_exp():
                return Response({"detail": str("Token expired")}, status=status.HTTP_401_UNAUTHORIZED)


            if settings.SIMPLE_JWT['ROTATE_REFRESH_TOKENS']:
                # Create a new refresh token
                new_refresh = RefreshToken.for_user(request.user)
                new_access = new_refresh.access_token
                data['refresh'] = str(new_refresh)
                data['access'] = str(new_access)
            else:
                # If not rotating tokens, use the same refresh token
                data['refresh'] = refresh_token

            response = Response(data)

            # Set the new refresh token in the cookie
            response.set_cookie(
                'refresh',
                data['refresh'],
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE']
            )
            response.set_cookie(
                'access',
                data['access'],
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE']
            )


            return response

        except TokenError as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get("refresh"):
            response.set_cookie(
                'refresh',
                response.data['refresh'],
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                httponly=True,
                samesite='Lax',
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE']
            )
            del response.data["refresh"]  # Remove refresh from the response data
        response["X-CSRFToken"] = request.COOKIES.get("csrftoken")
        return super().finalize_response(request, response, *args, **kwargs)


class CheckAuthView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_verified:
            return Response({
                'user': {
                    'isVerified': request.user.is_verified,
                    'username': request.user.username,
                    'pic': request.user.profile_pic,
                    'is_rejected': request.user.is_rejected,
                }
            })

        # Get the refresh token from the cookie
        refresh_token = request.COOKIES.get('refresh')

        # Calculate the expiration time
        expiration_time = None
        if refresh_token:
            try:
                # Decode the refresh token
                token = RefreshToken(refresh_token)
                # Get the expiration timestamp
                exp_timestamp = token['exp']
                # Convert to datetime
                expiration_time = datetime.fromtimestamp(exp_timestamp)
            except TokenError:
                # Handle invalid token
                pass

        logger.info(f"Auth check for user: {request.user}")
        logger.info(f"Request headers: {request.headers}")
        logger.info(f"Request COOKIES: {request.COOKIES}")
        return Response({
            'is_authenticated': True,
            'is_verified': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'student_number': request.user.student_number,
                'isVerified': request.user.is_verified,
                'exp': expiration_time.isoformat() if expiration_time else None,
                'pic': request.user.profile_pic,
                'is_superuser': request.user.is_superuser,
                'is_staff': request.user.is_staff,
                'is_rejected': request.user.is_rejected,
            }
        })

class ImageUploadView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def __init__(self):
        super().__init__()
        self.account_url = os.getenv('AZURE_BLOB_ACCOUNT_URL')
        self.credential = os.getenv('AZURE_BLOB_CREDENTIAL')
        self.account_name = os.getenv('AZURE_BLOB_ACCOUNT_NAME')
        self.account_key = os.getenv('AZURE_BLOB_ACCOUNT_KEY')
        self.container_name = 'synapsespace-storage'

    def post(self, request):
        print("Request Files:", request.FILES)  # Debug: Check incoming files
        blob_service_client = BlobServiceClient(account_url=self.account_url, credential=self.credential)
        container_client = blob_service_client.get_container_client(self.container_name)

        img_url = None
        try:
            img_file = request.FILES.get('img')
            print("Uploaded File:", img_file)  # Debug: Check if file is retrieved

            if img_file:
                img_hash = hashlib.md5(img_file.name.encode()).hexdigest()[:8]
                img_blob_name = f"uploads/{img_hash}-{img_file.name.replace(' ', '_')}"
                container_client.upload_blob(img_blob_name, img_file, overwrite=True)
                img_url = f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{img_blob_name}"
            else:
                return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({'url': img_url}, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Handle any exceptions that occur during the upload process
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CustomGoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    def get_response(self):
        # After successful login, issue JWT tokens
        user = self.user
        if user.is_google:
            refresh = RefreshToken.for_user(user)
            response = Response({
                'username': user.username,
            })
            response.set_cookie(
                'access',
                str(refresh.access_token),
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE']
            )
            response.set_cookie(
                'refresh',
                str(refresh),
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE']
            )
            return response
        else:
            return Response({"error": "The email Address is already associated with another user"}, status=status.HTTP_400_BAD_REQUEST)
class LogoutView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        response = Response()
        try:
            refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            response.data = {"detail": "Logout successful."}
            response.status_code = status.HTTP_200_OK
        except Exception as e:
            response.data = {"error": str(e)}
            response.status_code = status.HTTP_400_BAD_REQUEST
        finally:
            # Always remove the cookies, even if an error occurred
            response.delete_cookie('access')
            response.delete_cookie('refresh')
        return response

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        # Check that the current password is correct
        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate that the new password and confirm password match
        if new_password != confirm_password:
            return Response({"error": "New passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate the new password according to Django's password validation rules
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        # Set the new password
        user.set_password(new_password)
        user.save()

        # Update the session to reflect the new password hash
        update_session_auth_hash(request, user)

        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
    
class CommunityCreateView(generics.CreateAPIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Community.objects.all()
    serializer_class = CreateCommunitySerializer

    def __init__(self):
        self.account_url = os.getenv('AZURE_BLOB_ACCOUNT_URL')
        self.credential = os.getenv('AZURE_BLOB_CREDENTIAL')
        self.account_name = os.getenv('AZURE_BLOB_ACCOUNT_NAME')
        self.account_key = os.getenv('AZURE_BLOB_ACCOUNT_KEY')
        self.container_name = 'synapsespace-storage'

    def generate_presigned_url(self, blob_name):
        """Generates a pre-signed URL for Azure Blob Storage"""
        blob_service_client = BlobServiceClient(account_url=self.account_url, credential=self.credential)
        container_client = blob_service_client.get_container_client(self.container_name)

        sas_token = generate_blob_sas(
            account_name=self.account_name,
            container_name=self.container_name,
            blob_name=blob_name,
            account_key=self.account_key,
            permission=BlobSasPermissions(write=True),
            expiry=datetime.utcnow() + timedelta(hours=1)
        )

        return f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_name}/{blob_name}?{sas_token}"

    def perform_create(self, serializer):
        blob_service_client = BlobServiceClient(account_url=self.account_url, credential=self.credential)
        container_client = blob_service_client.get_container_client(self.container_name)

        img_url = None
        banner_url = None
        try:
            # Assuming `img` and `banner` are provided in the request as File objects
            img_file = self.request.FILES.get('img')
            banner_file = self.request.FILES.get('banner')

            if img_file:
                img_blob_name = f"communities/{uuid.uuid4()}-{img_file.name}"
                container_client.upload_blob(img_blob_name, img_file, overwrite=True)
                img_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_client.container_name}/{img_blob_name}"

            if banner_file:
                banner_blob_name = f"communities/{uuid.uuid4()}-{banner_file.name}"
                container_client.upload_blob(banner_blob_name, banner_file, overwrite=True)
                banner_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_client.container_name}/{banner_blob_name}"

            # Save community data
            community = serializer.save(imgURL=img_url, bannerURL=banner_url)

            # Create initial membership
            Membership.objects.create(user=self.request.user, community=community, role='admin', status='accepted')

        except Exception as e:
            # If there's an error during community creation, delete any uploaded images
            if img_url:
                blob_client = container_client.get_blob_client(img_blob_name)
                blob_client.delete_blob()
            if banner_url:
                blob_client = container_client.get_blob_client(banner_blob_name)
                blob_client.delete_blob()
            raise e  # Re-raise the exception to send an error response

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class getMembershipRole(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsCommunityMember]

    def get(self, request, community_id):
        user = request.user
        membership = Membership.objects.filter(user=user, community_id=community_id, status='accepted').first()
        if membership:
            return Response({"role": membership.role}, status=status.HTTP_200_OK)
        else:
            return Response({"error": user}, status=status.HTTP_404_NOT_FOUND)


class MembershipListView(generics.ListAPIView):

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        student_number = self.request.query_params.get('student_number')
        return Membership.objects.filter(user__student_number=student_number, status='accepted').select_related('community')


class CommunityMembersListView(generics.ListAPIView):

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        community_id = self.kwargs.get('community_id')
        return Membership.objects.filter(community__id=community_id, status='accepted').select_related('user')


class CommunityDetailView(generics.RetrieveAPIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CommunitySerializer
    queryset = Community.objects.all()
    lookup_field = 'id'

class PostCreateView(generics.CreateAPIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsCommunityMember]
    queryset = Post.objects.all()
    serializer_class = CreatePostSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class GenerateSignedUrlView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.account_url = os.getenv('AZURE_BLOB_ACCOUNT_URL')
        self.credential = os.getenv('AZURE_BLOB_CREDENTIAL')
        self.account_name = os.getenv('AZURE_BLOB_ACCOUNT_NAME')
        self.account_key = os.getenv('AZURE_BLOB_ACCOUNT_KEY')
        self.container_name = 'synapsespace-storage'

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "File is required"}, status=status.HTTP_400_BAD_REQUEST)

        blob_name = f"temp/{datetime.utcnow().isoformat()}_{file.name}"
        try:
            # Step 2: Upload the file to Azure Blob Storage
            self.upload_to_azure(blob_name, file)

            # Step 3: Generate a signed URL for the uploaded file
            signed_url = self.generate_presigned_url(blob_name)
            return Response({"signedUrl": signed_url}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error processing the request: {str(e)}")
            return Response({"error": "Could not process the request"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def upload_to_azure(self, blob_name, file):
        try:
            blob_service_client = BlobServiceClient(account_url=self.account_url, credential=self.credential)
            container_client = blob_service_client.get_container_client(self.container_name)

            # Upload the file to Azure
            blob_client = container_client.get_blob_client(blob_name)
            blob_client.upload_blob(file, overwrite=True)

        except Exception as e:
            logger.error(f"Error uploading file to Azure Blob Storage: {str(e)}")
            raise e

    def generate_presigned_url(self, blob_name):
        try:
            sas_token = generate_blob_sas(
                account_name=self.account_name,
                container_name=self.container_name,
                blob_name=blob_name,
                account_key=self.account_key,
                permission=BlobSasPermissions(read=True, write=True),
                expiry=datetime.utcnow() + timedelta(hours=1)
            )

            signed_url = f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"
            return signed_url

        except Exception as e:
            logger.error(f"Error generating signed URL: {str(e)}")
            raise e

class MoveImageView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def __init__(self):
        self.account_url = os.getenv('AZURE_BLOB_ACCOUNT_URL')
        self.credential = os.getenv('AZURE_BLOB_CREDENTIAL')
        self.account_name = os.getenv('AZURE_BLOB_ACCOUNT_NAME')
        self.account_key = os.getenv('AZURE_BLOB_ACCOUNT_KEY')
        self.container_name = 'synapsespace-storage'

    def post(self, request):
        temp_url = request.data.get('tempUrl')
        if not temp_url:
            logger.error("Temporary URL is required")
            return Response({"error": "Temporary URL is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            blob_service_client = BlobServiceClient(account_url=self.account_url, credential=self.credential)

            # Parse the URL to get the blob name
            parsed_url = urlparse(temp_url)
            temp_blob_name = unquote(parsed_url.path.split('/')[-1])
            logger.info(f"Temp blob name: {temp_blob_name}")

            temp_blob_client = blob_service_client.get_blob_client(container=self.container_name,
                                                                   blob=f"temp/{temp_blob_name}")
            perm_blob_name = f"postImages/{uuid.uuid4()}_{temp_blob_name}"
            perm_blob_client = blob_service_client.get_blob_client(container=self.container_name, blob=perm_blob_name)

            # Copy the blob to the permanent folder
            copy_status = perm_blob_client.start_copy_from_url(temp_blob_client.url)
            logger.info(f"Copy status: {copy_status}")

            # Ensure the copy operation is complete
            while perm_blob_client.get_blob_properties().copy.status == 'pending':
                time.sleep(1)

            # Delete the temporary blob
            temp_blob_client.delete_blob()
            logger.info(f"Deleted temporary blob: temp/{temp_blob_name}")

            # Generate the new URL
            new_url = f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{perm_blob_name}"
            return Response({"newUrl": new_url}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error moving image: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PostPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 20

class getCommunityPosts(generics.ListAPIView):
    pagination_class = PostPagination
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsCommunityMember]
    serializer_class = CommunityPostSerializer

    def get_queryset(self):
        community_id = self.kwargs.get('community_id')
        return Post.objects.filter(posted_in_id=community_id).order_by('-isPinned', '-created_at')


class getJoinedCommunityPosts(generics.ListAPIView):
    pagination_class = PostPagination
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CommunityPostSerializer

    def get_queryset(self):
        user = self.request.user
        joined_communities = Membership.objects.filter(user=user).values_list('community_id', flat=True)
        return Post.objects.filter(posted_in_id__in=joined_communities).order_by('-created_at')


class getCommunityPost(generics.RetrieveAPIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsCommunityMember]
    serializer_class = getCommunityPostSerializer
    queryset = Post.objects.all()
    lookup_field = 'id'  # Assuming 'id' is the primary key for Post

    def get_object(self):
        community_id = self.kwargs.get('community_id')
        post_id = self.kwargs.get('post_id')
        return get_object_or_404(Post, id=post_id, posted_in=community_id)

class likePostView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsCommunityMember]
    def post(self, request, community_id, post_id):
        post = Post.objects.get(id=post_id)
        user = request.user
        like, created = LikedPost.objects.get_or_create(user=user, post=post)
        if created:
            return Response({"message": "Post liked successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Post already liked"}, status=status.HTTP_200_OK)

class unlikePostView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsCommunityMember]
    def post(self, request, community_id, post_id):
        post = Post.objects.get(id=post_id)
        user = request.user
        like = Likes.objects.filter(user=user, post=post).first()
        userLike= LikedPost.objects.filter(user=user, post=post).first()
        if like:
            like.delete()
            userLike.delete()
            return Response({"message": "Post unliked successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Post not liked"}, status=status.HTTP_200_OK)

class getPostLikesView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, community_id, post_id):
        post = get_object_or_404(Post, id=post_id, posted_in_id=community_id)
        likes = Likes.objects.filter(post=post)
        serializer = LikedPostSerializer(likes, many=True)
        return Response(serializer.data)

class CommentCreateView(generics.CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CreateCommentSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentDetailView(generics.RetrieveAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class UserCommentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Filter comments by the user
        comments = Comment.objects.filter(author__id=user_id)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

class PostCommentsView(generics.ListAPIView):
    serializer_class = CommentSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id, parent=None)
class CommentUpdateView(generics.UpdateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save(updated_at=timezone.now())

class CommentDeleteView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class UserProfileView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = UserSerializer(user).data
        return Response(user_data)

    def put(self, request):
        user = request.user
        data = request.data

        # Update profile picture and registration form if provided
        if 'profile_pic' in request.FILES:
            user.profile_pic = request.FILES['profile_pic']

        # Update other fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.username = data.get('username', user.username)
        user.program = data.get('program', user.program)
        user.bio = data.get('bio', user.bio)
        user.profile_pic = data.get('profile_pic', user.profile_pic)
        user.interests = data.get('interests', user.interests)

        user.save()

        user_data = UserSerializer(user).data
        return Response(user_data)

class EditProfileView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def __init__(self):
        self.account_url = os.getenv('AZURE_BLOB_ACCOUNT_URL')
        self.credential = os.getenv('AZURE_BLOB_CREDENTIAL')
        self.account_name = os.getenv('AZURE_BLOB_ACCOUNT_NAME')
        self.account_key = os.getenv('AZURE_BLOB_ACCOUNT_KEY')
        self.container_name = 'synapsespace-storage'

    def generate_presigned_url(self, blob_name):
        """Generates a pre-signed URL for Azure Blob Storage"""
        blob_service_client = BlobServiceClient(account_url=self.account_url, credential=self.credential)
        sas_token = generate_blob_sas(
            account_name=self.account_name,
            container_name=self.container_name,
            blob_name=blob_name,
            account_key=self.account_key,
            permission=BlobSasPermissions(write=True),
            expiry=datetime.utcnow() + timedelta(hours=1)
        )
        return f"https://{blob_service_client.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"

    def get_object(self):
        return self.request.user  # Get the current authenticated user

    def perform_update(self, serializer):
        blob_service_client = BlobServiceClient(account_url=self.account_url, credential=self.credential)
        container_client = blob_service_client.get_container_client(self.container_name)

        profile_pic_url = None
        profile_banner_url = None

        try:
            # Fetch files from the request
            profile_pic_file = self.request.FILES.get('profile_pic')
            profile_banner_file = self.request.FILES.get('profile_banner')

            # Handle profile picture upload
            if profile_pic_file:
                profile_pic_blob_name = f"profile_pictures/{uuid.uuid4()}-{profile_pic_file.name}"
                container_client.upload_blob(profile_pic_blob_name, profile_pic_file, overwrite=True)
                profile_pic_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_client.container_name}/{profile_pic_blob_name}"

            # Handle banner upload
            if profile_banner_file:
                banner_blob_name = f"profile_banners/{uuid.uuid4()}-{profile_banner_file.name}"
                container_client.upload_blob(banner_blob_name, profile_banner_file, overwrite=True)
                profile_banner_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_client.container_name}/{banner_blob_name}"

            # Save updated user data
            serializer.save(
                profile_pic=profile_pic_url if profile_pic_url else serializer.instance.profile_pic,
                profile_banner=profile_banner_url if profile_banner_url else serializer.instance.profile_banner,
            )
        except Exception as e:
            # If there's an error, clean up uploaded blobs
            if profile_pic_url:
                blob_client = container_client.get_blob_client(profile_pic_blob_name)
                blob_client.delete_blob()
            if profile_banner_url:
                blob_client = container_client.get_blob_client(banner_blob_name)
                blob_client.delete_blob()
            raise e

    def put(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_update(serializer)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.data, status=status.HTTP_200_OK)

class UserActivitiesView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        posts = Post.objects.filter(user=user).order_by('created_at')
        comments = Comment.objects.filter(user=user).order_by('created_at')
        saved_posts = SavedPost.objects.filter(user=user).order_by('created_at')
        liked_posts = LikedPost.objects.filter(user=user).order_by('created_at')

        activities = {
            'posts': PostSerializer(posts, many=True).data,
            'comments': CommentSerializer(comments, many=True).data,
            'saved_posts': SavedPostSerializer(saved_posts, many=True).data,
            'liked_posts': LikedPostSerializer(liked_posts, many=True).data
        }

        return Response(activities)

class CommunityListView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        search_query = request.query_params.get('search', None)  # Get the search query parameter

        if search_query:
            communities = Community.objects.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(keyword__icontains=search_query)  # Ensure your model has a 'keywords' field
            )
        else:
            communities = Community.objects.all()  # If no search query, get all communities

        serializer = CommunitySerializer(communities, many=True)
        return Response(serializer.data)

class JoinCommunityView(generics.CreateAPIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        community_id = self.kwargs.get('community_id')  # Get community ID from URL parameters

        # Check if the community exists
        try:
            community = Community.objects.get(id=community_id)
        except Community.DoesNotExist:
            return Response({"error": "Community not found."}, status=status.HTTP_404_NOT_FOUND)

        # Create initial membership
        membership, created = Membership.objects.get_or_create(user=request.user, community=community)

        if created:
            serializer = MembershipSerializer(membership)
            return Response({"message": "Successfully joined the community.", "membership": serializer.data}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "You are already a member of this community."}, status=status.HTTP_200_OK)

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'student_number', 'username', 'first_name', 'last_name', 'email', 'profile_pic', 'interests','bio']

class UserListView(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        queryset = User.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(student_number__icontains=search) |
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        return queryset

class getCommunityStats(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsCommunityAdminORModerator]
    def get(self, request, community_id):
        community = get_object_or_404(Community, id=community_id)
        members = Membership.objects.filter(community=community).count()
        posts = Post.objects.filter(posted_in=community).count()
        return Response({
            'members': members,
            'posts': posts
        })

class ReportsListCreateView(generics.ListCreateAPIView):
    queryset = Reports.objects.all()
    serializer_class = ReportsSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def perform_create(self, serializer):
        # Attach the author (logged-in user) to the report
        report = serializer.save(author=self.request.user)
        logger.info(f"Report created by {self.request.user.email}: {report}")

        # Check the type of the report (post or comment) and create a notification
        if report.type == "post":
            # Fetch the post and notify its creator
            post = get_object_or_404(Post, id=report.object_id)
            Notification.objects.create(
                user=post.created_by,
                title="Your Post Was Reported",
                message={
                    "action": "post_reported",
                    "post_id": post.id,
                    "post_title": post.title,
                    "community_id": post.posted_in.id,
                    "reason": report.reason,
                }
            )
            logger.info(f"Notification created for post author {post.created_by.email} about reported post ID {post.id}")

        elif report.type == "comment":
            # Fetch the comment and notify its author
            comment = get_object_or_404(Comment, id=report.object_id)
            Notification.objects.create(
                user=comment.author,
                title="Your Comment Was Reported",
                message={
                    "action": "comment_reported",
                    "comment_id": comment.id,
                    "comment_content": comment.content,
                    "community_id": comment.post.posted_in.id,  # Use the related post's community ID
                    "post_id": comment.post.id,
                    "reason": report.reason,
                }
            )
            logger.info(f"Notification created for comment author {comment.author.email} about reported comment ID {comment.id}")
        else:
            logger.warning(f"Invalid report type: {report.type}")


class getReportsView(generics.ListAPIView):
    serializer_class = ReportsSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsCommunityAdminORModerator]

    def get_queryset(self):
        # Fetch community_id from the URL
        community_id = self.kwargs.get('community_id')

        # Get the community instance and ensure it exists
        community = get_object_or_404(Community, id=community_id)

        # Filter reports for the specified community based on content types
        community_content_types = ContentType.objects.filter(model__in=['post', 'comment', 'user'])
        return Reports.objects.filter(
            content_type__in=community_content_types,
            community=community,
            status='pending'
        )


class modResolveView(generics.UpdateAPIView):
    queryset = Reports.objects.all()
    serializer_class = ReportsSerializer
    permission_classes = [IsAuthenticated, IsCommunityAdminORModerator]
    authentication_classes = [CookieJWTAuthentication]
    lookup_field = 'pk'  # Ensure the view uses 'pk' as the lookup field

    def put(self, request, *args, **kwargs):
        report = self.get_object()
        report.status = self.request.data.get('status', report.status)
        report.is_resolved = True
        report.resolved_by = self.request.user
        report.resolved_at = timezone.now()
        report.save()

        return Response({"message": "Report has been approved."}, status=status.HTTP_200_OK)


class getPendingCommunityMembersListView(generics.ListAPIView):

    permission_classes = [IsAuthenticated, IsCommunityAdminORModerator]
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        community_id = self.kwargs.get('community_id')
        return Membership.objects.filter(community__id=community_id, role='member').select_related('user')


class CheckPendingMembershipView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request, community_id):
        user_id = request.user.id
        try:
            community = Community.objects.get(id=community_id)
        except Community.DoesNotExist:
            return Response({"detail": "Community not found."}, status=status.HTTP_404_NOT_FOUND)

        membership = Membership.objects.filter(community=community, user_id=user_id, status='pending').first()
        if membership:
            serializer = MembershipSerializer(membership)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Pending membership not found."}, status=status.HTTP_404_NOT_FOUND)



class AcceptMembershipView(APIView):

    permission_classes = [IsAuthenticated, IsCommunityAdminORModerator]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request, *args, **kwargs):
        community_id = kwargs.get('community_id')
        user_ids = request.data.get('user_ids', [])

        if not community_id or not user_ids:
            return Response({"detail": "Community ID and user IDs are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            community = Community.objects.get(id=community_id)
        except Community.DoesNotExist:
            return Response({"detail": "Community not found."}, status=status.HTTP_404_NOT_FOUND)

        memberships = Membership.objects.filter(community=community, user_id__in=user_ids)
        updated_memberships = []

        for membership in memberships:
            membership.status = 'accepted'
            membership.save()
            updated_memberships.append(membership)

        serializer = MembershipSerializer(updated_memberships, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BanMembershipView(APIView):
    permission_classes = [IsAuthenticated, IsCommunityAdminORModerator]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request, *args, **kwargs):
        community_id = kwargs.get('community_id')
        user_ids = request.data.get('user_ids', [])

        if not community_id or not user_ids:
            return Response({"detail": "Community ID and user IDs are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            community = Community.objects.get(id=community_id)
        except Community.DoesNotExist:
            return Response({"detail": "Community not found."}, status=status.HTTP_404_NOT_FOUND)

        memberships = Membership.objects.filter(community=community, user_id__in=user_ids)
        updated_memberships = []

        for membership in memberships:
            membership.status = 'banned'
            membership.save()
            updated_memberships.append(membership)
            
            # Create a notification for the banned user
            Notification.objects.create(
                user=membership.user,
                title="You Have Been Banned",
                message={
                    "action": "banned_from_community",
                    "community_id": community.id,
                    "community_name": community.name,
                    "reason": "Violation of community rules"  # Optional: Include ban reason if applicable
                }
            )

        serializer = MembershipSerializer(updated_memberships, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UnbanMembershipView(APIView):
    permission_classes = [IsAuthenticated, IsCommunityAdminORModerator]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request, *args, **kwargs):
        community_id = kwargs.get('community_id')
        user_ids = request.data.get('user_ids', [])

        if not community_id or not user_ids:
            return Response({"detail": "Community ID and user IDs are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            community = Community.objects.get(id=community_id)
        except Community.DoesNotExist:
            return Response({"detail": "Community not found."}, status=status.HTTP_404_NOT_FOUND)

        memberships = Membership.objects.filter(community=community, user_id__in=user_ids)
        updated_memberships = []

        for membership in memberships:
            membership.delete()

        serializer = MembershipSerializer(updated_memberships, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PinPostView(APIView):
    permission_classes = [IsAuthenticated, IsCommunityAdminORModerator]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request, community_id, post_id):
        post = Post.objects.get(id=post_id)
        post.isPinned = True
        post.save()
        return Response({"message": "Post has been pinned."}, status=status.HTTP_200_OK)


class UnpinPostView(APIView):
    permission_classes = [IsAuthenticated, IsCommunityAdminORModerator]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request, community_id, post_id):
        post = Post.objects.get(id=post_id)
        post.isPinned = False
        post.save()
        return Response({"message": "Post has been pinned."}, status=status.HTTP_200_OK)

class SendFriendRequestView(generics.CreateAPIView):
    serializer_class = FriendRequestSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Get the receiver ID from the request data
        receiver_id = request.data.get('receiver')

        # Check if the receiver user exists
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Prevent sending a friend request to oneself
        if request.user.id == receiver.id:
            return Response({"detail": "You cannot send a friend request to yourself."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the sender and receiver are already friends
        if Friendship.objects.filter(
            Q(user1=request.user, user2=receiver) | Q(user1=receiver, user2=request.user)
        ).exists():
            return Response({"detail": "You are already friends with this user."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if there is a pending friend request from the current user to this receiver
        if FriendRequest.objects.filter(sender=request.user, receiver=receiver, status='pending').exists():
            return Response({"detail": "Friend request already sent and pending."}, status=status.HTTP_400_BAD_REQUEST)

        # Proceed with creating the friend request
        return super().create(request, *args, **kwargs)

# List all friends of the logged-in user
class ListFriendsView(generics.ListAPIView):
    serializer_class = FriendSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get all friends (user2) for the logged-in user
        friendships = Friendship.objects.filter(user1=user).select_related("user2")
        return [friendship.user2 for friendship in friendships]
        
class ListSentFriendRequestsView(generics.ListAPIView):
    serializer_class = FriendRequestSerializer  # Use FriendRequestSerializer to display sent friend requests
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Return friend requests where either the sender or receiver is the logged-in user
        return FriendRequest.objects.filter(
            Q(sender=user) | Q(receiver=user),
            status='pending'
        )


class RespondToFriendRequestView(generics.UpdateAPIView):
    serializer_class = FriendRequestSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        # Get the friend request by ID, ensure the receiver is the requesting user
        friend_request = get_object_or_404(FriendRequest, id=kwargs['pk'])

        # Check if the logged-in user is the receiver of the request
        if friend_request.receiver != request.user:
            raise PermissionDenied("You are not authorized to respond to this friend request.")

        # Perform the requested action based on the 'action' field in request data
        action = request.data.get('action')

        # Perform the requested action: accept or reject
        if action == 'accept':
            friend_request.delete()

            # Create a mutual friendship between sender and receiver
            Friendship.objects.create(user1=friend_request.sender, user2=friend_request.receiver)
            Friendship.objects.create(user1=friend_request.receiver, user2=friend_request.sender)
            
            # Create a notification for the sender with a JSON object as the message
            Notification.objects.create(
                user=friend_request.sender,
                title="Friend Request Accepted",
                message={
                    "action": "friend_request_accepted",
                    "friend": {
                        "id": request.user.id,
                        "username": request.user.username,
                        "profile_pic": request.user.profile_pic if request.user.profile_pic else None,
                    }
                },
            )
            return Response({"detail": "Friend request accepted."}, status=status.HTTP_200_OK)

        elif action == 'reject':
            # Delete the friend request if rejected
            friend_request.delete()
            return Response({"detail": "Friend request rejected and deleted."}, status=status.HTTP_200_OK)

        # If no valid action is specified, return an error
        return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)


class UserRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        try:
            # Get the current authenticated user
            user = request.user  # The authenticated user from the request

            # Fetch hybrid recommendations based on the current user
            recommendations = get_hybrid_recommendations(user.id)

            # Serialize the recommended communities data
            serialized_communities = [
                CommunityWithScoreSerializer(community[0], context={'similarity_score': community[1]}).data
                for community in recommendations
            ]

            # Return the recommendations as a JSON response
            return Response({"recommended_communities": serialized_communities}, status=status.HTTP_200_OK)

        except Exception as e:
            # Return error message if something goes wrong
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CommunityUpdateView(UpdateAPIView):
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated, IsCommunityAdmin]
    authentication_classes = [CookieJWTAuthentication]

    def get_object(self):
        community_id = self.kwargs.get('community_id')  # Get community_id from URL kwargs
        return Community.objects.get(id=community_id)  # Fetch the community instance by community_id

    def update(self, request, *args, **kwargs):
        community = self.get_object()  # Get the community instance using community_id
        serializer = self.get_serializer(community, data=request.data, partial=True)  # Partial update

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AllStudentsView(generics.ListAPIView):
    queryset = User.objects.filter(is_staff=False, is_superuser=False)
    serializer_class = DetailedUserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        users = self.get_queryset()
        serializer = DetailedUserSerializer(users, many=True)
        return Response(serializer.data)


class AllStaffsView(generics.ListAPIView):
    queryset = User.objects.filter(is_staff=True)
    serializer_class = DetailedUserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        users = self.get_queryset()
        serializer = DetailedUserSerializer(users, many=True)
        return Response(serializer.data)


class UpdateAccountView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser or IsStaff]

    def put(self, request):
        user_id = request.data.get('id')
        if not user_id:
            return Response({"error": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = VerifyAccountSerializer(data=request.data, partial=True)  # Allows partial updates

        if serializer.is_valid():
            # Update the fields for the user
            user.student_number = serializer.validated_data.get('student_number', user.student_number)
            user.username = serializer.validated_data.get('username', user.username)
            user.registration_form = serializer.validated_data.get('registration_form', user.registration_form)
            user.profile_pic = serializer.validated_data.get('profile_pic', user.profile_pic)

            # Handle interests as an array
            interests = serializer.validated_data.get('interests', user.interests)
            if isinstance(interests, list):
                user.interests = interests  # Assign the list directly

            user.bio = serializer.validated_data.get('bio', user.bio)
            user.program = serializer.validated_data.get('program', user.program)
            user.is_verified = serializer.validated_data.get('is_verified', user.is_verified)

            user.save()

            update_cometchat_user(user)

            return Response({"message": "Account updated successfully."}, status=status.HTTP_200_OK)

        logger.error(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountView (APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]
    def delete(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        delete_cometchat_user(user)
        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_200_OK)


class CreateAccountView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]
    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            if user.is_verified or user.is_staff or user.is_superuser:
                create_cometchat_user(user)

            return Response({"message": "User created successfully.", "user": DetailedUserSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostCountView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        post_count = Post.objects.all().count()
        return Response({"post_count": post_count}, status=status.HTTP_200_OK)


class UserCountView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        user_count = User.objects.all().count()
        return Response({"user_count": user_count}, status=status.HTTP_200_OK)


class NewUserCountView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        new_users = User.objects.filter(date_joined__gte=timezone.now() - timedelta(days=7)).count()
        return Response({"new_users": new_users}, status=status.HTTP_200_OK)


class EngagementRateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        active_users = User.objects.filter(is_active=True).count()

        # Engagement Actions
        total_posts = Post.objects.count()
        total_comments = Comment.objects.count()
        total_likes = Likes.objects.count()
        total_friendships = Friendship.objects.count()
        total_reports = Reports.objects.count()

        total_engagements = total_posts + total_comments + total_likes + total_friendships + total_reports

        engagement_rate = total_engagements / active_users if active_users > 0 else 0

        return Response({"engagement_rate": engagement_rate}, status=status.HTTP_200_OK)


class ProgramListView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        programs = Program.objects.all()
        serializer = ProgramSerializer(programs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProgramCreateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        serializer = ProgramSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Program created successfully.", "program": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProgramEditView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]

    def put(self, request, program_id):
        program = get_object_or_404(Program, id=program_id)
        serializer = ProgramSerializer(program, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Program updated successfully.", "program": serializer.data}, status=status.HTTP_200_OK)


class ProgramDeleteView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]

    def delete(self, request, program_id):
        program = get_object_or_404(Program, id=program_id)
        program.delete()
        return Response({"message": "Program deleted successfully."}, status=status.HTTP_200_OK)


class UnverifiedStudentsViewSet(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = DetailedUserSerializer

    def get_queryset(self):
        return User.objects.filter(is_rejected=False, is_verified=False)

    def get(self, request):
        users = self.get_queryset()
        serializer = DetailedUserSerializer(users, many=True)
        return Response(serializer.data)

    def patch(self, request):
        user = User.objects.get(id=request.data.get('id'))
        user.is_verified = request.data.get('is_verified', user.is_verified)
        user.is_rejected = request.data.get('is_rejected', user.is_rejected)
        user.save()

        if user.is_verified:
            create_cometchat_user(user)

        return Response({"message": "User verified successfully."}, status=status.HTTP_200_OK)


class NotificationListView(APIView):
    """
    Fetch all notifications for the logged-in user.
    If no notifications exist, return an empty list.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        user = request.user
        notifications = Notification.objects.filter(user=user).order_by('-created_at')
        if notifications.exists():
            serializer = NotificationSerializer(notifications, many=True)
            return Response(serializer.data, status=200)
        else:
            # Return an empty list if no notifications exist
            return Response([], status=200)



class MarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(id=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminUserRecentActivityLogView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        # Fetch posts created in the last 7 days
        posts = Post.objects.filter(created_at__gte=timezone.now() - timedelta(days=7)).order_by('created_at')

        # Fetch comments created in the last 7 days
        comments = Comment.objects.filter(created_at__gte=timezone.now() - timedelta(days=7)).order_by('created_at')

        # Fetch liked posts created in the last 7 days
        liked_posts = LikedPost.objects.filter(created_at__gte=timezone.now() - timedelta(days=7)).order_by(
            'created_at')

        # Fetch saved posts created in the last 7 days
        saved_posts = SavedPost.objects.filter(created_at__gte=timezone.now() - timedelta(days=7)).order_by(
            'created_at')

        # Serialize the data
        activities = {
            'posts': PostSerializer(posts, many=True).data,
            'comments': CommentSerializer(comments, many=True).data,
            'liked_posts': LikedPostSerializer(liked_posts, many=True).data,
            'saved_posts': SavedPostSerializer(saved_posts, many=True).data
        }

        return Response(activities, status=status.HTTP_200_OK)


class AdminUserActivityLogView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        # Fetch all user activities
        posts = Post.objects.all().order_by('created_at')
        comments = Comment.objects.all().order_by('created_at')
        liked_posts = LikedPost.objects.all().order_by('created_at')
        saved_posts = SavedPost.objects.all().order_by('created_at')

        # Serialize the data
        activities = {
            'posts': PostSerializer(posts, many=True).data,
            'comments': CommentSerializer(comments, many=True).data,
            'liked_posts': LikedPostSerializer(liked_posts, many=True).data,
            'saved_posts': SavedPostSerializer(saved_posts, many=True).data
        }

        return Response(activities, status=status.HTTP_200_OK)
    
class SettingsView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        settings_data = {
            'theme': user.settings.theme if hasattr(user, 'settings') else 'light',
            'notifications_enabled': user.settings.notifications_enabled if hasattr(user, 'settings') else True
        }
        return Response(settings_data)

class UpdateSettingsView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        settings, created = Settings.objects.get_or_create(user=user)
        
        if 'theme' in request.data:
            settings.theme = request.data['theme']
        if 'notifications_enabled' in request.data:
            settings.notifications_enabled = request.data['notifications_enabled']
            
        settings.save()
        return Response({
            'theme': settings.theme,
            'notifications_enabled': settings.notifications_enabled
        })

class DeactivateAccountView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.is_active = False
        user.save()
        
        # Delete auth cookies
        response = Response({"message": "Account deactivated successfully"})
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        
        return response
    
class FeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        feedback_content = request.data.get('feedback')
        # Store feedback in database
        Feedback.objects.create(
            user=request.user,
            content=feedback_content
        )
        return Response({"message": "Feedback submitted successfully"})