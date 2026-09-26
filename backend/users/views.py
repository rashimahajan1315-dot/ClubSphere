from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):

    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    if not name or not email or not password:
        return Response(
            {
                "detail": "Name, email and password are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    email = email.lower().strip()

    if User.objects(email=email).first():
        return Response(
            {
                "detail": "Email already registered."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User(
        name=name,
        email=email,
        role="student"
    )

    user.set_password(password)
    user.save()

    return Response(
        {
            "message": "Registration successful.",
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "club_id": user.club_id
            }
        },
        status=status.HTTP_201_CREATED
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):

    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {
                "detail": "Email and password are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    email = email.lower().strip()

    user = User.objects(email=email).first()

    if user is None or not user.check_password(password):
        return Response(
            {
                "detail": "Invalid email or password."
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {
                "detail": "Your account is inactive."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    refresh = RefreshToken()

    refresh["user_id"] = str(user.id)
    refresh["email"] = user.email
    refresh["role"] = user.role

    return Response(
        {
            "message": "Login successful.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "club_id": user.club_id
            }
        },
        status=status.HTTP_200_OK
    )