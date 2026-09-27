from datetime import datetime, timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Application
from .serializers import ApplicationSerializer

from users.models import User
from notifications.models import Notification

from clubs.models import Club
from recruitments.models import Recruitment


APPLICATION_STATUSES = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Selected",
    "Rejected",
]


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def application_list(request):

    # ============================================================
    # GET APPLICATIONS
    # ============================================================

    if request.method == "GET":

        student_id = request.GET.get("student_id")
        club_id = request.GET.get("club_id")

        if request.user.role == "student":

            if student_id and student_id != str(request.user.id):
                return Response(
                    {
                        "detail":
                        "You can only view your own applications."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            applications = Application.objects(
                student_id=str(request.user.id)
            )

        elif request.user.role == "club_admin":

            if club_id and club_id != request.user.club_id:
                return Response(
                    {
                        "detail":
                        "You can only view applications for your own club."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            applications = Application.objects(
                club_id=request.user.club_id
            )

        elif request.user.role == "central_admin":

            applications = Application.objects()

            if student_id:
                applications = applications.filter(
                    student_id=student_id
                )

            if club_id:
                applications = applications.filter(
                    club_id=club_id
                )

        else:
            return Response(
                {"detail": "Invalid user role."},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            ApplicationSerializer(applications, many=True).data,
            status=status.HTTP_200_OK
        )

    # ============================================================
    # CREATE APPLICATION
    # ============================================================

    if request.user.role != "student":
        return Response(
            {
                "detail":
                "Only students can submit applications."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    student_id = request.data.get("student_id")
    club_id = request.data.get("club_id")
    recruitment_id = request.data.get("recruitment_id")
    position = request.data.get("position")
    submitted_data = request.data.get("submitted_data", {})

    # ------------------------------------------------------------
    # Basic validation
    # ------------------------------------------------------------

    if not student_id:
        return Response(
            {"detail": "student_id is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if student_id != str(request.user.id):
        return Response(
            {
                "detail":
                "You can only submit applications for yourself."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    if not club_id:
        return Response(
            {"detail": "club_id is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not recruitment_id:
        return Response(
            {"detail": "recruitment_id is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not position:
        return Response(
            {"detail": "position is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not isinstance(submitted_data, dict):
        return Response(
            {
                "detail":
                "submitted_data must be a JSON object."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ------------------------------------------------------------
    # Verify club
    # ------------------------------------------------------------

    club = Club.objects(id=club_id).first()

    if club is None:
        return Response(
            {"detail": "Club not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if club.status != "approved":
        return Response(
            {
                "detail":
                "You can only apply to an approved club."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ------------------------------------------------------------
    # Verify recruitment
    # ------------------------------------------------------------

    recruitment = Recruitment.objects(id=recruitment_id).first()

    if recruitment is None:
        return Response(
            {"detail": "Recruitment not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Recruitment must belong to the selected club
    if recruitment.club_id != club_id:
        return Response(
            {
                "detail":
                "Recruitment does not belong to the selected club."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Recruitment must be open
    if recruitment.status != "open":
        return Response(
            {
                "detail":
                "This recruitment is currently closed."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ------------------------------------------------------------
    # Check deadline
    # ------------------------------------------------------------

    now = datetime.now(timezone.utc)

    deadline = recruitment.deadline

    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)

    if now > deadline:
        return Response(
            {
                "detail":
                "The application deadline has passed."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ------------------------------------------------------------
    # Prevent duplicate application
    # ------------------------------------------------------------

    existing_application = Application.objects(
        student_id=str(request.user.id),
        recruitment_id=str(recruitment.id)
    ).first()

    if existing_application:
        return Response(
            {
                "detail":
                "You have already applied for this recruitment."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ------------------------------------------------------------
    # Create application
    # ------------------------------------------------------------

    application = Application(
        student_id=str(request.user.id),
        club_id=club_id,
        recruitment_id=recruitment_id,
        position=position,
        submitted_data=submitted_data,
        status="Applied"
    )

    application.save()

    # ------------------------------------------------------------
    # Notify club admins
    # ------------------------------------------------------------

    club_admins = User.objects(
        role="club_admin",
        club_id=club_id,
        is_active=True
    )

    for admin in club_admins:

        Notification(
            user_id=str(admin.id),
            message=f"New application received for {position}.",
            notification_type="new_application"
        ).save()

    return Response(
        ApplicationSerializer(application).data,
        status=status.HTTP_201_CREATED
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def application_detail(request, application_id):

    application = Application.objects(
        id=application_id
    ).first()

    if application is None:
        return Response(
            {"detail": "Application not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # ============================================================
    # GET APPLICATION
    # ============================================================

    if request.method == "GET":

        if request.user.role == "student":

            if application.student_id != str(request.user.id):
                return Response(
                    {
                        "detail":
                        "You can only view your own application."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        elif request.user.role == "club_admin":

            if application.club_id != request.user.club_id:
                return Response(
                    {
                        "detail":
                        "You can only view applications for your own club."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        elif request.user.role != "central_admin":

            return Response(
                {"detail": "Invalid user role."},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            ApplicationSerializer(application).data,
            status=status.HTTP_200_OK
        )

    # ============================================================
    # UPDATE APPLICATION STATUS
    # ============================================================

    if request.user.role not in [
        "club_admin",
        "central_admin"
    ]:
        return Response(
            {
                "detail":
                "Only club admins or central admins can update applications."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # Club Admin can only manage own club applications
    if request.user.role == "club_admin":

        if application.club_id != request.user.club_id:
            return Response(
                {
                    "detail":
                    "You can only manage applications for your own club."
                },
                status=status.HTTP_403_FORBIDDEN
            )

    new_status = request.data.get("status")

    if new_status not in APPLICATION_STATUSES:
        return Response(
            {
                "detail":
                "Invalid application status."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    old_status = application.status

    application.status = new_status
    application.save()

    # ------------------------------------------------------------
    # Notify student when status changes
    # ------------------------------------------------------------

    if old_status != new_status:

        Notification(
            user_id=application.student_id,
            message=(
                f"Your application for "
                f"{application.position} is now "
                f"{new_status}."
            ),
            notification_type="application_status"
        ).save()

    return Response(
        ApplicationSerializer(application).data,
        status=status.HTTP_200_OK
    )