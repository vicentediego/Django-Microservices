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
        authentication_classes = [JWTServiceAuthentication]

        permission_classes = [isAuthenticatedService]

        product_id = request.data.get(
            "product_id"
        )

        quantity = int(
            request.data.get("quantity")
        )

        #Consultar Inventory

        inventory_response = requests.get(
            f"http://inventory_service:8002/api/products/{product_id}/",
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
            f"https://inventory_service:8002:/api/products/{product_id}/stock/",
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
            total = total
        )

        serializer = SaleSerializer(
            sale
        )

        return Response(
            serializer.data,
            status=201
        )
