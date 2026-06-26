from rest_framework import serializers

from .models import Category, Product, ProductMovement

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = '__all__'

class ProductMovementSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductMovement
        fields = '__all__'
