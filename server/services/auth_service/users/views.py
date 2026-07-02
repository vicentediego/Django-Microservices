from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    UserSerializer,
    CustomTokenObtainPairSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    def post(self, request):
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#Obtener todos los usuarios
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
#Obtener usuario por id
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try: 
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error: Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
                )
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

#Actualizar usuario 
class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try: 
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error: Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
                )
        
        serializer = UserSerializer(
            user, data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#Eliminar usuario
class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try: 
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error: Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
                )
        
        user.delete()
        return Response(
            {"message": "Usuario eliminado exitosamente"},
            status=status.HTTP_204_NO_CONTENT
            )
