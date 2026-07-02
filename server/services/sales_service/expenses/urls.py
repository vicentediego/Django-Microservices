from django.urls import path

from .views import (
    CategoryView,
    CategoryDetailView,
    ExpenseView,
    ExpenseDetailView,
    ExpenseUpdateView,
    ExpenseDeleteView
)

urlpatterns = [
    path('categories/', CategoryView.as_view()),
    path('categories/<int:pk>/', CategoryDetailView.as_view()),
    path('expenses/', ExpenseView.as_view()),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view()),
    path('expenses/<int:pk>/update/', ExpenseUpdateView.as_view()),
    path('expenses/<int:pk>/delete/', ExpenseDeleteView.as_view()),
]
