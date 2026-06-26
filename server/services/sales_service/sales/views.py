from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import requests
from .models import Sale
from .serializers import SaleSerializer

from .authentication import (JWTServiceAuthentication)
from .permissions import (isAuthenticatedService)

INVENTORY_URL = "http://inventory-service:8002/api"

def get_auth_header(request):
    return {
        "Authorization":
        request.headers.get("Authorization")
    }

def create_product_movement(request, product_id, quantity, type_of, description):
    return requests.post(
        f"{INVENTORY_URL}/products/movements/",
        json={
            "product": product_id,
            "quantity": quantity,
            "type_of": type_of,
            "description": description
        },
        headers=get_auth_header(request)
    )

class SaleView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [isAuthenticatedService]

    def get(self, request):
        sales = Sale.objects.all()

        serializer = SaleSerializer(
            sales,
            many = True
        )

        return Response(serializer.data)

    def post(self, request):

        product_id = request.data.get(
            "product_id"
        )

        quantity = int(
            request.data.get("quantity")
        )

        description = request.data.get(
            "description", "venta"
        )

        inventory_response = requests.get(
            f"{INVENTORY_URL}/products/{product_id}/",
            headers=get_auth_header(request)
        )

        if inventory_response.status_code != 200:
            return Response(
                {
                    "error":
                    "Producto no encontrado"
                },
                status=404
            )

        product = inventory_response.json()

        current_stock = product["stock"]

        if current_stock < quantity:
            return Response(
                {
                    "error":
                    "Stock insuficiente"
                },
                status=400
            )

        movement_response = create_product_movement(
            request, product_id, quantity,
            "stock_out", "venta"
        )

        if movement_response.status_code != 201:
            return Response(
                {
                    "error":
                    "No se pudo registrar el movimiento"
                },
                status=400
            )

        total = (
            float(product["price"]) * quantity
        )

        sale = Sale.objects.create(
            user_id=request.user["user_id"],
            product_id=product_id,
            quantity=quantity,
            description=description,
            total=total
        )

        serializer = SaleSerializer(sale)

        return Response(
            serializer.data,
            status=201
        )

class SaleDetailView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [isAuthenticatedService]

    def get(self, request, pk):
        try:
            sale = Sale.objects.get(pk=pk)
        except Sale.DoesNotExist:
            return Response(
                {"error": "Venta no encontrada"},
                status=404
            )

        serializer = SaleSerializer(sale)
        return Response(serializer.data)

class SaleUpdateView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [isAuthenticatedService]

    def put(self, request, pk):
        try:
            sale = Sale.objects.get(pk=pk)
        except Sale.DoesNotExist:
            return Response(
                {"error": "Venta no encontrada"},
                status=404
            )

        new_quantity = int(
            request.data.get("quantity", sale.quantity)
        )

        diff = new_quantity - sale.quantity

        if diff != 0:
            if diff > 0:
                type_of = "stock_out"
            else:
                type_of = "stock_in"

            movement_response = create_product_movement(
                request, sale.product_id, abs(diff),
                type_of, "ajuste venta"
            )

            if movement_response.status_code != 201:
                return Response(
                    {
                        "error":
                        "No se pudo actualizar stock"
                    },
                    status=400
                )

        inventory_response = requests.get(
            f"{INVENTORY_URL}/products/{sale.product_id}/",
            headers=get_auth_header(request)
        )

        if inventory_response.status_code != 200:
            return Response(
                {"error": "Producto no encontrado"},
                status=404
            )

        product = inventory_response.json()

        sale.quantity = new_quantity
        sale.description = request.data.get(
            "description", sale.description
        )
        sale.total = (
            float(product["price"]) * new_quantity
        )
        sale.save()

        serializer = SaleSerializer(sale)
        return Response(serializer.data)

class SaleDeleteView(APIView):
    authentication_classes = [JWTServiceAuthentication]
    permission_classes = [isAuthenticatedService]

    def delete(self, request, pk):
        try:
            sale = Sale.objects.get(pk=pk)
        except Sale.DoesNotExist:
            return Response(
                {"error": "Venta no encontrada"},
                status=404
            )

        movement_response = create_product_movement(
            request, sale.product_id, sale.quantity,
            "stock_in", "cancelacion venta"
        )

        if movement_response.status_code != 201:
            return Response(
                {
                    "error":
                    "No se pudo devolver stock"
                },
                status=400
            )

        sale.delete()
        return Response(
            {"message": "Venta eliminada"},
            status=200
        )
