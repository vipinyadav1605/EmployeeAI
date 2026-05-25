from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import (
    Employee, Bonus, Department, Position, Role, Permission,
    Leave, LeaveType, PerformanceReview, Attendance,
    ChatConversation, ChatMessage, Notification, Project, Task,
    Salary, EmployeeAuditLog
)


# ============== PERMISSION & ROLE SERIALIZERS ==============

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'resource', 'action', 'description']


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        write_only=True,
        source='permissions'
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions', 'permission_ids']


# ============== DEPARTMENT & POSITION SERIALIZERS ==============

class DepartmentListSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'budget', 'employee_count']

    def get_employee_count(self, obj):
        return obj.employees.filter(is_active=True).count()


class DepartmentDetailSerializer(serializers.ModelSerializer):
    manager_detail = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()
    sub_departments = DepartmentListSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'description', 'manager',
            'manager_detail', 'parent_department', 'budget',
            'employee_count', 'sub_departments', 'created_at'
        ]

    def get_manager_detail(self, obj):
        if obj.manager:
            return {
                'id': obj.manager.id,
                'name': obj.manager.name,
                'email': obj.manager.email,
            }
        return None

    def get_employee_count(self, obj):
        return obj.employees.filter(is_active=True).count()


class PositionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Position
        fields = [
            'id', 'title', 'description', 'department', 'department_name',
            'salary_min', 'salary_max', 'level', 'required_experience', 'is_active'
        ]


# ============== SALARY SERIALIZER ==============

class SalarySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.name', read_only=True)
    total_salary = serializers.ReadOnlyField()

    class Meta:
        model = Salary
        fields = [
            'id', 'employee', 'employee_name', 'base_salary', 'allowances',
            'deductions', 'effective_date', 'approved_by', 'approved_by_name',
            'reason', 'total_salary', 'created_at'
        ]


# ============== BONUS SERIALIZER ==============

class BonusSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.name', read_only=True)

    class Meta:
        model = Bonus
        fields = [
            'id', 'employee', 'employee_name', 'employee_email',
            'amount', 'bonus_type', 'description', 'bonus_date',
            'approved_by', 'approved_by_name', 'is_approved',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['approved_by', 'is_approved', 'created_at', 'updated_at']


class BonusApprovalSerializer(serializers.ModelSerializer):
    """Serializer for bonus approval (for managers)"""
    class Meta:
        model = Bonus
        fields = ['id', 'is_approved', 'approved_by']
        read_only_fields = ['id', 'approved_by']


# ============== LEAVE SERIALIZERS ==============

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'name', 'code', 'days_per_year', 'description', 'requires_approval']


class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.name', read_only=True)
    total_days = serializers.ReadOnlyField()

    class Meta:
        model = Leave
        fields = [
            'id', 'employee', 'employee_name', 'leave_type', 'leave_type_name',
            'start_date', 'end_date', 'total_days', 'reason', 'status',
            'approved_by', 'approved_by_name', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['approved_by', 'rejection_reason', 'created_at', 'updated_at']

    def validate(self, data):
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data


class LeaveApprovalSerializer(serializers.ModelSerializer):
    """Serializer for leave approval"""
    class Meta:
        model = Leave
        fields = ['id', 'status', 'approved_by', 'rejection_reason']
        read_only_fields = ['id', 'approved_by']


# ============== ATTENDANCE SERIALIZER ==============

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'date', 'status',
            'check_in_time', 'check_out_time', 'remarks', 'created_at'
        ]


# ============== PERFORMANCE REVIEW SERIALIZERS ==============

class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.name', read_only=True)
    average_rating = serializers.ReadOnlyField()

    class Meta:
        model = PerformanceReview
        fields = [
            'id', 'employee', 'employee_name', 'reviewer', 'reviewer_name',
            'review_period_start', 'review_period_end',
            'performance_rating', 'technical_skills', 'communication',
            'teamwork', 'leadership', 'average_rating',
            'strengths', 'areas_for_improvement', 'goals_for_next_period',
            'status', 'created_at', 'updated_at'
        ]


# ============== CHAT SERIALIZERS ==============

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    sender_email = serializers.CharField(source='sender.email', read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            'id', 'conversation', 'sender', 'sender_name', 'sender_email',
            'content', 'attachment', 'is_read', 'read_at',
            'created_at', 'edited_at'
        ]
        read_only_fields = ['sender', 'read_at', 'created_at']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class ChatConversationSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatConversation
        fields = [
            'id', 'participants', 'subject', 'is_group',
            'last_message', 'unread_count', 'message_count',
            'created_at', 'updated_at'
        ]

    def get_participants(self, obj):
        return [
            {'id': p.id, 'name': p.name, 'email': p.email}
            for p in obj.participants.all()
        ]

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return ChatMessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        return obj.get_unread_count(self.context['request'].user)

    def get_message_count(self, obj):
        return obj.messages.count()


class ChatConversationDetailSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatConversation
        fields = [
            'id', 'participants', 'subject', 'is_group', 'messages',
            'created_at', 'updated_at'
        ]

    def get_participants(self, obj):
        return [
            {'id': p.id, 'name': p.name, 'email': p.email}
            for p in obj.participants.all()
        ]


# ============== NOTIFICATION SERIALIZER ==============

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'sender', 'sender_name', 'notification_type',
            'title', 'message', 'related_object_id', 'is_read', 'read_at',
            'created_at'
        ]
        read_only_fields = ['recipient', 'read_at', 'created_at']


