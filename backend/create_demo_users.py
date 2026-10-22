import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "clubsphere.settings")

import django
django.setup()

from mongoengine import connect
from clubsphere import settings
from users.models import User
connect(
    db=settings.MONGODB_SETTINGS["db"],
    host=settings.MONGODB_SETTINGS["host"]
)

accounts = [
    ("Test Student", "teststudent@clubsphere.com", "Test@12345", "student"),
    ("Coding Admin", "codingadmin@clubsphere.com", "Admin@12345", "club_admin"),
    ("Central Admin", "centraladmin@clubsphere.com", "Central@12345", "central_admin"),
]

for name, email, password, role in accounts:
    user = User.objects(email=email).first()

    if user is None:
        user = User(name=name, email=email, role=role, is_active=True)

    user.name = name
    user.role = role
    user.is_active = True
    user.set_password(password)
    user.save()

    print("Ready:", email, role)

print("All demo accounts are ready.")
