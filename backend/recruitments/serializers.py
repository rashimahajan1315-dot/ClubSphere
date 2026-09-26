from rest_framework import serializers

from .models import RECRUITMENT_STATUS_CHOICES


class RecruitmentSerializer(serializers.Serializer):

    id = serializers.CharField(read_only=True)

    club_id = serializers.CharField(
        read_only=True
    )

    position_title = serializers.CharField(
        max_length=120
    )

    description = serializers.CharField(
        required=False,
        allow_blank=True
    )

    requirements = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    application_questions = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    start_date = serializers.DateTimeField()

    deadline = serializers.DateTimeField()

    status = serializers.ChoiceField(
        choices=RECRUITMENT_STATUS_CHOICES,
        required=False
    )

    created_at = serializers.DateTimeField(
        read_only=True
    )

    updated_at = serializers.DateTimeField(
        read_only=True
    )