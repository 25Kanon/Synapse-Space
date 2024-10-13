import os
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse, unquote

import requests
from dotenv import load_dotenv
from rest_framework import generics, permissions, status, serializers
from django.db.models import Q  # Import Q for complex queries
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Community, Membership, Post, LikedPost, Likes, Comment
from .serializers import (UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
                          CustomTokenRefreshSerializer, CreateCommunitySerializer, CreateMembership,
                          MembershipSerializer, CommunitySerializer, CreatePostSerializer, ImageUploadSerializer,
                          CommunityPostSerializer, getCommunityPostSerializer, LikedPostSerializer, CommentSerializer,
                          CreateCommentSerializer)
from .permissions import IsCommunityMember
from rest_framework_simplejwt.views import TokenRefreshView

import logging
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
import uuid
import pyotp

from django.conf import settings

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


class LoginView(generics.GenericAPIView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        response_data = serializer.validated_data
        if 'message' in response_data and response_data['message'] == 'OTP required':
            # Respond with a message indicating OTP is required

            return Response({'message': 'OTP required'}, status=status.HTTP_200_OK)

        # If OTP is provided and valid, send the token response
        return Response(response_data, status=status.HTTP_200_OK)

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CommunityCreateView(generics.CreateAPIView):
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
            Membership.objects.create(user=self.request.user, community=community)

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


class MembershipListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        student_number = self.request.query_params.get('student_number')
        return Membership.objects.filter(user__student_number=student_number)

class CommunityMembersListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        community_id = self.kwargs.get('community_id')
        return Membership.objects.filter(community__id=community_id).select_related('user')

class CommunityDetailView(generics.RetrieveAPIView):
    serializer_class = CommunitySerializer
    queryset = Community.objects.all()
    lookup_field = 'id'

class PostCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCommunityMember]
    queryset = Post.objects.all()
    serializer_class = CreatePostSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


logger = logging.getLogger(__name__)

class GenerateSignedUrlView(APIView):
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
class ImageUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self):
        self.account_url = os.getenv('AZURE_BLOB_ACCOUNT_URL')
        self.credential = os.getenv('AZURE_BLOB_CREDENTIAL')
        self.account_name = os.getenv('AZURE_BLOB_ACCOUNT_NAME')
        self.account_key = os.getenv('AZURE_BLOB_ACCOUNT_KEY')
        self.container_name = 'synapsespace-temp-storage'

    def generate_presigned_url(self, blob_name):
        blob_service_client = BlobServiceClient(account_url=self.account_url, credential=self.credential)
        container_client = blob_service_client.get_container_client(self.container_name)

        sas_token = generate_blob_sas(
            account_name=self.account_name,
            container_name=self.container_name,
            blob_name=blob_name,
            account_key=self.account_key,
            permission=BlobSasPermissions(read=True, write=True),  # Ensure read and write permissions
            expiry=datetime.utcnow() + timedelta(hours=1)
        )

        return f"https://{blob_service_client.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"

    def post(self, request):
        serializer = ImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            image = serializer.validated_data['image']
            blob_name = f"images/{datetime.utcnow().isoformat()}_{image.name}"

            # Upload to Azure Blob Storage
            blob_service_client = BlobServiceClient(account_url=self.account_url, credential=self.credential)
            blob_client = blob_service_client.get_blob_client(container=self.container_name, blob=blob_name)

            blob_client.upload_blob(image, overwrite=True)

            # Generate the URL
            url = self.generate_presigned_url(blob_name)

            return Response({'url': url}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
logger = logging.getLogger(__name__)
import logging
import time
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import uuid

logger = logging.getLogger(__name__)


class MoveImageView(APIView):
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

class getCommunityPosts(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsCommunityMember]
    serializer_class = CommunityPostSerializer

    def get_queryset(self):
        community_id = self.kwargs.get('community_id')
        return Post.objects.filter(posted_in_id=community_id).order_by('-created_at')


class getCommunityPost(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsCommunityMember]
    serializer_class = getCommunityPostSerializer
    queryset = Post.objects.all()
    lookup_field = 'id'  # Assuming 'id' is the primary key for Post

    def get_object(self):
        community_id = self.kwargs.get('community_id')
        post_id = self.kwargs.get('post_id')
        return get_object_or_404(Post, id=post_id, posted_in=community_id)

class likePostView(APIView):
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
    permission_classes = [IsAuthenticated, IsCommunityMember]
    def post(self, request, community_id, post_id):
        post = Post.objects.get(id=post_id)
        user = request.user
        like = Likes.objects.filter(user=user, post=post).first()
        if like:
            like.delete()
            return Response({"message": "Post unliked successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Post not liked"}, status=status.HTTP_200_OK)

class getPostLikesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, community_id, post_id):
        post = get_object_or_404(Post, id=post_id, posted_in_id=community_id)
        likes = Likes.objects.filter(post=post)
        serializer = LikedPostSerializer(likes, many=True)
        return Response(serializer.data)

class CommentCreateView(generics.CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CreateCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentDetailView(generics.RetrieveAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

class PostCommentsView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id, parent=None)
class CommentUpdateView(generics.UpdateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save(updated_at=timezone.now())

class CommentDeleteView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    permission_classes = [permissions.IsAuthenticated]

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

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
        user.program = data.get('program', user.program)
        user.bio = data.get('bio', user.bio)
        user.interests = data.get('interests', user.interests)

        user.save()

        user_data = UserProfileSerializer(user).data
        return Response(user_data)

class UserActivitiesView(APIView):
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