from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["email"] = user.email
        token["role"] = user.role
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'role',
        ]

        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'employee')
        )
        return user
        
    def update(self, instance, validated_data):
        instance.username = validated_data.get(
            'username', instance.username
        )
        instance.email = validated_data.get(
            'email', instance.email
        )
        instance.role = validated_data.get(
            'role', instance.role
        )

        password = validated_data.get(
            'password', None
        )
        if password:
            instance.set_password(password)

        instance.save()
        return instance