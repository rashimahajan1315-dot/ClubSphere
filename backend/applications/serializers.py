from rest_framework import serializers

from .models import APPLICATION_STATUS_CHOICES


class ApplicationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)

    student_id = serializers.CharField(read_only=True)
    club_id = serializers.CharField(read_only=True)
    recruitment_id = serializers.CharField(read_only=True)

    position = serializers.CharField(max_length=120)

    submitted_data = serializers.DictField(
        required=False
    )

    status = serializers.ChoiceField(
        choices=APPLICATION_STATUS_CHOICES,
        read_only=True
    )

    applied_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)