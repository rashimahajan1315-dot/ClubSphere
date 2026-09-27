from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


# ============================================================
# REGISTER
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):

    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    if not name or not email or not password:
        return Response(
            {"detail": "Name, email and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = email.lower().strip()

    if User.objects(email=email).first():
        return Response(
            {"detail": "Email already registered."},
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


# ============================================================
# LOGIN
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):

    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"detail": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = email.lower().strip()

    user = User.objects(email=email).first()

    if user is None or not user.check_password(password):
        return Response(
            {"detail": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {"detail": "Your account is inactive."},
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


# ============================================================
# CENTRAL ADMIN - VIEW ALL USERS
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_user_list(request):

    if request.user.role != "central_admin":
        return Response(
            {
                "detail":
                "Only central admin can access all users."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    role_filter = request.GET.get("role")

    if role_filter:
        users = User.objects(role=role_filter)
    else:
        users = User.objects()

    user_data = []

    for user in users:
        user_data.append(
            {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "club_id": user.club_id,
                "is_active": user.is_active,
                "created_at": user.created_at
            }
        )

    return Response(
        user_data,
        status=status.HTTP_200_OK
    )


# ============================================================
# CENTRAL ADMIN - ACTIVATE / DEACTIVATE USER
# ============================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_status(request, user_id):

    if request.user.role != "central_admin":
        return Response(
            {
                "detail":
                "Only central admin can change user status."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    user = User.objects(id=user_id).first()

    if user is None:
        return Response(
            {"detail": "User not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Central Admin cannot deactivate their own account
    if str(user.id) == str(request.user.id):
        return Response(
            {
                "detail":
                "You cannot change your own account status."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    is_active = request.data.get("is_active")

    if not isinstance(is_active, bool):
        return Response(
            {
                "detail":
                "is_active must be true or false."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    user.is_active = is_active
    user.save()

    return Response(
        {
            "message":
            "User activated successfully."
            if is_active
            else "User deactivated successfully.",

            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "club_id": user.club_id,
                "is_active": user.is_active
            }
        },
        status=status.HTTP_200_OK
    )


# ============================================================
# CENTRAL ADMIN - ASSIGN CLUB ADMIN
# ============================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def assign_club_admin(request, user_id):

    if request.user.role != "central_admin":
        return Response(
            {
                "detail":
                "Only central admin can assign club admins."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    user = User.objects(id=user_id).first()

    if user is None:
        return Response(
            {"detail": "User not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if user.role != "club_admin":
        return Response(
            {
                "detail":
                "Selected user is not a club admin."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    club_id = request.data.get("club_id")

    if not club_id:
        return Response(
            {"detail": "club_id is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    from clubs.models import Club

    club = Club.objects(id=club_id).first()

    if club is None:
        return Response(
            {"detail": "Club not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Remove admin from previous club
    if user.club_id and user.club_id != str(club.id):

        old_club = Club.objects(
            id=user.club_id
        ).first()

        if old_club:

            old_club.admin_ids = [
                admin_id
                for admin_id in old_club.admin_ids
                if admin_id != str(user.id)
            ]

            old_club.save()

    # Assign new club
    user.club_id = str(club.id)
    user.save()

    # Add admin to club.admin_ids
    if str(user.id) not in club.admin_ids:

        club.admin_ids.append(
            str(user.id)
        )

        club.save()

    return Response(
        {
            "message":
            "Club admin assigned successfully.",

            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "club_id": user.club_id,
                "is_active": user.is_active
            },

            "club": {
                "id": str(club.id),
                "name": club.name,
                "admin_ids": club.admin_ids
            }
        },
        status=status.HTTP_200_OK
    )


# ============================================================
# CENTRAL ADMIN - DASHBOARD STATISTICS
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_stats(request):

    if request.user.role != "central_admin":
        return Response(
            {
                "detail":
                "Only central admin can access dashboard statistics."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    from clubs.models import Club
    from recruitments.models import Recruitment
    from applications.models import Application

    # --------------------------------------------------------
    # USER STATISTICS
    # --------------------------------------------------------

    total_users = User.objects.count()

    total_students = User.objects(
        role="student"
    ).count()

    total_club_admins = User.objects(
        role="club_admin"
    ).count()

    total_central_admins = User.objects(
        role="central_admin"
    ).count()

    # --------------------------------------------------------
    # CLUB STATISTICS
    # --------------------------------------------------------

    total_clubs = Club.objects.count()

    approved_clubs = Club.objects(
        status="approved"
    ).count()

    pending_clubs = Club.objects(
        status="pending"
    ).count()

    rejected_clubs = Club.objects(
        status="rejected"
    ).count()

    # --------------------------------------------------------
    # RECRUITMENT STATISTICS
    # --------------------------------------------------------

    total_recruitments = Recruitment.objects.count()

    open_recruitments = Recruitment.objects(
        status="open"
    ).count()

    closed_recruitments = Recruitment.objects(
        status="closed"
    ).count()

    # --------------------------------------------------------
    # APPLICATION STATISTICS
    # --------------------------------------------------------

    total_applications = Application.objects.count()

    applied = Application.objects(
        status="Applied"
    ).count()

    under_review = Application.objects(
        status="Under Review"
    ).count()

    shortlisted = Application.objects(
        status="Shortlisted"
    ).count()

    selected = Application.objects(
        status="Selected"
    ).count()

    rejected = Application.objects(
        status="Rejected"
    ).count()

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return Response(
        {
            "users": {
                "total": total_users,
                "students": total_students,
                "club_admins": total_club_admins,
                "central_admins": total_central_admins
            },

            "clubs": {
                "total": total_clubs,
                "approved": approved_clubs,
                "pending": pending_clubs,
                "rejected": rejected_clubs
            },

            "recruitments": {
                "total": total_recruitments,
                "open": open_recruitments,
                "closed": closed_recruitments
            },

            "applications": {
                "total": total_applications,
                "applied": applied,
                "under_review": under_review,
                "shortlisted": shortlisted,
                "selected": selected,
                "rejected": rejected
            }
        },
        status=status.HTTP_200_OK
    )