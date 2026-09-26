import mongoengine as me
from django.contrib.auth.hashers import make_password, check_password


ROLE_CHOICES = (
    "student",
    "club_admin",
    "central_admin",
)


class User(me.Document):

    name = me.StringField(
        required=True,
        max_length=120
    )

    email = me.EmailField(
        required=True,
        unique=True
    )

    password_hash = me.StringField(
        required=True
    )

    role = me.StringField(
        choices=ROLE_CHOICES,
        default="student"
    )

    club_id = me.StringField(
        null=True
    )

    is_active = me.BooleanField(
        default=True
    )

    created_at = me.DateTimeField(
        auto_now_add=True
    )

    # --------------------------------
    # Django/DRF authentication support
    # --------------------------------

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    # --------------------------------
    # Password methods
    # --------------------------------

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(
            raw_password,
            self.password_hash
        )

    def __str__(self):
        return f"{self.name} ({self.role})"

    meta = {
        "collection": "users"
    }