from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Category, Product
from .serializers import(
    CategorySerializer,
    ProductSerializer
)
# Create your views here.
class CategoryView(APIView):
   

    def get(self, request):
        categories = Category.objects.all()

        serializer = CategorySerializer(
            categories,
            many=True
        )

        return Response(serializer.data)
    
    def post(self, request):

        serializer = CategorySerializer(
            data = request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors)
    
    
class ProductView(APIView):



    def get(self, request):

        products = Product.objects.all()

        serializer = ProductSerializer(
            products,
            many=True
        )

        return Response(serializer.data)
    

    def post(self, request):
        serializer = ProductSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors)

class ProductDetailView(APIView):


    def get(self, request, pk):
        product = Product.objects.get(pk=pk)

        serializer = ProductSerializer(product)

        return Response(serializer.data)

class ProductUpdateView(APIView):

    def put(self, request, pk):
        product = Product.objects.get(pk=pk)

        serializer = ProductSerializer(
            product,
            data = request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)
        
        return Response(serializer.errors)
    
class ProductDeleteView(APIView):


    def delete(self, request, pk):
        product = Product.objects.get(pk=pk)
        product.delete()

        Response({"message":"Producto eliminado"})

