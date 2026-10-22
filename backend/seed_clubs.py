from datetime import datetime, timedelta, timezone

import mongoengine

from clubs.models import Club
from recruitments.models import Recruitment


# Connect to ClubSphere MongoDB
mongoengine.connect(
    db=os.environ.get("MONGODB_DATABASE", "clubsphere"),
    host=os.environ.get(
        "MONGODB_HOST",
        "mongodb://127.0.0.1:27017/clubsphere",
    ),
)


# ---------------------------------------------------------
# CLUB DATA
# ---------------------------------------------------------

clubs_data = [
    {
        "name": "Robotics Club",
        "category": "TECHNOLOGY",
        "description": "Explore robotics, automation and innovative hardware projects.",
        "activities": [
            "Robotics Workshops",
            "Arduino Projects",
            "Automation Events"
        ],
    },
    {
        "name": "Dance Club",
        "category": "CULTURAL",
        "description": "A creative space for students interested in dance and performance.",
        "activities": [
            "Dance Workshops",
            "College Performances",
            "Dance Competitions"
        ],
    },
    {
        "name": "Music Club",
        "category": "CULTURAL",
        "description": "Connect with students who love singing, instruments and music.",
        "activities": [
            "Jam Sessions",
            "Music Performances",
            "Open Mic Events"
        ],
    },
    {
        "name": "Cricket Club",
        "category": "SPORTS",
        "description": "Build your cricket skills and participate in campus tournaments.",
        "activities": [
            "Cricket Practice",
            "Campus Matches",
            "Sports Tournaments"
        ],
    },
    {
        "name": "Football Club",
        "category": "SPORTS",
        "description": "A community for football enthusiasts and competitive players.",
        "activities": [
            "Football Practice",
            "Campus Matches",
            "Football Tournaments"
        ],
    },
    {
        "name": "Literary Club",
        "category": "LITERARY",
        "description": "A community for readers, writers and lovers of literature.",
        "activities": [
            "Writing Workshops",
            "Book Discussions",
            "Creative Writing"
        ],
    },
    {
        "name": "Debate Club",
        "category": "LITERARY",
        "description": "Develop public speaking, critical thinking and debating skills.",
        "activities": [
            "Debate Sessions",
            "Public Speaking",
            "Debate Competitions"
        ],
    },
    {
        "name": "Social Service Club",
        "category": "SOCIAL",
        "description": "Work together on meaningful social and community initiatives.",
        "activities": [
            "Community Drives",
            "Social Campaigns",
            "Volunteer Activities"
        ],
    },
    {
        "name": "Environment Club",
        "category": "SOCIAL",
        "description": "Promote environmental awareness and sustainable campus initiatives.",
        "activities": [
            "Tree Plantation",
            "Clean Campus Drives",
            "Sustainability Campaigns"
        ],
    },
    {
        "name": "Photography Club",
        "category": "GENERAL",
        "description": "Capture campus life and develop creative photography skills.",
        "activities": [
            "Photography Walks",
            "Photo Exhibitions",
            "Editing Workshops"
        ],
    },
    {
        "name": "Entrepreneurship Club",
        "category": "GENERAL",
        "description": "Learn about startups, business ideas and entrepreneurship.",
        "activities": [
            "Startup Workshops",
            "Pitch Sessions",
            "Business Competitions"
        ],
    },
]


# ---------------------------------------------------------
# RECRUITMENT DATA
# ---------------------------------------------------------

