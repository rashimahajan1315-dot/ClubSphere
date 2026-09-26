from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Club
from .serializers import ClubSerializer


# =========================================================
# STUDENT / AUTHENTICATED CLUB LIST
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def club_list(request):

    category = request.GET.get("category")
    search = request.GET.get("search")

    clubs = Club.objects(status="approved")

    if category:
        clubs = clubs.filter(category__iexact=category)

    if search:
        clubs = clubs.filter(name__icontains=search)

    return Response(
        ClubSerializer(clubs, many=True).data,
        status=status.HTTP_200_OK
    )


# =========================================================
# CLUB DETAIL
# =========================================================

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def club_detail(request, club_id):

    club = Club.objects(id=club_id).first()

    if club is None:
        return Response(
            {"detail": "Club not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # =====================================================
    # GET CLUB DETAILS
    # =====================================================

    if request.method == "GET":

        return Response(
            ClubSerializer(club).data,
            status=status.HTTP_200_OK
        )

    # =====================================================
    # PATCH - UPDATE CLUB
    # =====================================================

    # Central Admin can update any club
    if request.user.role == "central_admin":
        pass

    # Club Admin can update only their own club
    elif request.user.role == "club_admin":

        if request.user.club_id != str(club.id):
            return Response(
                {
                    "detail":
                    "You can only manage your own club."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Club Admin cannot modify sensitive fields
        restricted_fields = {
            "status",
            "admin_ids"
        }

        if restricted_fields.intersection(request.data.keys()):
            return Response(
                {
                    "detail":
                    "Club Admin cannot modify status or admin_ids."
                },
                status=status.HTTP_403_FORBIDDEN
            )

    # Students and other roles cannot update clubs
    else:
        return Response(
            {
                "detail":
                "You do not have permission to update clubs."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = ClubSerializer(
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        for field, value in serializer.validated_data.items():
            setattr(club, field, value)

        club.save()

        return Response(
            ClubSerializer(club).data,
            status=status.HTTP_200_OK
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# CENTRAL ADMIN - CREATE CLUB
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_club(request):

    if request.user.role != "central_admin":
        return Response(
            {
                "detail":
                "Only central admin can create clubs."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = ClubSerializer(
        data=request.data
    )

    if serializer.is_valid():

        club = Club(
            **serializer.validated_data
        )

        # New clubs require Central Admin approval
        club.status = "pending"
        club.save()

        return Response(
            ClubSerializer(club).data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# CENTRAL ADMIN - DELETE CLUB
# =========================================================

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_club(request, club_id):

    if request.user.role != "central_admin":
        return Response(
            {
                "detail":
                "Only central admin can delete clubs."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    club = Club.objects(
        id=club_id
    ).first()

    if club is None:
        return Response(
            {"detail": "Club not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    club.delete()

    return Response(
        {
            "message":
            "Club deleted successfully."
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# CENTRAL ADMIN - ALL CLUBS
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_club_list(request):

    if request.user.role != "central_admin":
        return Response(
            {
                "detail":
                "Only central admin can access all clubs."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    status_filter = request.GET.get("status")

    if status_filter:
        clubs = Club.objects(
            status=status_filter
        )
    else:
        clubs = Club.objects()

    return Response(
        ClubSerializer(
            clubs,
            many=True
        ).data,
        status=status.HTTP_200_OK
    )


# =========================================================
# CENTRAL ADMIN - APPROVE CLUB
# =========================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def approve_club(request, club_id):

    if request.user.role != "central_admin":
        return Response(
            {
                "detail":
                "Only central admin can approve clubs."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    club = Club.objects(
        id=club_id
    ).first()

    if club is None:
        return Response(
            {"detail": "Club not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    club.status = "approved"
    club.save()

    return Response(
        {
            "message":
            "Club approved successfully.",
            "club":
            ClubSerializer(club).data
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# CENTRAL ADMIN - REJECT CLUB
# =========================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def reject_club(request, club_id):

    if request.user.role != "central_admin":
        return Response(
            {
                "detail":
                "Only central admin can reject clubs."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    club = Club.objects(
        id=club_id
    ).first()

    if club is None:
        return Response(
            {"detail": "Club not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    club.status = "rejected"
    club.save()

    return Response(
        {
            "message":
            "Club rejected successfully.",
            "club":
            ClubSerializer(club).data
        },
        status=status.HTTP_200_OK
    )