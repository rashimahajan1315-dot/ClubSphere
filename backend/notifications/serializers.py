from rest_framework import serializers


class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField(
        read_only=True
    )

    user_id = serializers.CharField(
        read_only=True
    )

    message = serializers.CharField()

    notification_type = serializers.CharField(
        required=False
    )

    is_read = serializers.BooleanField(
        read_only=True
    )

    created_at = serializers.DateTimeField(
        read_only=True
    )