from django.urls import path
from .views import(
    CategoryView,
    ProductView,
    ProductDetailView,
    ProductUpdateView,
    ProductDeleteView,
)

urlpatterns = [
    path('categories/', CategoryView.as_view()),
    path('products/', ProductView.as_view()),
    path('products/<int:pk>/', ProductDetailView.as_view()),
    path('products/<int:pk>/update/', ProductUpdateView.as_view()),
    path('products/<int:pk>/delete/', ProductDeleteView.as_view() )
] 