recruitment_data = {
    "Robotics Club": {
        "position_title": "Robotics Team Member",
        "description": "Work on robotics and automation projects.",
        "requirements": [
            "Basic electronics knowledge",
            "Arduino knowledge",
            "Problem solving skills"
        ],
        "application_questions": [
            "Why do you want to join the Robotics Club?",
            "What robotics technologies do you know?"
        ],
    },

    "Dance Club": {
        "position_title": "Dance Team Member",
        "description": "Participate in performances and dance activities.",
        "requirements": [
            "Basic dance experience",
            "Teamwork",
            "Interest in performing"
        ],
        "application_questions": [
            "Why do you want to join the Dance Club?",
            "Which dance style do you enjoy?"
        ],
    },

    "Music Club": {
        "position_title": "Music Team Member",
        "description": "Participate in musical performances and events.",
        "requirements": [
            "Interest in music",
            "Basic musical skills",
            "Teamwork"
        ],
        "application_questions": [
            "Why do you want to join the Music Club?",
            "Which instrument or musical skill do you have?"
        ],
    },

    "Cricket Club": {
        "position_title": "Cricket Team Member",
        "description": "Represent the club in cricket practices and tournaments.",
        "requirements": [
            "Basic cricket skills",
            "Fitness",
            "Teamwork"
        ],
        "application_questions": [
            "Why do you want to join the Cricket Club?",
            "What position do you usually play?"
        ],
    },

    "Football Club": {
        "position_title": "Football Team Member",
        "description": "Participate in football training and campus tournaments.",
        "requirements": [
            "Basic football skills",
            "Fitness",
            "Teamwork"
        ],
        "application_questions": [
            "Why do you want to join the Football Club?",
            "What position do you play?"
        ],
    },

    "Literary Club": {
        "position_title": "Content Writer",
        "description": "Create articles, stories and creative content for the club.",
        "requirements": [
            "Good writing skills",
            "Creativity",
            "Interest in literature"
        ],
        "application_questions": [
            "Why do you want to join the Literary Club?",
            "What type of writing do you enjoy?"
        ],
    },

    "Debate Club": {
        "position_title": "Debate Team Member",
        "description": "Participate in debates and public speaking activities.",
        "requirements": [
            "Public speaking",
            "Critical thinking",
            "Confidence"
        ],
        "application_questions": [
            "Why do you want to join the Debate Club?",
            "What makes a good debater?"
        ],
    },

    "Social Service Club": {
        "position_title": "Volunteer",
        "description": "Participate in community service and social initiatives.",
        "requirements": [
            "Teamwork",
            "Communication skills",
            "Willingness to volunteer"
        ],
        "application_questions": [
            "Why do you want to join the Social Service Club?",
            "What social cause interests you?"
        ],
    },

    "Environment Club": {
        "position_title": "Environment Volunteer",
        "description": "Work on sustainability and environmental awareness activities.",
        "requirements": [
            "Interest in sustainability",
            "Teamwork",
            "Community participation"
        ],
        "application_questions": [
            "Why do you want to join the Environment Club?",
            "How can students help the environment?"
        ],
    },

    "Photography Club": {
        "position_title": "Photography Team Member",
        "description": "Capture campus events and create visual content.",
        "requirements": [
            "Basic photography",
            "Creativity",
            "Photo editing interest"
        ],
        "application_questions": [
            "Why do you want to join the Photography Club?",
            "What type of photography do you enjoy?"
        ],
    },

    "Entrepreneurship Club": {
        "position_title": "Startup Team Member",
        "description": "Work on startup ideas, business projects and pitch events.",
        "requirements": [
            "Entrepreneurial interest",
            "Communication skills",
            "Problem solving"
        ],
        "application_questions": [
            "Why do you want to join the Entrepreneurship Club?",
            "Describe one business idea you would like to explore."
        ],
    },
}


# ---------------------------------------------------------
# CREATE CLUBS + RECRUITMENTS
# ---------------------------------------------------------

now = datetime.now(timezone.utc)
start_date = now
deadline = now + timedelta(days=30)

created_clubs = 0
created_recruitments = 0


for data in clubs_data:

    # Check if club already exists
    club = Club.objects(name=data["name"]).first()

    if club:
        print(f"Club already exists: {club.name}")
    else:
        club = Club(
            name=data["name"],
            description=data["description"],
            category=data["category"],
            logo="",
            activities=data["activities"],
            faculty_coordinator="",
            admin_ids=[],
            status="approved",
        )

        club.save()

        created_clubs += 1

        print(f"Created club: {club.name}")

    # Create recruitment
    recruitment_info = recruitment_data.get(club.name)

    if recruitment_info:

        existing_recruitment = Recruitment.objects(
            club_id=str(club.id),
            position_title=recruitment_info["position_title"]
        ).first()

        if existing_recruitment:
            print(
                f"Recruitment already exists: "
                f"{recruitment_info['position_title']}"
            )
        else:
            recruitment = Recruitment(
                club_id=str(club.id),
                position_title=recruitment_info["position_title"],
                description=recruitment_info["description"],
                requirements=recruitment_info["requirements"],
                application_questions=recruitment_info[
                    "application_questions"
                ],
                start_date=start_date,
                deadline=deadline,
                status="open",
            )

            recruitment.save()

            created_recruitments += 1

            print(
                f"Created recruitment: "
                f"{recruitment_info['position_title']}"
            )


print()
print("========================================")
print("ClubSphere seed completed successfully!")
print("========================================")
print(f"New clubs created: {created_clubs}")
print(f"New recruitments created: {created_recruitments}")
print()