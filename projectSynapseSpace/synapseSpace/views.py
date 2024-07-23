from django.shortcuts import render
from rest_framework.views import APIView
from . models import *
from rest_framework.response import Response
from . serializers import *
# Create your views here.
class reactView(APIView):
    def get(self, request):
        data = react.objects.all()
        serializer = reactSerializer(data, many=True)
        return Response(serializer.data)