from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
import json

from .models import (
    Employee, Leave, Bonus, PerformanceReview, Task,
    Notification, EmployeeAuditLog
)


# ============== EMPLOYEE SIGNALS ==============

@receiver(pre_save, sender=Employee)
def track_employee_changes(sender, instance, **kwargs):
    """Track changes before saving"""
    if instance.pk:
        try:
            old_instance = Employee.objects.get(pk=instance.pk)
            instance._old_values = {
                'name': old_instance.name,
                'email': old_instance.email,
                'department': str(old_instance.department_id) if old_instance.department else None,
                'position': str(old_instance.position_id) if old_instance.position else None,
                'base_salary': str(old_instance.base_salary),
                'role': str(old_instance.role_id),
            }
        except Employee.DoesNotExist:
            instance._old_values = {}


@receiver(post_save, sender=Employee)
def log_employee_changes(sender, instance, created, **kwargs):
    """Log employee changes to audit trail"""
    if created:
        action = 'CREATED'
        changes = {
            'name': instance.name,
            'email': instance.email,
            'empId': instance.empId,
        }
    else:
        old_values = getattr(instance, '_old_values', {})
        new_values = {
            'name': instance.name,
            'email': instance.email,
            'department': str(instance.department_id) if instance.department else None,
            'position': str(instance.position_id) if instance.position else None,
            'base_salary': str(instance.base_salary),
            'role': str(instance.role_id),
        }
        
        # Check what changed
        changes = {}
        for key in new_values:
            if old_values.get(key) != new_values[key]:
                changes[key] = {
                    'old': old_values.get(key),
                    'new': new_values[key]
                }
        
        if not changes:
            return  # No changes made
        
        action = 'UPDATED'

    # Only log if there are actual changes
    if changes:
        EmployeeAuditLog.objects.create(
            employee=instance,
            changed_by=getattr(instance, '_changed_by', None),
            action=action,
            changes=changes,
        )


# ============== LEAVE SIGNALS ==============

@receiver(post_save, sender=Leave)
def notify_leave_status_change(sender, instance, created, **kwargs):
    """Notify employee when leave status changes"""
    if created:
        # Notify manager
        if instance.employee.reports_to:
            Notification.objects.create(
                recipient=instance.employee.reports_to,
                sender=instance.employee,
                notification_type='leave',
                title='New Leave Request',
                message=f'{instance.employee.name} has requested leave from {instance.start_date} to {instance.end_date}',
                related_object_id=str(instance.id)
            )
    else:
        # Notify on status change
        if instance.status == 'approved':
            Notification.objects.create(
                recipient=instance.employee,
                sender=instance.approved_by,
                notification_type='leave',
                title='Leave Approved',
                message=f'Your leave has been approved',
                related_object_id=str(instance.id)
            )
        elif instance.status == 'rejected':
            Notification.objects.create(
                recipient=instance.employee,
                sender=instance.approved_by,
                notification_type='leave',
                title='Leave Rejected',
                message=f'Your leave has been rejected',
                related_object_id=str(instance.id)
            )


# ============== BONUS SIGNALS ==============

@receiver(post_save, sender=Bonus)
def notify_bonus_approval(sender, instance, created, **kwargs):
    """Notify when bonus is approved"""
    if not created and instance.is_approved and instance.approved_by:
        Notification.objects.create(
            recipient=instance.employee,
            sender=instance.approved_by,
            notification_type='bonus',
            title='Bonus Approved',
            message=f'Your bonus of {instance.amount} has been approved',
            related_object_id=str(instance.id)
        )


# ============== PERFORMANCE REVIEW SIGNALS ==============

@receiver(post_save, sender=PerformanceReview)
def notify_performance_review(sender, instance, created, **kwargs):
    """Notify employee when review is completed"""
    if not created and instance.status == 'completed':
        Notification.objects.create(
            recipient=instance.employee,
            sender=instance.reviewer,
            notification_type='review',
            title='Performance Review Completed',
            message=f'Your performance review has been completed',
            related_object_id=str(instance.id)
        )


# ============== TASK SIGNALS ==============

@receiver(post_save, sender=Task)
def notify_task_assignment(sender, instance, created, **kwargs):
    """Notify when task is assigned"""
    if created and instance.assigned_to:
        Notification.objects.create(
            recipient=instance.assigned_to,
            sender=instance.project.project_manager,
            notification_type='approval',
            title='New Task Assigned',
            message=f'You have been assigned task: {instance.title}',
            related_object_id=str(instance.id)
        )
    elif not created and instance.assigned_to:
        # Task status change notification could be added here
        pass