from django.urls import path
from . import views


urlpatterns = [

    # Student / authenticated users
    path(
        "",
        views.club_list,
        name="club-list"
    ),

    # Central Admin - create club
    path(
        "admin/create/",
        views.create_club,
        name="create-club"
    ),

    # Central Admin - all clubs
    path(
        "admin/",
        views.admin_club_list,
        name="admin-club-list"
    ),

    # Central Admin - approve club
    path(
        "admin/<str:club_id>/approve/",
        views.approve_club,
        name="approve-club"
    ),

    # Central Admin - reject club
    path(
        "admin/<str:club_id>/reject/",
        views.reject_club,
        name="reject-club"
    ),

    # Central Admin - delete club
    path(
        "admin/<str:club_id>/delete/",
        views.delete_club,
        name="delete-club"
    ),

    # Individual club
    path(
        "<str:club_id>/",
        views.club_detail,
        name="club-detail"
    ),
]