from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Category, Raw_material, Raw_material_movement

from .serializers import(
    CategorySerializer,
    RawMaterialSerializer,
    RawMaterialMovementSerializer
)

from .authentication import JWTServiceAuthentication
from .permissions import IsAuthenticatedService


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
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def put(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(
                {"error": "Categoría no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CategorySerializer(
            category,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(
                {"error": "Categoría no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        category.delete()
        return Response(
            {"message": "Categoría eliminada"}
        )


class RawMaterialView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request):
        raw_materials = Raw_material.objects.all()

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
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class RawMaterialDetailView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request, pk):
        try:
            raw_material = Raw_material.objects.get(pk=pk)
        except Raw_material.DoesNotExist:
            return Response(
                {"error": "Insumo no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RawMaterialSerializer(raw_material)
        return Response(serializer.data)


class RawMaterialUpdateView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def put(self, request, pk):
        try:
            raw_material = Raw_material.objects.get(pk=pk)
        except Raw_material.DoesNotExist:
            return Response(
                {"error": "Insumo no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RawMaterialSerializer(
            raw_material,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class RawMaterialDeleteView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def delete(self, request, pk):
        try:
            raw_material = Raw_material.objects.get(pk=pk)
        except Raw_material.DoesNotExist:
            return Response(
                {"error": "Insumo no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        raw_material.delete()
        return Response(
            {"message": "Insumo eliminado"}
        )


class RawMaterialMovementView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request):
        raw_material_movements = (
            Raw_material_movement.objects.all()
        )

        serializer = RawMaterialMovementSerializer(
            raw_material_movements,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = RawMaterialMovementSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        movement = serializer.save()
        raw_material = movement.raw_material

        with transaction.atomic():
            if movement.type_of == Raw_material_movement.Status.STOCK_IN:
                raw_material.quantity += movement.quantity
            else:
                if raw_material.quantity < movement.quantity:
                    movement.delete()
                    return Response(
                        {
                            "error":
                            f"Stock insuficiente. Stock actual: {raw_material.quantity}"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                raw_material.quantity -= movement.quantity

            raw_material.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    def put(self, request, pk):
        try:
            movement = Raw_material_movement.objects.get(
                pk=pk
            )
        except Raw_material_movement.DoesNotExist:
            return Response(
                {"error": "Movimiento no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        raw_material = movement.raw_material
        old_type = movement.type_of
        old_quantity = movement.quantity

        serializer = RawMaterialMovementSerializer(
            movement,
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            if old_type == Raw_material_movement.Status.STOCK_IN:
                raw_material.quantity -= old_quantity
            else:
                raw_material.quantity += old_quantity

            updated_movement = serializer.save()

            if updated_movement.type_of == Raw_material_movement.Status.STOCK_IN:
                raw_material.quantity += updated_movement.quantity
            else:
                if raw_material.quantity < updated_movement.quantity:
                    raise ValueError("Stock insuficiente")
                raw_material.quantity -= updated_movement.quantity

            raw_material.save()

        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            movement = Raw_material_movement.objects.get(
                pk=pk
            )
        except Raw_material_movement.DoesNotExist:
            return Response(
                {"error": "Movimiento no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        raw_material = movement.raw_material

        with transaction.atomic():
            if movement.type_of == Raw_material_movement.Status.STOCK_IN:
                if raw_material.quantity < movement.quantity:
                    return Response(
                        {
                            "error":
                            "No se puede eliminar. El stock quedaría negativo."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                raw_material.quantity -= movement.quantity
            else:
                raw_material.quantity += movement.quantity

            raw_material.save()
            movement.delete()

        return Response(
            {"message": "Movimiento eliminado"}
        )
