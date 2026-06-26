from django.urls import path
from .views import(
    CategoryView,
    CategoryDetailView,
    ProductView,
    ProductDetailView,
    ProductUpdateView,
    ProductDeleteView,
    UpdateStockView,
    ProductMovementView
)

urlpatterns = [
    path('categories/', CategoryView.as_view()),
    path('categories/<int:pk>/', CategoryDetailView.as_view()),
    path('products/', ProductView.as_view()),
    path('products/<int:pk>/', ProductDetailView.as_view()),
    path('products/<int:pk>/update/', ProductUpdateView.as_view()),
    path('products/<int:pk>/delete/', ProductDeleteView.as_view()),
    path('products/<int:pk>/stock/', UpdateStockView.as_view()),
    path('products/movements/', ProductMovementView.as_view()),
    path('products/movements/<int:pk>/', ProductMovementView.as_view()),
] 