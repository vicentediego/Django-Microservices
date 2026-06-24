from rest_framework import serializers

from .models import (
    Category,
    Raw_material,
    Raw_material_movement
)

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'

class RawMaterialSerializer(serializers.ModelSerializer):

    class Meta:
        model = Raw_material
        fields = '__all__'

class RawMaterialMovementSerializer(serializers.ModelSerializer):

    class Meta:
        model = Raw_material_movement
        fields = '__all__'
