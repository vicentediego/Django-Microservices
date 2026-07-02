from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

import jwt

from django.conf import settings

class JWTServiceAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get(
            "Authorization"
        )

        if not auth_header:
            raise AuthenticationFailed(
                'Token requerido'
            )
        
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(
                token,
                settings.JWT_SIGNING_KEY,
                algorithms=['HS256']
            )

            return (payload, None)
        
        except Exception:
            raise AuthenticationFailed(
                'Token inválido'
            )