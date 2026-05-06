from django.apps import AppConfig


class EmployeeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'employee'
    verbose_name = 'Employee Management'

    def ready(self):
        """Register signals when app is ready"""
        import employee.signals  # noqa