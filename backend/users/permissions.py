from rest_framework.permissions import BasePermission


class IsAuthenticatedMongoUser(BasePermission):

    def has_permission(self, request, view):
        return bool(
            request.user
            and getattr(request.user, "id", None)
        )


class IsStudent(BasePermission):

    def has_permission(self, request, view):
        return (
            bool(request.user)
            and getattr(request.user, "role", None) == "student"
        )


class IsClubAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            bool(request.user)
            and getattr(request.user, "role", None) == "club_admin"
        )


class IsCentralAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            bool(request.user)
            and getattr(request.user, "role", None) == "central_admin"
        )


class IsClubAdminOrCentralAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            bool(request.user)
            and getattr(request.user, "role", None)
            in ["club_admin", "central_admin"]
        )