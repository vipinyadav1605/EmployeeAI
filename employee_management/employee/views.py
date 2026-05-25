from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Avg, Count, F
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta
from rest_framework.permissions import AllowAny
from .models import (
    Employee, Department, Position, Role, Bonus,
    Leave, LeaveType, PerformanceReview, Attendance,
    ChatConversation, ChatMessage, Notification, Project, Task,
    Salary, EmployeeAuditLog, Permission
)
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer, EmployeeRegisterSerializer,
    EmployeeUpdateSerializer, EmployeePasswordChangeSerializer, EmployeeMinimalSerializer,
    DepartmentDetailSerializer, DepartmentListSerializer, PositionSerializer,
    BonusSerializer, BonusApprovalSerializer, LeaveSerializer, LeaveTypeSerializer,
    LeaveApprovalSerializer, PerformanceReviewSerializer, AttendanceSerializer,
    ChatConversationSerializer, ChatConversationDetailSerializer, ChatMessageSerializer,
    NotificationSerializer, ProjectSerializer, TaskSerializer, RoleSerializer,
    PermissionSerializer, SalarySerializer, EmployeeAuditLogSerializer
)
from .permissions import (
    IsAdminUser, IsHRManager,IsEmployee, IsManager, IsFinanceOfficer,
    IsEmployeeOwnerOrManager, HasResourcePermission, CanManageLeaves,
    CanManageBonuses, CanManagePerformanceReviews, CanAccessChat,
    CanManageProjects, CanManageTasks, CanViewAttendance, CanManageAttendance,
    CanManageSalary, CanManageDepartments, IsComplianceTeam, IsAdminOrReadOnly,
    IsOwnUserOrAdmin
)

#  ============== PAGINATION ==============

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
@api_view(['POST'])
@permission_classes([])
def Register(request):
    """Register new employee"""
    print("Register data of frontend ",request.data)
    serializer = EmployeeRegisterSerializer(data=request.data)
    print("Register serializer",serializer)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "User registered successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([])
def Login(request):
    """Login with email and password"""
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"detail": "Email and password required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = Employee.objects.get(email=email)
    except Employee.DoesNotExist:
        return Response(
            {"detail": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.check_password(password):
        return Response(
            {"detail": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {"detail": "User account is disabled"},
            status=status.HTTP_403_FORBIDDEN
        )

    refresh = RefreshToken.for_user(user)

    # Update last activity
    user.last_activity = datetime.now()
    user.save(update_fields=['last_activity'])

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "empId": user.empId,
            "name": user.name,
            "email": user.email,
            "role": user.role.name,
            "department": user.department.name if user.department else None,
            "position": user.position.title if user.position else None,
        }
    })


# ============== ROLE & PERMISSION VIEWSETS ==============

class RoleViewSet(viewsets.ModelViewSet):
    """Role management"""
    queryset = Role.objects.prefetch_related('permissions')
    serializer_class = RoleSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class PermissionViewSet(viewsets.ModelViewSet):
    """Permission management"""
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['resource', 'action']
    search_fields = ['resource', 'description']


# ============== EMPLOYEE VIEWSETS ==============

class EmployeeViewSet(viewsets.ModelViewSet):
    """Complete employee management with advanced features"""
    queryset = Employee.objects.select_related('department', 'position', 'role').prefetch_related('subordinates')
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'position', 'role', 'is_active', 'employment_type']
    search_fields = ['name', 'email', 'empId', 'phone']
    ordering_fields = ['name', 'joining_date', 'base_salary', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EmployeeDetailSerializer
        elif self.action == 'register':
            return EmployeeRegisterSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return EmployeeUpdateSerializer
        elif self.action == 'change_password':
            return EmployeePasswordChangeSerializer
        return EmployeeListSerializer

    def get_permissions(self):
        if self.action == 'register':
            permission_classes = []
        elif self.action in ['create', 'destroy']:
            permission_classes = [IsAdminUser]
        elif self.action == 'change_password':
            permission_classes = [IsOwnUserOrAdmin]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAdminUser | IsOwnUserOrAdmin]
        elif self.action == 'retrieve':
            permission_classes = [IsEmployeeOwnerOrManager]
        else:
            permission_classes = [IsAdminUser | IsHRManager | IsEmployee]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register new employee"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsOwnUserOrAdmin])
    def change_password(self, request, pk=None):
        """Change user password"""
        user = self.get_object()
        serializer = EmployeePasswordChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"detail": "Old password is incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({"message": "Password changed successfully"})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def team(self, request, pk=None):
        """Get team members of a manager"""
        employee = self.get_object()
        team = employee.get_team_members()
        serializer = EmployeeMinimalSerializer(team, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def performance_summary(self, request, pk=None):
        """Get performance summary of an employee"""
        employee = self.get_object()
        reviews = PerformanceReview.objects.filter(employee=employee)
        
        avg_performance = reviews.aggregate(
            avg_rating=Avg('performance_rating'),
            avg_technical=Avg('technical_skills'),
            avg_communication=Avg('communication'),
            avg_teamwork=Avg('teamwork'),
            avg_leadership=Avg('leadership')
        )
        
        return Response({
            "total_reviews": reviews.count(),
            "average_ratings": avg_performance,
            "latest_review": PerformanceReviewSerializer(reviews.first()).data if reviews.exists() else None
        })

    @action(detail=False, methods=['get'])
    def reports(self, request):
        """Get reporting structure"""
        employees = Employee.objects.filter(is_active=True).select_related('reports_to')
        reporting_structure = []
        
        for emp in employees:
            reporting_structure.append({
                "id": emp.id,
                "name": emp.name,
                "reports_to": emp.reports_to.name if emp.reports_to else "No Manager"
            })
        
        return Response(reporting_structure)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser | IsHRManager])
    def audit_logs(self, request):
        """Get audit logs for all employees"""
        logs = EmployeeAuditLog.objects.select_related('employee', 'changed_by')
        serializer = EmployeeAuditLogSerializer(logs, many=True)
        return Response(serializer.data)


