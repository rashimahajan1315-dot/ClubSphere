import mongoengine as me


RECRUITMENT_STATUS_CHOICES = (
    "open",
    "closed",
)


class Recruitment(me.Document):
    club_id = me.StringField(required=True)

    position_title = me.StringField(
        required=True,
        max_length=120
    )

    description = me.StringField(
        default=""
    )

    requirements = me.ListField(
        me.StringField(),
        default=list
    )

    application_questions = me.ListField(
        me.StringField(),
        default=list
    )

    start_date = me.DateTimeField(
        required=True
    )

    deadline = me.DateTimeField(
        required=True
    )

    status = me.StringField(
        choices=RECRUITMENT_STATUS_CHOICES,
        default="open"
    )

    created_at = me.DateTimeField(
        auto_now_add=True
    )

    updated_at = me.DateTimeField(
        auto_now=True
    )

    meta = {
        "collection": "recruitments"
    }

    def __str__(self):
        return f"{self.position_title} - {self.club_id}"