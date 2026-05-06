from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied


class IsAdminUser(BasePermission):
    """Check if user is admin"""
    message = "Only administrators can perform this action"

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role.name == 'admin'
        )

class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and request.user.role.name=='employee')
class IsHRManager(BasePermission):
    """Check if user is HR Manager"""
    message = "Only HR managers can perform this action"

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role.name == 'hr'
        )


class IsManager(BasePermission):
    """Check if user is a manager"""
    message = "Only managers can perform this action"

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role.name == 'manager'
        )


class IsFinanceOfficer(BasePermission):
    """Check if user is Finance Officer"""
    message = "Only finance officers can perform this action"

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role.name == 'finance'
        )


class IsEmployeeOwnerOrManager(BasePermission):
    """Check if user is the employee or their manager"""
    message = "You don't have permission to access this employee's information"

    def has_object_permission(self, request, view, obj):
        # Admin can access everyone
        if request.user.role.name == 'admin':
            return True

        # User can access their own data
        if request.user == obj:
            return True

        # Manager can access their subordinates
        if request.user.role.name == 'manager' and request.user in obj.reports_to:
            return True

        return False


class IsOwnUserOrAdmin(BasePermission):
    """User can only edit their own profile unless admin"""
    message = "You can only modify your own profile"

    def has_object_permission(self, request, view, obj):
        return request.user == obj or request.user.role.name == 'admin'


class HasResourcePermission(BasePermission):
    """Check if user has specific resource permission"""
    message = "You don't have permission to perform this action"

    def __init__(self, resource, action):
        self.resource = resource
        self.action = action

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin has all permissions
        if request.user.role.name == 'admin':
            return True

        # Check if user has specific permission
        return request.user.has_permission(self.resource, self.action)


class IsAdminOrReadOnly(BasePermission):
    """Admin or read-only for others"""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated

        if request.user and request.user.is_authenticated:
            return request.user.role.name == 'admin'

        return False


class CanManageLeaves(BasePermission):
    """Check permission to manage leaves"""
    message = "You don't have permission to manage leaves"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin and HR can manage leaves
        return request.user.role.name in ['admin', 'hr']

    def has_object_permission(self, request, view, obj):
        # Can manage own leave
        if obj.employee == request.user:
            return True

        # Admin and HR can manage all leaves
        if request.user.role.name in ['admin', 'hr']:
            return True

        # Manager can approve leaves of their team
        if request.user.role.name == 'manager':
            return obj.employee.reports_to == request.user

        return False


class CanManageBonuses(BasePermission):
    """Check permission to manage bonuses"""
    message = "You don't have permission to manage bonuses"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin, HR, and Finance can manage bonuses
        return request.user.role.name in ['admin', 'hr', 'finance']

    def has_object_permission(self, request, view, obj):
        if request.user.role.name in ['admin', 'hr', 'finance']:
            return True

        return False


class CanManagePerformanceReviews(BasePermission):
    """Check permission to manage performance reviews"""
    message = "You don't have permission to manage performance reviews"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin, HR, and Manager can create reviews
        return request.user.role.name in ['admin', 'hr', 'manager']

    def has_object_permission(self, request, view, obj):
        # Admin can do everything
        if request.user.role.name == 'admin':
            return True

        # HR can do everything
        if request.user.role.name == 'hr':
            return True

        # Manager can review their team
        if request.user.role.name == 'manager':
            return obj.employee.reports_to == request.user

        return False


class CanAccessChat(BasePermission):
    """Check if user can access conversation"""
    message = "You don't have permission to access this conversation"

    def has_object_permission(self, request, view, obj):
        # User must be a participant
        return request.user in obj.participants.all()


class CanManageProjects(BasePermission):
    """Check permission to manage projects"""
    message = "You don't have permission to manage projects"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        # Only admin and managers can create/edit projects
        return request.user.role.name in ['admin', 'manager']

    def has_object_permission(self, request, view, obj):
        # Admin can do everything
        if request.user.role.name == 'admin':
            return True

        # Project manager can manage their project
        if obj.project_manager == request.user:
            return True

        # Team members can view
        if request.user in obj.team_members.all() and request.method in SAFE_METHODS:
            return True

        return False


class CanManageTasks(BasePermission):
    """Check permission to manage tasks"""
    message = "You don't have permission to manage this task"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        # Admin, managers can create/edit tasks
        return request.user.role.name in ['admin', 'manager']

    def has_object_permission(self, request, view, obj):
        # Admin can do everything
        if request.user.role.name == 'admin':
            return True

        # Project manager can manage
        if obj.project.project_manager == request.user:
            return True

        # Assigned person can view and update
        if obj.assigned_to == request.user:
            return True

        return False


class CanViewAttendance(BasePermission):
    """Check permission to view attendance"""
    message = "You don't have permission to view this attendance"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        # Can view own attendance
        if obj.employee == request.user:
            return True

        # Admin can view all
        if request.user.role.name == 'admin':
            return True

        # HR can view all
        if request.user.role.name == 'hr':
            return True

        # Manager can view their team
        if request.user.role.name == 'manager':
            return obj.employee.reports_to == request.user

        return False


class CanManageAttendance(BasePermission):
    """Check permission to manage attendance"""
    message = "You don't have permission to manage attendance"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin and HR can manage
        return request.user.role.name in ['admin', 'hr']


class CanManageSalary(BasePermission):
    """Check permission to manage salary"""
    message = "You don't have permission to manage salary"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return request.user.role.name in ['admin', 'hr', 'finance']

        # Only admin and finance can modify
        return request.user.role.name in ['admin', 'finance']

    def has_object_permission(self, request, view, obj):
        return request.user.role.name in ['admin', 'finance']


class CanManageDepartments(BasePermission):
    """Check permission to manage departments"""
    message = "You don't have permission to manage departments"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        # Only admin can manage
        return request.user.role.name == 'admin'


class IsComplianceTeam(BasePermission):
    """Check if user is in compliance/audit team"""
    message = "You don't have permission to access audit logs"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin and HR can access audit logs
        return request.user.role.name in ['admin', 'hr']