# ============== DEPARTMENT VIEWSET ==============

class DepartmentViewSet(viewsets.ModelViewSet):
    """Department management"""
    queryset = Department.objects.select_related('manager', 'parent_department')
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DepartmentDetailSerializer
        return DepartmentListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [CanManageDepartments]
        else:
            permission_classes = [IsAdminUser | IsHRManager]
        
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'])
    def employees(self, request, pk=None):
        """Get all employees in a department"""
        department = self.get_object()
        employees = department.employees.filter(is_active=True)
        serializer = EmployeeMinimalSerializer(employees, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def budget_summary(self, request, pk=None):
        """Get budget summary for department"""
        department = self.get_object()
        employees = department.employees.filter(is_active=True)
        
        total_salary = employees.aggregate(
            total=Sum('base_salary')
        )['total'] or 0
        
        return Response({
            "department": department.name,
            "budget": float(department.budget),
            "total_salary": float(total_salary),
            "remaining_budget": float(department.budget - total_salary),
            "employee_count": employees.count()
        })


# ============== POSITION VIEWSET ==============

class PositionViewSet(viewsets.ModelViewSet):
    """Job position management"""
    queryset = Position.objects.select_related('department')
    serializer_class = PositionSerializer
    permission_classes = [IsAdminUser | IsHRManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'level', 'is_active']
    search_fields = ['title', 'description']


# ============== BONUS VIEWSET ==============

class BonusViewSet(viewsets.ModelViewSet):
    """Bonus management"""
    queryset = Bonus.objects.select_related('employee', 'approved_by')
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'bonus_type', 'is_approved']
    search_fields = ['employee__name', 'employee__email']
    ordering_fields = ['bonus_date', 'amount']
    ordering = ['-bonus_date']

    def get_serializer_class(self):
        if self.action == 'approve':
            return BonusApprovalSerializer
        return BonusSerializer

    def get_permissions(self):
        if self.action == 'approve':
            permission_classes = [CanManageBonuses]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [CanManageBonuses]
        else:
            permission_classes = [IsAdminUser | IsHRManager | IsFinanceOfficer]
        
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], permission_classes=[CanManageBonuses])
    def approve(self, request, pk=None):
        """Approve a bonus"""
        bonus = self.get_object()
        bonus.is_approved = True
        bonus.approved_by = request.user
        bonus.save()
        
        # Create notification
        Notification.objects.create(
            recipient=bonus.employee,
            sender=request.user,
            notification_type='bonus',
            title='Bonus Approved',
            message=f'Your bonus of {bonus.amount} has been approved',
            related_object_id=str(bonus.id)
        )
        
        serializer = self.get_serializer(bonus)
        return Response(serializer.data)


# ============== SALARY VIEWSET ==============

class SalaryViewSet(viewsets.ModelViewSet):
    """Salary management"""
    queryset = Salary.objects.select_related('employee', 'approved_by')
    serializer_class = SalarySerializer
    permission_classes = [CanManageSalary]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee']
    ordering = ['-effective_date']

    def perform_create(self, serializer):
        serializer.save(approved_by=self.request.user)


# ============== LEAVE VIEWSET ==============

class LeaveTypeViewSet(viewsets.ModelViewSet):
    """Leave type management"""
    queryset = LeaveType.objects.filter(is_active=True)
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAdminUser | IsHRManager]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']


