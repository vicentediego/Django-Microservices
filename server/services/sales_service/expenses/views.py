from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import requests
from .models import Category, Expense
from .serializers import (
    CategorySerializer,
    ExpenseSerializer
)

from .permissions import IsAuthenticatedService
from .authentication import JWTServiceAuthentication

# Create your views here.

class CategoryView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request):
        categories = Category.objects.all()

        serializer = CategorySerializer(
            categories,
            many=True
        )
