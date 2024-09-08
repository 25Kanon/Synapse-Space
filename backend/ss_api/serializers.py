from .models import Student
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'student_number', 'username', 'first_name', 'last_name', 'registration_form', 'email', 'password', 'profile_pic', 'interests', 'bio']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
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
        student = Student.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            student_number=validated_data['student_number'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return student
class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username_or_email = data.get('username_or_email')
        password = data.get('password')

        if username_or_email and password:
            user = authenticate(username=username_or_email, password=password)
            if not user:
                UserModel = get_user_model()
                try:
                    user_obj = UserModel.objects.get(email=username_or_email)
                    user = authenticate(username=user_obj.username, password=password)
                except UserModel.DoesNotExist:
                    pass

            if user:
                data['user'] = user
            else:
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Must include 'username_or_email' and 'password'")
        return data

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, data):
        refresh = data.get('refresh')
        if not refresh:
            raise serializers.ValidationError("Refresh token is required")
        return data