class LeaveViewSet(viewsets.ModelViewSet):
    """Leave management"""
    queryset = Leave.objects.select_related('employee', 'leave_type', 'approved_by')
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'leave_type', 'status']
    search_fields = ['employee__name', 'employee__email']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'approve' or self.action == 'reject':
            return LeaveApprovalSerializer
        return LeaveSerializer

    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            permission_classes = [CanManageLeaves]
        elif self.action in ['create', 'update']:
            permission_classes = [IsEmployeeOwnerOrManager]
        else:
            permission_classes = [IsAdminUser | IsHRManager | CanManageLeaves]
        
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], permission_classes=[CanManageLeaves])
    def approve(self, request, pk=None):
        """Approve a leave request"""
        leave = self.get_object()
        leave.status = 'approved'
        leave.approved_by = request.user
        leave.save()
        
        Notification.objects.create(
            recipient=leave.employee,
            sender=request.user,
            notification_type='leave',
            title='Leave Approved',
            message=f'Your leave from {leave.start_date} to {leave.end_date} has been approved',
            related_object_id=str(leave.id)
        )
        
        serializer = self.get_serializer(leave)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[CanManageLeaves])
    def reject(self, request, pk=None):
        """Reject a leave request"""
        leave = self.get_object()
        leave.status = 'rejected'
        leave.rejection_reason = request.data.get('rejection_reason', '')
        leave.approved_by = request.user
        leave.save()
        
        Notification.objects.create(
            recipient=leave.employee,
            sender=request.user,
            notification_type='leave',
            title='Leave Rejected',
            message=f'Your leave request has been rejected',
            related_object_id=str(leave.id)
        )
        
        serializer = self.get_serializer(leave)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_leaves(self, request):
        """Get current user's leaves"""
        leaves = Leave.objects.filter(employee=request.user)
        serializer = LeaveSerializer(leaves, many=True)
        return Response(serializer.data)


# ============== PERFORMANCE REVIEW VIEWSET ==============

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    """Performance review management"""
    queryset = PerformanceReview.objects.select_related('employee', 'reviewer')
    serializer_class = PerformanceReviewSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'status']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [CanManagePerformanceReviews]
        else:
            permission_classes = [IsAdminUser | IsHRManager | IsManager]
        
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)

    @action(detail=True, methods=['get'])
    def employee_reviews(self, request, pk=None):
        """Get all reviews for an employee"""
        reviews = PerformanceReview.objects.filter(employee_id=pk)
        serializer = PerformanceReviewSerializer(reviews, many=True)
        return Response(serializer.data)


# ============== ATTENDANCE VIEWSET ==============

class AttendanceViewSet(viewsets.ModelViewSet):
    """Attendance management"""
    queryset = Attendance.objects.select_related('employee')
    serializer_class = AttendanceSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'status', 'date']
    ordering = ['-date']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [CanManageAttendance]
        else:
            permission_classes = [CanViewAttendance]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def my_attendance(self, request):
        """Get current user's attendance"""
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        attendance = Attendance.objects.filter(employee=request.user)
        
        if month and year:
            attendance = attendance.filter(date__month=month, date__year=year)
        
        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get attendance summary"""
        employee = request.user
        today = datetime.now().date()
        month_start = today.replace(day=1)
        
        month_attendance = Attendance.objects.filter(
            employee=employee,
            date__gte=month_start
        ).values('status').annotate(count=Count('id'))
        
        return Response({
            "month": today.month,
            "year": today.year,
            "summary": list(month_attendance)
        })


# ============== CHAT VIEWSET ==============

class ChatConversationViewSet(viewsets.ModelViewSet):
    """Chat conversation management"""
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['subject']
    ordering = ['-updated_at']
    permission_classes = [CanAccessChat]

    def get_queryset(self):
        return ChatConversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChatConversationDetailSerializer
        return ChatConversationSerializer

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark all messages as read"""
        conversation = self.get_object()
        ChatMessage.objects.filter(
            conversation=conversation,
            is_read=False
        ).exclude(sender=request.user).update(
            is_read=True,
            read_at=datetime.now()
        )
        return Response({"message": "Messages marked as read"})

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message in conversation"""
        conversation = self.get_object()
        serializer = ChatMessageSerializer(
            data={'conversation': pk, **request.data},
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    @action(detail=False, methods=['post'])
    def get_or_create(self, request):
        user = request.user
        other_user_id = request.data.get("user_id")

        if not other_user_id:
            return Response({"error": "user_id required"}, status=400)

    # check existing conversation
        conversation = ChatConversation.objects.filter(
            participants=user
              ).filter(
        participants__id=other_user_id
         ).distinct().first()

    # if not exists → create
        if not conversation:
            conversation = ChatConversation.objects.create()
            conversation.participants.add(user, other_user_id)

        return Response({
           "conversation_id": str(conversation.id)
          })


# ============== NOTIFICATION VIEWSET ==============

class NotificationViewSet(viewsets.ModelViewSet):
    """Notification management"""
    serializer_class = NotificationSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'is_read']
    ordering = ['-created_at']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread notification count"""
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        return Response({"unread_count": count})

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = datetime.now()
        notification.save()
        return Response({"message": "Notification marked as read"})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True, read_at=datetime.now())
        return Response({"message": "All notifications marked as read"})


