from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    # Auth   
    Register, Login, 
    # Viewsets
    RoleViewSet, PermissionViewSet, EmployeeViewSet, DepartmentViewSet,
    PositionViewSet, BonusViewSet, SalaryViewSet, LeaveViewSet, LeaveTypeViewSet,
    PerformanceReviewViewSet, AttendanceViewSet, ChatConversationViewSet,
    NotificationViewSet, ProjectViewSet, TaskViewSet
    ,AIViewSet, RAGViewSet, AgentViewSet, MLViewSet



)

# Create router
router = DefaultRouter()

# Auth & Role Management
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'permissions', PermissionViewSet, basename='permission')

# Employee Management
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'positions', PositionViewSet, basename='position')

# Compensation Management
router.register(r'bonuses', BonusViewSet, basename='bonus')
router.register(r'salaries', SalaryViewSet, basename='salary')

# Leave Management
router.register(r'leave-types', LeaveTypeViewSet, basename='leave-type')
router.register(r'leaves', LeaveViewSet, basename='leave')

# Performance Management
router.register(r'performance-reviews', PerformanceReviewViewSet, basename='performance-review')

# Attendance
router.register(r'attendance', AttendanceViewSet, basename='attendance')

# Communication
router.register(r'chat-conversations', ChatConversationViewSet, basename='chat-conversation')
router.register(r'notifications', NotificationViewSet, basename='notification')

# Project Management
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')

router.register(r'ai-chat', AIViewSet, basename='ai-chat')
router.register(r'rag', RAGViewSet, basename='rag')
router.register(r'ai-agent', AgentViewSet, basename='agent')
router.register(r'ml', MLViewSet, basename='ml')
app_name = 'employee'

urlpatterns = [
    # Authentication
    path('auth/register/', Register, name='register'),
    path('auth/login/', Login, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Routes
    path('', include(router.urls)),
 
]
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
