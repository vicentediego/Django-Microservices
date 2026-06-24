from django.urls import path

from .views import (
    SaleView,
    SaleDetailView,
    SaleUpdateView,
    SaleDeleteView
)

urlpatterns = [
    path('sales/', SaleView.as_view()),
    path('sales/<int:pk>/', SaleDetailView.as_view()),
    path('sales/<int:pk>/update/', SaleUpdateView.as_view()),
    path('sales/<int:pk>/delete/', SaleDeleteView.as_view()),
]
