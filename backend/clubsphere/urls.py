from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/users/",
        include("users.urls")
    ),

    path(
        "api/clubs/",
        include("clubs.urls")
    ),

    path(
        "api/recruitments/",
        include("recruitments.urls")
    ),

    path(
        "api/applications/",
        include("applications.urls")
    ),

    path(
        "api/notifications/",
        include("notifications.urls")
    ),
]