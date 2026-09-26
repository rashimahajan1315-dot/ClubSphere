from django.urls import path
from . import views

urlpatterns = [
    path(
        "",
        views.application_list,
        name="application-list"
    ),

    path(
        "<str:application_id>/",
        views.application_detail,
        name="application-detail"
    ),
]