from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Recruitment
from .serializers import RecruitmentSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def recruitment_list(request):

    # GET RECRUITMENTS
    if request.method == "GET":

        club_id = request.GET.get("club_id")

        if club_id:
            recruitments = Recruitment.objects(
                club_id=club_id
            )
        else:
            recruitments = Recruitment.objects()

        return Response(
            RecruitmentSerializer(
                recruitments,
                many=True
            ).data
        )

    # CREATE RECRUITMENT
    if request.method == "POST":

        # Only Club Admin or Central Admin can create
        if request.user.role not in ["club_admin", "central_admin"]:
            return Response(
                {"detail": "Only club admins or central admins can create recruitments."},
                status=status.HTTP_403_FORBIDDEN
            )

        club_id = request.data.get("club_id")

        if not club_id:
            return Response(
                {"detail": "club_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Club Admin can only create for their own club
        if request.user.role == "club_admin":
            if request.user.club_id != club_id:
                return Response(
                    {"detail": "You can only manage recruitments for your own club."},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = RecruitmentSerializer(
            data=request.data
        )

        if serializer.is_valid():

            recruitment = Recruitment(
                club_id=club_id,
                **serializer.validated_data
            )

            recruitment.save()

            return Response(
                RecruitmentSerializer(recruitment).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def recruitment_detail(request, recruitment_id):

    recruitment = Recruitment.objects(
        id=recruitment_id
    ).first()

    if recruitment is None:
        return Response(
            {"detail": "Recruitment not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # GET SINGLE RECRUITMENT
    if request.method == "GET":

        return Response(
            RecruitmentSerializer(recruitment).data
        )

    # PATCH / DELETE require admin access
    if request.user.role not in ["club_admin", "central_admin"]:
        return Response(
            {"detail": "You do not have permission to modify recruitments."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Club Admin can only modify their own club's recruitment
    if request.user.role == "club_admin":
        if request.user.club_id != recruitment.club_id:
            return Response(
                {"detail": "You can only manage recruitments for your own club."},
                status=status.HTTP_403_FORBIDDEN
            )

    # UPDATE RECRUITMENT
    if request.method == "PATCH":

        serializer = RecruitmentSerializer(
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            for field, value in serializer.validated_data.items():
                setattr(recruitment, field, value)

            recruitment.save()

            return Response(
                RecruitmentSerializer(recruitment).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # DELETE RECRUITMENT
    recruitment.delete()

    return Response(
        {"message": "Recruitment deleted successfully."},
        status=status.HTTP_200_OK
    )