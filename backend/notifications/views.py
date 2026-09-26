from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_list(request):

    # Always use the logged-in user's ID
    user_id = str(request.user.id)

    notifications = Notification.objects(
        user_id=user_id
    ).order_by("-created_at")

    return Response(
        NotificationSerializer(
            notifications,
            many=True
        ).data
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):

    notification = Notification.objects(
        id=notification_id
    ).first()

    if notification is None:
        return Response(
            {"detail": "Notification not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # User can only modify their own notification
    if notification.user_id != str(request.user.id):
        return Response(
            {"detail": "You can only modify your own notifications."},
            status=status.HTTP_403_FORBIDDEN
        )

    notification.is_read = True
    notification.save()

    return Response(
        NotificationSerializer(notification).data
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_all_read(request):

    # Only mark notifications belonging to logged-in user
    Notification.objects(
        user_id=str(request.user.id),
        is_read=False
    ).update(
        set__is_read=True
    )

    return Response(
        {
            "message": "All notifications marked as read."
        }
    )