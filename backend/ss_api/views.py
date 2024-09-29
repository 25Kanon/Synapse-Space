import os
from dotenv import load_dotenv
from rest_framework import generics, permissions, status, serializers
from .models import Community, Membership
from .serializers import (UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
                          CustomTokenRefreshSerializer, CreateCommunitySerializer, CreateMembership ,
                          MembershipSerializer, CommunitySerializer)
from rest_framework_simplejwt.views import TokenRefreshView

import logging
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
import uuid

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
        # Pass the request data to the serializer

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # The validated data contains the token response generated in the serializer
        return Response(serializer.validated_data)

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
        blob_service_client = BlobServiceClient(account_url='https://cdnsynapsespace.blob.core.windows.net/', credential='xmA87nHDNUzzw9RjQIwoMzO+2MTAvXTzg35CN5B/ojYTbvJyY5iCTon149f4V7hke3aZSGdOiri3+ASt5I2L9w==')
        container_client = blob_service_client.get_container_client('synapsespace-storage')

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
    permission_classes = [IsAuthenticated]
    serializer_class = CommunitySerializer
    queryset = Community.objects.all()
    lookup_field = 'id'
