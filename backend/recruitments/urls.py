from django.urls import path

from . import views


urlpatterns = [
    path(
        "",
        views.recruitment_list,
        name="recruitment-list"
    ),

    path(
        "<str:recruitment_id>/",
        views.recruitment_detail,
        name="recruitment-detail"
    ),
]