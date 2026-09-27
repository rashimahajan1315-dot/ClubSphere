from rest_framework import serializers

from .models import APPLICATION_STATUS_CHOICES


class ApplicationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)

    student_id = serializers.CharField(read_only=True)

    club_id = serializers.CharField(read_only=True)
    club_name = serializers.CharField(read_only=True)

    recruitment_id = serializers.CharField(read_only=True)
    recruitment_title = serializers.CharField(read_only=True)

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

    def to_representation(self, instance):
        data = super().to_representation(instance)

        from clubs.models import Club
        from recruitments.models import Recruitment

        # Get club name
        club = Club.objects(id=instance.club_id).first()

        data["club_name"] = (
            club.name
            if club
            else "Unknown Club"
        )

        # Get recruitment title
        recruitment = Recruitment.objects(
            id=instance.recruitment_id
        ).first()

        data["recruitment_title"] = (
            recruitment.position_title
            if recruitment
            else instance.position
        )

        # ---------------------------------------------------------
        # Fallback for old application records
        # ---------------------------------------------------------
        # Some existing test records have applied_at = null.
        # MongoDB ObjectId contains the document creation timestamp,
        # so use it only when applied_at is missing.
        if instance.applied_at is None:
            object_id = getattr(instance, "id", None)
            generation_time = getattr(
                object_id,
                "generation_time",
                None
            )

            if generation_time:
                data["applied_at"] = generation_time

        return data