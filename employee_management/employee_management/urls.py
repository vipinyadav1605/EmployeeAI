from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
urlpatterns = [
    path('', lambda request: HttpResponse("Welcome to Employee Management API ")),

    path('admin/', admin.site.urls),
    path('api/', include('employee.urls')),  
]