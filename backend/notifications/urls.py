from django.urls import path

from . import views


urlpatterns = [
    path(
        "",
        views.notification_list,
        name="notification-list"
    ),

    path(
        "<str:notification_id>/read/",
        views.mark_notification_read,
        name="mark-notification-read"
    ),

    path(
        "read-all/",
        views.mark_all_read,
        name="mark-all-read"
    ),
]