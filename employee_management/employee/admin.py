from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Q
from .models import (
    Role, Permission, Employee, Department, Position,
    Bonus, Salary, Leave, LeaveType, PerformanceReview,
    Attendance, ChatConversation, ChatMessage, Notification,
    Project, Task, EmployeeAuditLog
)


# ============== FILTERS ==============

class ActiveEmployeeFilter(admin.SimpleListFilter):
    title = 'Status'
    parameter_name = 'is_active'

    def lookups(self, request, model_admin):
        return (
            ('true', 'Active'),
            ('false', 'Inactive'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'true':
            return queryset.filter(is_active=True)
        if self.value() == 'false':
            return queryset.filter(is_active=False)


class DepartmentFilter(admin.SimpleListFilter):
    title = 'Department'
    parameter_name = 'department'

    def lookups(self, request, model_admin):
        departments = Department.objects.values_list('id', 'name')
        return departments

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(department__id=self.value())


class RoleFilter(admin.SimpleListFilter):
    title = 'Role'
    parameter_name = 'role'

    def lookups(self, request, model_admin):
        return Role.objects.values_list('id', 'name')

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(role__id=self.value())


class ApprovedFilter(admin.SimpleListFilter):
    title = 'Approval Status'
    parameter_name = 'is_approved'

    def lookups(self, request, model_admin):
        return (
            ('true', 'Approved'),
            ('false', 'Pending'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'true':
            return queryset.filter(is_approved=True)
        if self.value() == 'false':
            return queryset.filter(is_approved=False)


# ============== INLINES ==============

class SalaryInline(admin.TabularInline):
    model = Salary
    fk_name = 'employee'
    extra = 0
    fields = ['base_salary', 'allowances', 'deductions', 'effective_date', 'approved_by']
    readonly_fields = ['created_at']


class BonusInline(admin.TabularInline):
    model = Bonus
    fk_name = 'employee'
    extra = 0
    fields = ['amount', 'bonus_type', 'bonus_date', 'is_approved']


class LeaveInline(admin.TabularInline):
    model = Leave
    fk_name = 'employee'
    extra = 0
    fields = ['leave_type', 'start_date', 'end_date', 'status']
    readonly_fields = ['created_at']


# ============== ADMIN CLASSES ==============

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'get_permissions_count']
    search_fields = ['name', 'description']
    filter_horizontal = ['permissions']

    def get_permissions_count(self, obj):
        return obj.permissions.count()
    get_permissions_count.short_description = 'Permissions'


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['resource', 'action', 'description']
    list_filter = ['resource', 'action']
    search_fields = ['resource', 'description']
    ordering = ['resource', 'action']


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'manager', 'get_employee_count', 'budget']
    list_filter = ['created_at']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at', 'get_employee_count']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'description')
        }),
        ('Organization', {
            'fields': ('manager', 'parent_department')
        }),
        ('Financial', {
            'fields': ('budget',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_employee_count(self, obj):
        return obj.employees.filter(is_active=True).count()
    get_employee_count.short_description = 'Active Employees'


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'level', 'salary_min', 'salary_max', 'is_active']
    list_filter = ['department', 'level', 'is_active']
    search_fields = ['title', 'description']
    fieldsets = (
        ('Position Details', {
            'fields': ('title', 'description', 'department')
        }),
        ('Compensation', {
            'fields': ('salary_min', 'salary_max')
        }),
        ('Requirements', {
            'fields': ('level', 'required_experience')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['empId', 'name', 'email', 'department', 'position', 'role', 'status_badge', 'joining_date']
    list_filter = [ActiveEmployeeFilter, DepartmentFilter, RoleFilter, 'employment_type', 'joining_date']
    search_fields = ['empId', 'name', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'last_activity']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('empId', 'name', 'email', 'phone', 'date_of_birth')
        }),
        ('Organization', {
            'fields': ('department', 'position', 'role', 'reports_to')
        }),
        ('Employment', {
            'fields': ('employment_type', 'joining_date', 'base_salary')
        }),
        ('Profile', {
            'fields': ('profile_image', 'bio', 'is_verified')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'last_activity'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [SalaryInline, BonusInline, LeaveInline]
    filter_horizontal = []
    
    actions = ['activate_employees', 'deactivate_employees']

    def status_badge(self, obj):
        if obj.is_active:
            color = 'green'
            status = 'Active'
        else:
            color = 'red'
            status = 'Inactive'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            status
        )
    status_badge.short_description = 'Status'

    def activate_employees(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} employees activated')
    activate_employees.short_description = 'Activate selected employees'

    def deactivate_employees(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} employees deactivated')
    deactivate_employees.short_description = 'Deactivate selected employees'


@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):
    list_display = ['employee', 'base_salary', 'allowances', 'deductions', 'effective_date', 'approved_by']
    list_filter = ['effective_date', 'approved_by']
    search_fields = ['employee__name', 'employee__email']
    readonly_fields = ['created_at']
    fieldsets = (
        ('Employee', {
            'fields': ('employee', 'effective_date')
        }),
        ('Salary Components', {
            'fields': ('base_salary', 'allowances', 'deductions')
        }),
        ('Approval', {
            'fields': ('approved_by', 'reason')
        }),
    )


@admin.register(Bonus)
class BonusAdmin(admin.ModelAdmin):
    list_display = ['employee', 'amount', 'bonus_type', 'bonus_date', 'is_approved', 'approved_by']
    list_filter = [ApprovedFilter, 'bonus_type', 'bonus_date']
    search_fields = ['employee__name', 'employee__email']
    readonly_fields = ['created_at', 'updated_at']
    actions = ['approve_bonuses']
    
    fieldsets = (
        ('Employee', {
            'fields': ('employee',)
        }),
        ('Bonus Details', {
            'fields': ('amount', 'bonus_type', 'description', 'bonus_date')
        }),
        ('Approval', {
            'fields': ('is_approved', 'approved_by')
        }),
    )

    def approve_bonuses(self, request, queryset):
        updated = queryset.filter(is_approved=False).update(
            is_approved=True,
            approved_by=request.user
        )
        self.message_user(request, f'{updated} bonuses approved')
    approve_bonuses.short_description = 'Approve selected bonuses'


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'days_per_year', 'requires_approval', 'is_active']
    list_filter = ['requires_approval', 'is_active']
    search_fields = ['name', 'code']


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'status', 'total_days']
    list_filter = ['status', 'leave_type', 'start_date']
    search_fields = ['employee__name', 'employee__email']
    readonly_fields = ['created_at', 'updated_at', 'total_days']
    actions = ['approve_leaves', 'reject_leaves']
    
    fieldsets = (
        ('Leave Details', {
            'fields': ('employee', 'leave_type', 'start_date', 'end_date', 'total_days')
        }),
        ('Request', {
            'fields': ('reason', 'status')
        }),
        ('Approval', {
            'fields': ('approved_by', 'rejection_reason')
        }),
    )

    def approve_leaves(self, request, queryset):
        updated = queryset.filter(status='pending').update(
            status='approved',
            approved_by=request.user
        )
        self.message_user(request, f'{updated} leaves approved')
    approve_leaves.short_description = 'Approve selected leaves'

    def reject_leaves(self, request, queryset):
        updated = queryset.filter(status='pending').update(status='rejected')
        self.message_user(request, f'{updated} leaves rejected')
    reject_leaves.short_description = 'Reject selected leaves'


@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ['employee', 'reviewer', 'review_period_start', 'status', 'average_rating']
    list_filter = ['status', 'review_period_start']
    search_fields = ['employee__name', 'reviewer__name']
    readonly_fields = ['average_rating', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Review Details', {
            'fields': ('employee', 'reviewer', 'review_period_start', 'review_period_end')
        }),
        ('Ratings', {
            'fields': ('performance_rating', 'technical_skills', 'communication', 'teamwork', 'leadership', 'average_rating')
        }),
        ('Feedback', {
            'fields': ('strengths', 'areas_for_improvement', 'goals_for_next_period')
        }),
        ('Status', {
            'fields': ('status',)
        }),
    )


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'status', 'check_in_time', 'check_out_time']
    list_filter = ['status', 'date']
    search_fields = ['employee__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'project_manager', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'start_date']
    search_fields = ['name', 'description']
    filter_horizontal = ['team_members']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'assigned_to', 'priority', 'status', 'due_date']
    list_filter = ['status', 'priority', 'due_date']
    search_fields = ['title', 'description']


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ['subject', 'is_group', 'get_participant_count', 'get_message_count', 'updated_at']
    list_filter = ['is_group', 'created_at']
    search_fields = ['subject']
    filter_horizontal = ['participants']

    def get_participant_count(self, obj):
        return obj.participants.count()
    get_participant_count.short_description = 'Participants'

    def get_message_count(self, obj):
        return obj.messages.count()
    get_message_count.short_description = 'Messages'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'conversation', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__name', 'content']
    readonly_fields = ['created_at', 'edited_at', 'read_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'recipient__name']
    readonly_fields = ['created_at', 'read_at']
    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} notifications marked as read')
    mark_as_read.short_description = 'Mark as read'


@admin.register(EmployeeAuditLog)
class EmployeeAuditLogAdmin(admin.ModelAdmin):
    list_display = ['employee', 'action', 'changed_by', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['employee__name', 'changed_by__name']
    readonly_fields = ['employee', 'changed_by', 'action', 'changes', 'timestamp', 'ip_address']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False