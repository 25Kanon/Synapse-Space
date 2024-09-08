from rest_framework import serializers
from .models import Student

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
        student = Student.objects.create(**validated_data)
        return student
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)