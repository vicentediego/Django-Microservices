from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Category, Raw_material, Raw_material_movement

from .serializers import(
    CategorySerializer,
    RawMaterialSerializer,
    RawMaterialMovementSerializer
)

from .authentication import JWTServiceAuthentication
from .permissions import IsAuthenticatedService

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

        return Response(serializer.data)
    
    def post(self, request):

        serializer = CategorySerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors)
        
    def put(self, request, pk):
        category = Category.objects.get(pk=pk)

        serializer = CategorySerializer(
            category,
            data = request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors)
    
    def delete(self, request, pk):
        category = Category.objects.get(pk=pk)
        category.delete()

        Response({"message":"Categoría eliminada"})


class RawMaterialView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request):
        raw_materials=Raw_material.objects.all()

        serializer = RawMaterialSerializer(
            raw_materials,
            many=True
        )

        return Response(serializer.data)
    
    def post(self, request):
        serializer = RawMaterialSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors)
    

class RawMaterialDetailView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request, pk):
        raw_material = Raw_material.objects.get(pk=pk)

        serializer = RawMaterialSerializer(raw_material)

        return Response(serializer.data)
    
class RawMaterialUpdateView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def put(self, request, pk):
        raw_material = Raw_material.objects.get(pk=pk)

        serializer = RawMaterialSerializer(
            raw_material,
            data = serializer.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors)
    

class RawMaterialDeleteView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def delete(self, request, pk):
        raw_material = Raw_material.objects.get(pk=pk)

        raw_material.delete()

        return Response(
            {"message":"Insumo eliminado correctamente"}
        )


class RawMaterialMovementView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request):
        raw_material_movements = Raw_material_movement.objects.all()

        serializer = RawMaterialMovementSerializer(
            raw_material_movements,
            many=True
        )

        return Response(serializer.data)
    
    def post(self, request):
        serializer = RawMaterialMovementSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors)
    
    def put(self, request, pk):
        raw_material_movement = Raw_material_movement.objects.get(pk=pk)

        serializer = RawMaterialMovementSerializer(
            raw_material_movement,
            data = request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors)
    
    def delete(self, request, pk):
        raw_material_movement = Raw_material_movement.objects.get(pk=pk)

        raw_material_movement.delete()

        return Response(
            {"message":"Movimiento de inventario de insumos eliminado" }
        )