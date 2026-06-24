from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Create your views here
import requests
from .models import Sale
from .serializers import SaleSerializer

from .authentication import (JWTServiceAuthentication)
from .permissions import (isAuthenticatedService)

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
            "description"
        )
        #Consultar Inventory

        inventory_response = requests.get(
            f"http://inventory-service:8002/api/products/{product_id}/",
            headers={
                "Authorization":
                request.headers.get(
                    "Authorization"
                )
            }
        )

        if inventory_response.status_code !=200:
            return Response(
                {
                    "error":
                    "Producto no encontrado"
                },
                status = 404
            )
        
        product = inventory_response.json()

        current_stock = product["stock"]

        if current_stock < quantity:
            return Response(
                {
                    "error":
                    "Stock insuficiente"
                },
                status = 400
            )
        
        #Descontar stock

        discount_response=requests.put(
            f"http://inventory-service:8002/api/products/{product_id}/stock/",
            json={
                "quantity": quantity
            },
            headers={
                "Authorization":
                request.headers.get(
                    "Authorization"
                )
            }
        )

        if discount_response.status_code != 200:
            return Response(
                {
                    "error":
                    "No se pudo descontar stock"
                },
                status = 400
            )
        
        total = (
            float(product["price"]) * quantity
        )

        sale = Sale.objects.create(
            user_id=request.user["user_id"],
            product_id=product_id,
            quantity=quantity,
            description = description,
            total = total
        )

        serializer = SaleSerializer(
            sale
        )

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
                action = "discount"
            else:
                action = "restock"

            stock_response = requests.put(
                f"http://inventory-service:8002/api/products/{sale.product_id}/stock/",
                json={
                    "quantity": abs(diff),
                    "action": action
                },
                headers={
                    "Authorization":
                    request.headers.get(
                        "Authorization"
                    )
                }
            )

            if stock_response.status_code != 200:
                return Response(
                    {
                        "error":
                        "No se pudo actualizar stock"
                    },
                    status=400
                )

        inventory_response = requests.get(
            f"http://inventory-service:8002/api/products/{sale.product_id}/",
            headers={
                "Authorization":
                request.headers.get(
                    "Authorization"
                )
            }
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

        stock_response = requests.put(
            f"http://inventory-service:8002/api/products/{sale.product_id}/stock/",
            json={
                "quantity": sale.quantity,
                "action": "restock"
            },
            headers={
                "Authorization":
                request.headers.get(
                    "Authorization"
                )
            }
        )

        if stock_response.status_code != 200:
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
