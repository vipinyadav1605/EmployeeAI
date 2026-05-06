from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.db.models import Q, Avg, Count
import uuid


# ============== ROLE & PERMISSION MANAGEMENT ==============

class Role(models.Model):
    """Enhanced role management for RBAC"""
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('hr', 'HR Manager'),
        ('finance', 'Finance Officer'),
    ]
    
    name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField('Permission', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Permission(models.Model):
    """Fine-grained permission model"""
    ACTION_CHOICES = [
        ('view', 'View'),
        ('create', 'Create'),
        ('edit', 'Edit'),
        ('delete', 'Delete'),
        ('approve', 'Approve'),
    ]
    
    resource = models.CharField(max_length=50)  # e.g., 'employee', 'bonus', 'leave'
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('resource', 'action')
        ordering = ['resource', 'action']
    
    def __str__(self):
        return f"{self.resource}.{self.action}"


# ============== CORE EMPLOYEE MODEL ==============

class Department(models.Model):
    """Department model with hierarchical structure"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    manager = models.OneToOneField(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_department'
    )
    parent_department = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_departments'
    )
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"


class Position(models.Model):
    """Job position/designation model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='positions')
    salary_min = models.DecimalField(max_digits=10, decimal_places=2)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2)
    level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    required_experience = models.IntegerField(help_text="Years of experience required")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']
        unique_together = ('title', 'department')
        indexes = [
            models.Index(fields=['department', 'level']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.title} - {self.department.name}"


class Employee(AbstractUser):
    """Enhanced Employee model with extended attributes"""
    username = None
    
    # Basic Information
    empId = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Organization Information
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, related_name='employees')
    reports_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    
    # Role & Permissions
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name='employees')
    is_active = models.BooleanField(default=True)
    
    # Employment Details
    joining_date = models.DateField(null=True, blank=True)
    employment_type = models.CharField(
        max_length=20,
        choices=[('full_time', 'Full Time'), ('part_time', 'Part Time'), ('contract', 'Contract')],
        default='full_time'
    )
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Profile
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    bio = models.TextField(blank=True)
    
    # Status
    is_verified = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'empId']

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['empId']),
            models.Index(fields=['department', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.empId})"

    @property
    def full_name(self):
        return self.name

    def get_team_members(self):
        """Get all direct subordinates"""
        return self.subordinates.filter(is_active=True)

    def get_permissions(self):
        """Get all permissions for this user"""
        return self.role.permissions.all()

    def has_permission(self, resource, action):
        """Check if user has specific permission"""
        return self.role.permissions.filter(
            resource=resource,
            action=action
        ).exists()


class EmployeeAuditLog(models.Model):
    """Audit trail for employee changes"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='audit_logs')
    changed_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='audit_logs_created')
    action = models.CharField(max_length=50)
    changes = models.JSONField()  # Store what was changed
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['employee', '-timestamp']),
            models.Index(fields=['changed_by']),
        ]

    def __str__(self):
        return f"{self.employee} - {self.action} - {self.timestamp}"


# ============== COMPENSATION & BENEFITS ==============

class Bonus(models.Model):
    """Enhanced Bonus model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='bonuses')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bonus_type = models.CharField(
        max_length=20,
        choices=[('performance', 'Performance'), ('annual', 'Annual'), ('special', 'Special')],
        default='performance'
    )
    description = models.TextField(blank=True)
    bonus_date = models.DateField()
    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bonuses_approved'
    )
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-bonus_date']
        indexes = [
            models.Index(fields=['employee', '-bonus_date']),
            models.Index(fields=['is_approved']),
        ]

    def __str__(self):
        return f"{self.employee} - {self.amount} ({self.bonus_date})"


class Salary(models.Model):
    """Salary history and management"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_history')
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    effective_date = models.DateField()
    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        related_name='salary_approvals'
    )
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_date']
        indexes = [
            models.Index(fields=['employee', '-effective_date']),
        ]

    def __str__(self):
        return f"{self.employee} - {self.base_salary} (from {self.effective_date})"

    @property
    def total_salary(self):
        return self.base_salary + self.allowances - self.deductions


# ============== LEAVE MANAGEMENT ==============

class LeaveType(models.Model):
    """Different types of leaves"""
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=10, unique=True)
    days_per_year = models.IntegerField()
    description = models.TextField(blank=True)
    requires_approval = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Leave(models.Model):
    """Leave request management"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='leaves_approved'
    )
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.start_date} to {self.end_date})"

    @property
    def total_days(self):
        from datetime import timedelta
        return (self.end_date - self.start_date).days + 1
# ============== PERFORMANCE MANAGEMENT ==============

class PerformanceReview(models.Model):
    """Performance review and appraisal system"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Under Review'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='reviews_given')
    review_period_start = models.DateField()
    review_period_end = models.DateField()
    
    # Ratings
    performance_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1: Poor, 5: Excellent"
    )
    technical_skills = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    communication = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    teamwork = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    leadership = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    # Comments
    strengths = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    goals_for_next_period = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('employee', 'review_period_start', 'review_period_end')
        indexes = [
            models.Index(fields=['employee', 'status']),
        ]

    def __str__(self):
        return f"{self.employee} - Review ({self.review_period_start})"

    @property
    def average_rating(self):
        ratings = [
            self.technical_skills,
            self.communication,
            self.teamwork,
            self.leadership
        ]
        return round(sum(ratings) / len(ratings), 2)


# ============== ATTENDANCE MANAGEMENT ==============

class Attendance(models.Model):
    """Employee attendance tracking"""
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
        ('wfh', 'Work From Home'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        unique_together = ('employee', 'date')
        indexes = [
            models.Index(fields=['employee', '-date']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"{self.employee} - {self.date} ({self.status})"


# ============== CHAT & COMMUNICATION ==============

class ChatConversation(models.Model):
    """Chat conversation between employees"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(Employee, related_name='chat_conversations')
    subject = models.CharField(max_length=255, blank=True)
    is_group = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['-updated_at']),
        ]

    def __str__(self):
        return f"Chat - {self.subject or 'Conversation'}"

    def get_unread_count(self, user):
        return self.messages.filter(is_read=False).exclude(sender=user).count()


class ChatMessage(models.Model):
    """Individual chat messages"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(ChatConversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    attachment = models.FileField(upload_to='chat_attachments/', null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', '-created_at']),
            models.Index(fields=['sender']),
        ]

    def __str__(self):
        return f"{self.sender} - {self.content[:50]}"


class Notification(models.Model):
    """Real-time notifications"""
    TYPE_CHOICES = [
        ('leave', 'Leave Request'),
        ('bonus', 'Bonus Approval'),
        ('review', 'Performance Review'),
        ('message', 'New Message'),
        ('approval', 'Approval Required'),
        ('general', 'General'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications_sent')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    related_object_id = models.CharField(max_length=255, blank=True)  # UUID or ID of related object
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient}"


# ============== PROJECTS & TASKS ==============

class Project(models.Model):
    """Project management"""
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='projects')
    project_manager = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='managed_projects')
    team_members = models.ManyToManyField(Employee, related_name='assigned_projects')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['project_manager']),
        ]

    def __str__(self):
        return self.name


class Task(models.Model):
    """Project tasks"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'Review'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='assigned_tasks')
    
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    
    start_date = models.DateField()
    due_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    
    estimated_hours = models.IntegerField(null=True, blank=True)
    actual_hours = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date', '-priority']
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['assigned_to', 'status']),
        ]

    def __str__(self):
        return self.title