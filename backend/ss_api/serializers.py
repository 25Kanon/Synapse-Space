from rest_framework import serializers
from .models import Student

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'student_id', 'username', 'first_name', 'last_name', 'registration_form', 'email', 'password', 'profile_pic', 'interests', 'bio']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['first_name', 'last_name', 'username', 'email', 'password']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'username': {'required': True},
            'email': {'required': True},
            'password': {'required': True, 'write_only': True},
        }

    def create(self, validated_data):
        student = Student.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password']
        )
        student.first_name = validated_data.get('first_name', None)
        student.last_name = validated_data.get('last_name', None)
        student.registration_form = validated_data.get('registration_form', None)
        student.student_id = validated_data.get('student_id', None)
        student.profile_pic = validated_data.get('profile_pic', None)
        student.interests = validated_data.get('interests', None)
        student.save()
        return student
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)