# ============== PROJECT & TASK SERIALIZERS ==============

class ProjectSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    project_manager_name = serializers.CharField(source='project_manager.name', read_only=True)
    team_members_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'department', 'department_name',
            'project_manager', 'project_manager_name', 'team_members_count',
            'status', 'start_date', 'end_date', 'budget',
            'created_at', 'updated_at'
        ]

    def get_team_members_count(self, obj):
        return obj.team_members.count()


class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'project_name', 'title', 'description',
            'assigned_to', 'assigned_to_name', 'priority', 'status',
            'start_date', 'due_date', 'completion_date',
            'estimated_hours', 'actual_hours',
            'created_at', 'updated_at'
        ]


# ============== EMPLOYEE SERIALIZERS ==============

class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    position_title = serializers.CharField(source='position.title', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'empId', 'name', 'email', 'phone',
            'department', 'department_name', 'position', 'position_title',
            'role', 'role_name', 'base_salary', 'is_active',
            'joining_date', 'last_activity'
        ]


class EmployeeMinimalSerializer(serializers.ModelSerializer):
    """Minimal employee info (for relations)"""
    class Meta:
        model = Employee
        fields = ['id', 'empId', 'name', 'email', 'profile_image']


class EmployeeDetailSerializer(serializers.ModelSerializer):
    department_detail = DepartmentDetailSerializer(source='department', read_only=True)
    position_detail = PositionSerializer(source='position', read_only=True)
    role_detail = RoleSerializer(source='role', read_only=True)
    reports_to_name = serializers.CharField(source='reports_to.name', read_only=True)
    subordinates = EmployeeMinimalSerializer(many=True, read_only=True)
    team_members = serializers.SerializerMethodField()
    current_salary = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id', 'empId', 'name', 'email', 'phone', 'date_of_birth',
            'department', 'department_detail', 'position', 'position_detail',
            'reports_to', 'reports_to_name', 'subordinates',
            'role', 'role_detail', 'is_active', 'joining_date',
            'employment_type', 'base_salary', 'current_salary',
            'profile_image', 'bio', 'is_verified', 'team_members',
            'last_activity', 'created_at', 'updated_at'
        ]

    def get_team_members(self, obj):
        subordinates = obj.get_team_members()
        return EmployeeMinimalSerializer(subordinates, many=True).data

    def get_current_salary(self, obj):
        current_salary = obj.salary_history.first()
        return SalarySerializer(current_salary).data if current_salary else None
from rest_framework import serializers
from .models import Employee, Department, Position, Role
import uuid

class EmployeeRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    # accept both UUID or name
    department = serializers.CharField(required=False)
    position = serializers.CharField(required=False)
    role = serializers.CharField()

    class Meta:
        model = Employee
        fields = [
            'empId',
            'name',
            'email',
            'password',
            'password2',
            'phone',
            'department',
            'position',
            'role',
            'date_of_birth',
            'employment_type'
        ]

    def validate(self, data):

        if data['password'] != data['password2']:
            raise serializers.ValidationError({
                "password": "Passwords don't match"
            })

        if Employee.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                "email": "Email already exists"
            })

        if Employee.objects.filter(empId=data['empId']).exists():
            raise serializers.ValidationError({
                "empId": "Employee ID already exists"
            })

        return data

    # helper function
    def get_object(self, model, value, field_name):

        if not value:
            return None

        # Try UUID
        try:
            uuid_obj = uuid.UUID(value)

            obj = model.objects.filter(id=uuid_obj).first()

            if obj:
                return obj

        except:
            pass

        # Department
        if model == Department:

            obj, _ = model.objects.get_or_create(
                name=value,
                defaults={
                    "code": value[:3].upper()
                }
            )

        # Role
        elif model == Role:

            obj, _ = model.objects.get_or_create(
                name=value
            )

        else:
            obj = None

        return obj

    def create(self, validated_data):

        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)
        department_val = validated_data.pop('department', None)
        position_val = validated_data.pop('position', None)
        role_val = validated_data.pop('role')
        department = self.get_object(
            Department,
            department_val,
            "department"
        )

        
        role, _ = Role.objects.get_or_create(
            name=role_val
        )

        # ================= POSITION =================
        position = None

        if position_val and department:

            position, _ = Position.objects.get_or_create(
                title=position_val,
                department=department,
                defaults={
                    "salary_min": 10000,
                    "salary_max": 50000,
                    "level": 1,
                    "required_experience": 0,
                }
            )
        employee = Employee(
            department=department,
            position=position,
            role=role,
            **validated_data
        )

        employee.set_password(password)
        employee.save()

        return employee
class EmployeeUpdateSerializer(serializers.ModelSerializer):
    """For updating employee information"""
    class Meta:
        model = Employee
        fields = [
            'name', 'phone', 'bio', 'profile_image',
            'department', 'position', 'reports_to',
            'employment_type', 'base_salary', 'joining_date'
        ]


class EmployeePasswordChangeSerializer(serializers.Serializer):
    """For password change"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password2 = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({"new_password": "Passwords don't match"})
        return data
class EmployeeAuditLogSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.name', read_only=True)

    class Meta:
        model = EmployeeAuditLog
        fields = [
            'id', 'employee', 'employee_name', 'changed_by',
            'changed_by_name', 'action', 'changes', 'timestamp', 'ip_address'
        ]