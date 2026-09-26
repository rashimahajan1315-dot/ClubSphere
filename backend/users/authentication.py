from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import User


class MongoJWTAuthentication(BaseAuthentication):

    def authenticate(self, request):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return None

        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise AuthenticationFailed(
                "Authorization header must be: Bearer <token>"
            )

        token = parts[1]

        try:
            validated_token = UntypedToken(token)

        except (InvalidToken, TokenError):
            raise AuthenticationFailed("Invalid or expired token.")

        user_id = validated_token.get("user_id")

        if not user_id:
            raise AuthenticationFailed("Token does not contain user information.")

        user = User.objects(id=user_id).first()

        if user is None:
            raise AuthenticationFailed("User not found.")

        if not user.is_active:
            raise AuthenticationFailed("User account is inactive.")

        return (user, validated_token)