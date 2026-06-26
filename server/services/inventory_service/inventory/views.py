from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db import transaction
from rest_framework import status

from .models import Category, Product, ProductMovement
from .serializers import(
    CategorySerializer,
    ProductSerializer,
    ProductMovementSerializer
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
            data = request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors)
    
    
    
class CategoryDetailView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

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

        return Response(
            {"Message":"Categoría eliminada correctamente"}
        )
    
class ProductView(APIView):

    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

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

    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request, pk):
        product = Product.objects.get(pk=pk)

        serializer = ProductSerializer(product)

        return Response(serializer.data)

class ProductUpdateView(APIView):

    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

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

    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def delete(self, request, pk):
        product = Product.objects.get(pk=pk)
        product.delete()

        return Response({"message":"Producto eliminado"})


class UpdateStockView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)

            quantity = int(
                request.data.get("quantity", 0)
            )

            action = request.data.get(
                "action", "discount"
            )

            if quantity <= 0:
                return Response(
                    {
                        "error":
                        "Cantidad inválida"
                    },
                    status=400
                )

            if action == "discount":
                if product.stock < quantity:
                    return Response(
                        {
                            "error":
                            "Stock insuficiente"
                        },
                        status=400
                    )
                product.stock -= quantity

            elif action == "restock":
                product.stock += quantity

            else:
                return Response(
                    {
                        "error":
                        "Acción inválida"
                    },
                    status=400
                )

            product.save()

            serializer = ProductSerializer(
                product
            )

            return Response(serializer.data)

        except Product.DoesNotExist:
            return Response(
                {
                    "error":
                    "Producto no encontrado"
                },
                status=404
            )


class ProductMovementView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request):
        movements = ProductMovement.objects.all()

        serializer = ProductMovementSerializer(
            movements,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = ProductMovementSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        movement = serializer.save()
        product = movement.product

        with transaction.atomic():
            if movement.type_of == ProductMovement.Status.STOCK_IN:
                product.stock += movement.quantity
            else:
                if product.stock < movement.quantity:
                    movement.delete()
                    return Response(
                        {
                            "error":
                            f"Stock insuficiente. Stock actual: {product.stock}"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                product.stock -= movement.quantity

            product.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    def delete(self, request, pk):
        movement = ProductMovement.objects.get(pk=pk)
        product = movement.product

        with transaction.atomic():
            if movement.type_of == ProductMovement.Status.STOCK_IN:
                if product.stock < movement.quantity:
                    return Response(
                        {
                            "error":
                            "No se puede eliminar. El stock quedaria negativo."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                product.stock -= movement.quantity
            else:
                product.stock += movement.quantity

            product.save()
            movement.delete()

        return Response(
            {"message": "Movimiento eliminado correctamente"}
        )
