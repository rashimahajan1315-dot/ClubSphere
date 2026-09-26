import mongoengine as me


CLUB_STATUS_CHOICES = (
    "pending",
    "approved",
    "rejected",
)


class Club(me.Document):
    name = me.StringField(
        required=True,
        max_length=120,
        unique=True
    )

    description = me.StringField(
        required=True
    )

    category = me.StringField(
        required=True,
        max_length=80
    )

    logo = me.StringField(
        default=""
    )

    activities = me.ListField(
        me.StringField(),
        default=list
    )

    faculty_coordinator = me.StringField(
        default=""
    )

    admin_ids = me.ListField(
        me.StringField(),
        default=list
    )

    status = me.StringField(
        choices=CLUB_STATUS_CHOICES,
        default="pending"
    )

    created_at = me.DateTimeField(
        auto_now_add=True
    )

    updated_at = me.DateTimeField(
        auto_now=True
    )

    meta = {
        "collection": "clubs"
    }

    def __str__(self):
        return self.name