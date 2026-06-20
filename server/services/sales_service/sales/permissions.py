from rest_framework.permissions import BasePermission

class isAuthenticatedService(BasePermission):
    def has_permission(self, request, view):
        return request.user is not None