import mongoengine as me


APPLICATION_STATUS_CHOICES = (
    "Applied",
    "Under Review",
    "Shortlisted",
    "Selected",
    "Rejected",
)


class Application(me.Document):

    student_id = me.StringField(
        required=True
    )

    club_id = me.StringField(
        required=True
    )

    recruitment_id = me.StringField(
        required=True
    )

    position = me.StringField(
        required=True,
        max_length=120
    )

    submitted_data = me.DictField(
        default=dict
    )

    status = me.StringField(
        choices=APPLICATION_STATUS_CHOICES,
        default="Applied"
    )

    applied_at = me.DateTimeField(
        auto_now_add=True
    )

    updated_at = me.DateTimeField(
        auto_now=True
    )

    meta = {
        "collection": "applications"
    }

    def __str__(self):
        return (
            f"{self.student_id} - "
            f"{self.position} - "
            f"{self.status}"
        )