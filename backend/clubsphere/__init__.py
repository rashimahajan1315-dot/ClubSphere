import os
import mongoengine

mongoengine.connect(
    db=os.environ.get("MONGODB_DATABASE", "clubsphere"),
    host=os.environ.get(
        "MONGODB_HOST",
        "mongodb://127.0.0.1:27017/clubsphere",
    ),
)