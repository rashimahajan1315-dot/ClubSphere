from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),

    path(
        "admin/",
        views.admin_user_list,
        name="admin-user-list"
    ),

    
path(
    "admin/create-club-admin/",
    views.create_club_admin,
    name="create-club-admin",
),


    path(
        "admin/stats/",
        views.admin_stats,
        name="admin-stats"
    ),

    path(
        "admin/<str:user_id>/status/",
        views.update_user_status,
        name="update-user-status"
    ),

    path(
        "admin/<str:user_id>/assign-club/",
        views.assign_club_admin,
        name="assign-club-admin"
    ),
]