# ============== PROJECT & TASK VIEWSETS ==============

class ProjectViewSet(viewsets.ModelViewSet):
    """Project management"""
    queryset = Project.objects.select_related('department', 'project_manager').prefetch_related('team_members')
    serializer_class = ProjectSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'status']
    search_fields = ['name', 'description']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [CanManageProjects]
        else:
            permission_classes = [IsAdminUser | IsManager]
        
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Get all tasks in a project"""
        project = self.get_object()
        tasks = project.tasks.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    """Task management"""
    queryset = Task.objects.select_related('project', 'assigned_to')
    serializer_class = TaskSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project', 'status', 'priority', 'assigned_to']
    search_fields = ['title', 'description']
    ordering = ['due_date']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [CanManageTasks]
        else:
            permission_classes = [IsAdminUser | IsManager]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get tasks assigned to current user"""
        tasks = Task.objects.filter(assigned_to=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update task status"""
        task = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Task.STATUS_CHOICES):
            return Response(
                {"detail": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task.status = new_status
        if new_status == 'completed':
            task.completion_date = datetime.now().date()
        task.save()
        
        serializer = TaskSerializer(task)
        return Response(serializer.data)

from rest_framework.decorators import action
from .ai_services import ask_ai

from rest_framework.viewsets import ViewSet
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .rag_services import create_vector_db, ask_rag
import os
# from .agent_service import agent
from .ml_service import predict_attrition
from .ml_service import predict_attrition, get_feature_importance
from .ml_service import predict_attrition, get_feature_importance

class AIViewSet(ViewSet):
    permission_classes = [AllowAny]
    authentication_classes = []
    def create(self, request):
        question = request.data.get("question")

        if not question:
            return Response({"error": "Question required"}, status=400)

        answer = ask_ai(question, request.user)

        return Response({
            "question": question,
            "answer": answer
        })
import os
import uuid
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
import traceback
class RAGViewSet(ViewSet):
    @action(detail=False, methods=['post'])
    def upload_document(self, request):
        print("entered in the upload document function of RAGViewSet")
        file = request.FILES.get('file')

        if not file:
            return Response(
                {"error": "No file uploaded"},
                status=status.HTTP_400_BAD_REQUEST
            )

        #  Validate file type
        if not file.name.endswith('.pdf'):
            return Response(
                {"error": "Only PDF files are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            #  Unique file name (important)
            file_id = str(uuid.uuid4())
            file_path = f"media/{file_id}_{file.name}"

            os.makedirs("media", exist_ok=True)

            with open(file_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)

            #  Create vector DB
            result = create_vector_db(file_path)
            print("result of upload docs:",result)
            return Response({
                "message": result,
                "file_id": file_id
            })
               
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    @action(detail=False, methods=['post','get'],permission_classes=[AllowAny])
    def query(self, request):
        print("request.data:", request.data)
        print("type:", type(request.data))
        print("entered in the query function of RAGViewSet")
        if isinstance(request.data, dict):
            question = request.data.get("question")
        else:
           return Response(
              {"error": "Invalid request format"},
                status=400
            )
        if request.method == "GET":
            question = request.query_params.get("question")
        else:
            question = request.data.get("question")
        # question = request.data.get("question")
        print("question from frontend:",question)
        if not question:
            return Response(
                {"error": "Question is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            answer = ask_rag(question)
            print("answer from RAG:",answer)
            return Response({
                "question": question,
                "answer": answer
            })
        except Exception as e:
           print(" ERROR:", str(e))
           print(traceback.format_exc())   # THIS IS THE KEY

           return Response(
             {"error": str(e)},
             status=500
             )

class AgentViewSet(ViewSet):
    permission_classes=[AllowAny]
    def create(self, request):
        from .agent_service import agent
        user_input = request.data.get("input")

        result = agent.invoke({
            "input": user_input,
            # "user_id": request.user.id
            "user_id": request.user.id if request.user.is_authenticated else 1
        })

        return Response(result)

class MLViewSet(ViewSet):

    @action(detail=False, methods=['post'])
    def predict(self, request):
        salary = request.data.get("salary")
        years = request.data.get("years")
        performance = request.data.get("performance")

        if not all([salary, years, performance]):
            return Response({"error": "All fields required"}, status=400)

        result = predict_attrition(salary, years, performance)
        return Response(result)


    @action(detail=False, methods=['get'])
    def feature_importance(self, request):
        data = get_feature_importance()
        return Response(data)





