from datetime import datetime, timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Recruitment
from .serializers import RecruitmentSerializer
from clubs.models import Club


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def recruitment_list(request):

    # =========================
    # GET RECRUITMENTS
    # =========================
    if request.method == "GET":

        club_id = request.GET.get("club_id")

        if club_id:
            club = Club.objects(id=club_id).first()

            if club is None:
                return Response(
                    {"detail": "Club not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Students can only see recruitments of approved clubs
            if request.user.role == "student" and club.status != "approved":
                return Response(
                    {"detail": "Recruitments are not available for this club."},
                    status=status.HTTP_403_FORBIDDEN
                )

            recruitments = Recruitment.objects(club_id=club_id)

        else:
            # Students only see recruitments belonging to approved clubs
            if request.user.role == "student":
                approved_clubs = Club.objects(status="approved")
                approved_club_ids = [
                    str(club.id) for club in approved_clubs
                ]

                recruitments = Recruitment.objects(
                    club_id__in=approved_club_ids
                )

            else:
                recruitments = Recruitment.objects()

        return Response(
            RecruitmentSerializer(recruitments, many=True).data,
            status=status.HTTP_200_OK
        )

    # =========================
    # CREATE RECRUITMENT
    # =========================

    if request.user.role not in ["club_admin", "central_admin"]:
        return Response(
            {
                "detail":
                "Only club admins or central admins can create recruitments."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    club_id = request.data.get("club_id")

    if not club_id:
        return Response(
            {"detail": "club_id is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    club = Club.objects(id=club_id).first()

    if club is None:
        return Response(
            {"detail": "Club not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Club Admin can only create recruitment for own club
    if request.user.role == "club_admin":
        if request.user.club_id != club_id:
            return Response(
                {
                    "detail":
                    "You can only manage recruitments for your own club."
                },
                status=status.HTTP_403_FORBIDDEN
            )

    # Recruitment can only be created for approved clubs
    if club.status != "approved":
        return Response(
            {
                "detail":
                "Recruitment can only be created for an approved club."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = RecruitmentSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    start_date = serializer.validated_data.get("start_date")
    deadline = serializer.validated_data.get("deadline")

    # Validate dates
    if start_date and deadline and start_date >= deadline:
        return Response(
            {
                "detail":
                "start_date must be earlier than deadline."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    recruitment = Recruitment(
        club_id=club_id,
        **serializer.validated_data
    )

    recruitment.save()

    return Response(
        RecruitmentSerializer(recruitment).data,
        status=status.HTTP_201_CREATED
    )


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def recruitment_detail(request, recruitment_id):

    recruitment = Recruitment.objects(id=recruitment_id).first()

    if recruitment is None:
        return Response(
            {"detail": "Recruitment not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    club = Club.objects(id=recruitment.club_id).first()

    if request.method == "GET":

        # Students cannot view recruitment from unapproved club
        if request.user.role == "student":
            if club is None or club.status != "approved":
                return Response(
                    {
                        "detail":
                        "Recruitment is not available."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        return Response(
            RecruitmentSerializer(recruitment).data,
            status=status.HTTP_200_OK
        )

    # =========================
    # UPDATE / DELETE
    # =========================

    if request.user.role not in ["club_admin", "central_admin"]:
        return Response(
            {
                "detail":
                "Only club admins or central admins can modify recruitments."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    if request.user.role == "club_admin":
        if request.user.club_id != recruitment.club_id:
            return Response(
                {
                    "detail":
                    "You can only manage recruitments for your own club."
                },
                status=status.HTTP_403_FORBIDDEN
            )

    if request.method == "PATCH":

        serializer = RecruitmentSerializer(
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate final dates after update
        new_start_date = serializer.validated_data.get(
            "start_date",
            recruitment.start_date
        )

        new_deadline = serializer.validated_data.get(
            "deadline",
            recruitment.deadline
        )

        if new_start_date >= new_deadline:
            return Response(
                {
                    "detail":
                    "start_date must be earlier than deadline."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        for field, value in serializer.validated_data.items():
            setattr(recruitment, field, value)

        recruitment.save()

        return Response(
            RecruitmentSerializer(recruitment).data,
            status=status.HTTP_200_OK
        )

    # =========================
    # DELETE
    # =========================

    recruitment.delete()

    return Response(
        {"message": "Recruitment deleted successfully."},
        status=status.HTTP_200_OK
    )