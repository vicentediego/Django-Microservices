from django.urls import path

from .views import(
    CategoryView,
    RawMaterialView,  
    RawMaterialDetailView,
    RawMaterialUpdateView,
    RawMaterialDeleteView,
    RawMaterialMovementView
)

urlpatterns = [
    path('categories/', CategoryView.as_view()),
    path('raw-materials/', RawMaterialView.as_view()),
    path('raw-materials/<int:pk>/', RawMaterialDetailView.as_view()),
    path('raw-materials/<int:pk>/update/', RawMaterialUpdateView.as_view()),
    path('raw-materials/<int:pk>/delete/', RawMaterialDeleteView.as_view()),
    path('raw-materials/movements/', RawMaterialMovementView.as_view()),
    path('raw-materials/movements/<int:pk>/', RawMaterialMovementView.as_view()),
]
