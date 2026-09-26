import mongoengine as me


class Notification(me.Document):
    user_id = me.StringField(
        required=True
    )

    message = me.StringField(
        required=True
    )

    notification_type = me.StringField(
        default="general"
    )

    is_read = me.BooleanField(
        default=False
    )

    created_at = me.DateTimeField(
        auto_now_add=True
    )

    meta = {
        "collection": "notifications"
    }

    def __str__(self):
        return self.message