from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Category, Expense
from .serializers import (
    CategorySerializer,
    ExpenseSerializer
)

from .permissions import IsAuthenticatedService
from .authentication import JWTServiceAuthentication


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
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


class CategoryDetailView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(
                {"error": "Categoría no encontrada"},
                status=404
            )

        serializer = CategorySerializer(category)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(
                {"error": "Categoría no encontrada"},
                status=404
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
            status=400
        )

    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(
                {"error": "Categoría no encontrada"},
                status=404
            )

        category.delete()
        return Response(
            {"message": "Categoría eliminada"}
        )


class ExpenseView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request):
        expenses = Expense.objects.all()

        serializer = ExpenseSerializer(
            expenses,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        quantity = int(data.get("quantity", 1))
        unit_price = float(data.get("unit_price", 0))
        data["total"] = unit_price * quantity

        serializer = ExpenseSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


class ExpenseDetailView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def get(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk)
        except Expense.DoesNotExist:
            return Response(
                {"error": "Gasto no encontrado"},
                status=404
            )

        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)


class ExpenseUpdateView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def put(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk)
        except Expense.DoesNotExist:
            return Response(
                {"error": "Gasto no encontrado"},
                status=404
            )

        data = request.data.copy()
        quantity = int(data.get("quantity", expense.quantity))
        unit_price = float(data.get("unit_price", expense.unit_price))
        data["total"] = unit_price * quantity

        serializer = ExpenseSerializer(
            expense,
            data=data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )


class ExpenseDeleteView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [IsAuthenticatedService]

    def delete(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk)
        except Expense.DoesNotExist:
            return Response(
                {"error": "Gasto no encontrado"},
                status=404
            )

        expense.delete()
        return Response(
            {"message": "Gasto eliminado"}
        )
