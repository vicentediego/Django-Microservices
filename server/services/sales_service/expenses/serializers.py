from rest_framework import serializers
from .models import Category, Expense

class CategorySerializer(serializers.Serializer):
    class Meta:
        model = Category
        fields = '__all__'

class ExpenseSerializer(serializers.Serializer):
    class Meta:
        model = Expense
        fields = '__all__'