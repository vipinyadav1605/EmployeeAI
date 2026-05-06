import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import Employee
from django.conf import settings


class JWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        token = request.headers.get('Authorization')

        if not token:
            return None  

        try:
            token = token.split(" ")[1] 
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

            user_id = decoded.get('id')

            user = Employee.objects.get(empId=user_id)

            return (user, None)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token expired")

        except jwt.DecodeError:
            raise AuthenticationFailed("Invalid token")

        except Employee.DoesNotExist:
            raise AuthenticationFailed("User not found")