from django.urls import path
from .views import(
    RegisterView,
    UserListView,
    UserDetailView,
    UserUpdateView,
    UserDeleteView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('users/', UserListView.as_view()),
    path('users/<int:pk>/', UserDetailView.as_view()),
    path('users/<int:pk>/update/', UserUpdateView.as_view()),
    path('users/<int:pk>/delete/', UserDeleteView.as_view()),
]