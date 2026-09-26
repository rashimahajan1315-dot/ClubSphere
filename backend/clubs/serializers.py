from rest_framework import serializers

from .models import CLUB_STATUS_CHOICES


class ClubSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)

    name = serializers.CharField(max_length=120)

    description = serializers.CharField(
        required=False,
        allow_blank=True
    )

    category = serializers.CharField(max_length=80)

    logo = serializers.CharField(
        required=False,
        allow_blank=True
    )

    activities = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    faculty_coordinator = serializers.CharField(
        required=False,
        allow_blank=True
    )

    admin_ids = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    status = serializers.ChoiceField(
        choices=CLUB_STATUS_CHOICES,
        required=False
    )

    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)