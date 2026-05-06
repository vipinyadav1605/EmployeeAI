from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import APIException
import logging

logger = logging.getLogger('audit')


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF
    Standardizes error response format
    """
    response = None
    
    # Handle APIException
    if isinstance(exc, APIException):
        headers = {}
        if getattr(exc, 'auth_header', None):
            headers['WWW-Authenticate'] = exc.auth_header
        if getattr(exc, 'wait', None):
            headers['Retry-After'] = '%d' % exc.wait

        if isinstance(exc.detail, (list, dict)):
            data = exc.detail
        else:
            data = {'detail': exc.detail}

        response = Response(data, status=exc.status_code, headers=headers)

    # Log the exception
    logger.error(
        f"API Exception: {exc.__class__.__name__}",
        extra={
            'exc': exc,
            'context': context,
        }
    )

    return response


class InvalidPermissionException(APIException):
    """Custom exception for permission errors"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You don't have permission to perform this action"
    default_code = 'permission_denied'


class ResourceNotFoundException(APIException):
    """Custom exception when resource is not found"""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "The requested resource was not found"
    default_code = 'not_found'


class ValidationException(APIException):
    """Custom exception for validation errors"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Validation error"
    default_code = 'invalid'


# ============== PERMISSION HELPERS ==============

def check_user_permission(user, resource, action):
    """
    Check if user has permission for resource and action
    
    Args:
        user: Employee instance
        resource: Resource name (e.g., 'employee', 'bonus')
        action: Action name (e.g., 'view', 'create', 'edit')
    
    Returns:
        bool: True if user has permission
    """
    if user.role.name == 'admin':
        return True
    
    return user.has_permission(resource, action)


def get_user_accessible_employees(user):
    """
    Get list of employees accessible by user based on role
    
    Args:
        user: Employee instance
    
    Returns:
        QuerySet: Filtered employee queryset
    """
    from .models import Employee
    
    if user.role.name == 'admin':
        return Employee.objects.all()
    elif user.role.name == 'manager':
        return Employee.objects.filter(reports_to=user) | Employee.objects.filter(id=user.id)
    elif user.role.name == 'hr':
        return Employee.objects.all()
    else:
        return Employee.objects.filter(id=user.id)


def get_user_accessible_departments(user):
    """
    Get list of departments accessible by user
    
    Args:
        user: Employee instance
    
    Returns:
        QuerySet: Filtered department queryset
    """
    from .models import Department
    
    if user.role.name == 'admin' or user.role.name == 'hr':
        return Department.objects.all()
    elif user.role.name == 'manager' and user.department:
        return Department.objects.filter(id=user.department.id)
    else:
        return Department.objects.filter(id=user.department.id)


# ============== SALARY & BONUS HELPERS ==============

def calculate_total_compensation(employee):
    """
    Calculate total compensation for an employee
    
    Args:
        employee: Employee instance
    
    Returns:
        dict: Breakdown of compensation
    """
    from .models import Salary, Bonus
    from datetime import datetime
    from django.db.models import Sum
    
    current_salary = employee.salary_history.first()
    
    current_year = datetime.now().year
    bonuses = Bonus.objects.filter(
        employee=employee,
        bonus_date__year=current_year,
        is_approved=True
    ).aggregate(total=Sum('amount'))
    
    base = current_salary.base_salary if current_salary else 0
    allowances = current_salary.allowances if current_salary else 0
    deductions = current_salary.deductions if current_salary else 0
    total_bonus = bonuses['total'] or 0
    
    return {
        'base_salary': float(base),
        'allowances': float(allowances),
        'deductions': float(deductions),
        'annual_bonuses': float(total_bonus),
        'monthly_salary': float((base + allowances - deductions) / 12),
        'total_annual': float(base + allowances - deductions + total_bonus),
    }


def calculate_leave_balance(employee, leave_type=None):
    """
    Calculate remaining leave balance for an employee
    
    Args:
        employee: Employee instance
        leave_type: Optional LeaveType instance
    
    Returns:
        dict or int: Leave balance information
    """
    from .models import Leave, LeaveType
    from datetime import datetime
    from django.db.models import Sum
    
    current_year = datetime.now().year
    
    if leave_type:
        # Calculate for specific leave type
        approved_leaves = Leave.objects.filter(
            employee=employee,
            leave_type=leave_type,
            start_date__year=current_year,
            status='approved'
        ).aggregate(days=Sum('total_days'))
        
        taken = approved_leaves['days'] or 0
        available = leave_type.days_per_year - taken
        
        return {
            'leave_type': leave_type.name,
            'total_days': leave_type.days_per_year,
            'taken_days': taken,
            'remaining_days': max(0, available),
        }
    else:
        # Calculate for all leave types
        leave_types = LeaveType.objects.filter(is_active=True)
        balance = {}
        
        for lt in leave_types:
            approved_leaves = Leave.objects.filter(
                employee=employee,
                leave_type=lt,
                start_date__year=current_year,
                status='approved'
            ).aggregate(days=Sum('total_days'))
            
            taken = approved_leaves['days'] or 0
            available = lt.days_per_year - taken
            
            balance[lt.code] = {
                'total_days': lt.days_per_year,
                'taken_days': taken,
                'remaining_days': max(0, available),
            }
        
        return balance


# ============== ATTENDANCE HELPERS ==============

def get_attendance_summary(employee, month=None, year=None):
    """
    Get attendance summary for an employee
    
    Args:
        employee: Employee instance
        month: Optional month number
        year: Optional year number
    
    Returns:
        dict: Attendance summary
    """
    from .models import Attendance
    from datetime import datetime
    from django.db.models import Count, Q
    
    if not month or not year:
        today = datetime.now()
        month = today.month
        year = today.year
    
    attendance = Attendance.objects.filter(
        employee=employee,
        date__month=month,
        date__year=year
    )
    
    summary = attendance.values('status').annotate(count=Count('id'))
    status_count = {item['status']: item['count'] for item in summary}
    
    total_days = attendance.count()
    present_days = status_count.get('present', 0) + status_count.get('wfh', 0)
    absent_days = status_count.get('absent', 0)
    late_days = status_count.get('late', 0)
    
    return {
        'month': month,
        'year': year,
        'total_working_days': total_days,
        'present': present_days,
        'absent': absent_days,
        'late': late_days,
        'work_from_home': status_count.get('wfh', 0),
        'half_day': status_count.get('half_day', 0),
        'attendance_percentage': round((present_days / max(1, total_days)) * 100, 2),
    }


# ============== PERFORMANCE HELPERS ==============

def get_performance_metrics(employee):
    """
    Get performance metrics for an employee
    
    Args:
        employee: Employee instance
    
    Returns:
        dict: Performance metrics
    """
    from .models import PerformanceReview
    from django.db.models import Avg
    
    reviews = PerformanceReview.objects.filter(employee=employee)
    
    if not reviews.exists():
        return None
    
    metrics = reviews.aggregate(
        avg_performance=Avg('performance_rating'),
        avg_technical=Avg('technical_skills'),
        avg_communication=Avg('communication'),
        avg_teamwork=Avg('teamwork'),
        avg_leadership=Avg('leadership'),
    )
    
    return {
        'total_reviews': reviews.count(),
        'average_performance': round(metrics['avg_performance'], 2),
        'average_technical_skills': round(metrics['avg_technical'], 2),
        'average_communication': round(metrics['avg_communication'], 2),
        'average_teamwork': round(metrics['avg_teamwork'], 2),
        'average_leadership': round(metrics['avg_leadership'], 2),
        'latest_review': {
            'period': f"{reviews.first().review_period_start} to {reviews.first().review_period_end}" if reviews.first() else None,
            'status': reviews.first().status if reviews.first() else None,
        }
    }


# ============== EMAIL HELPERS ==============

def send_notification_email(recipient_email, subject, message):
    """
    Send email notification
    
    Args:
        recipient_email: Email address
        subject: Email subject
        message: Email message
    
    Returns:
        bool: Success status
    """
    from django.core.mail import send_mail
    from django.conf import settings
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient_email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False


# ============== DEPARTMENT HELPERS ==============

def get_department_hierarchy():
    """
    Get hierarchical structure of all departments
    
    Returns:
        list: Department hierarchy
    """
    from .models import Department
    
    root_departments = Department.objects.filter(parent_department__isnull=True)
    
    def build_hierarchy(department):
        sub_depts = Department.objects.filter(parent_department=department)
        return {
            'id': str(department.id),
            'name': department.name,
            'code': department.code,
            'manager': department.manager.name if department.manager else None,
            'budget': float(department.budget),
            'children': [build_hierarchy(sub) for sub in sub_depts]
        }
    
    return [build_hierarchy(dept) for dept in root_departments]


# ============== PAGINATION HELPERS ==============

def paginate_queryset(queryset, page, page_size=10):
    """
    Paginate a queryset
    
    Args:
        queryset: Django queryset
        page: Page number (1-indexed)
        page_size: Items per page
    
    Returns:
        dict: Paginated data
    """
    total_count = queryset.count()
    total_pages = (total_count + page_size - 1) // page_size
    
    start = (page - 1) * page_size
    end = start + page_size
    
    items = queryset[start:end]
    
    return {
        'count': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': total_pages,
        'items': items,
    }