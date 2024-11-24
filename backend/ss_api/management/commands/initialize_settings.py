from django.core.management.base import BaseCommand
from ...models import SystemSetting

class Command(BaseCommand):
    help = "Initialize default system settings"

    def handle(self, *args, **kwargs):
        default_settings = {
            "MAX_LOGIN_ATTEMPTS": "3",
            "LOCKOUT_DURATION": "600", # In seconds
            "OTP_RATE_LIMIT": "60", # In seconds
            "OTP_INTERVAL": "300", # In seconds
        }

        for key, value in default_settings.items():
            setting, created = SystemSetting.objects.get_or_create(key=key, defaults={"value": value})
            if created:
                self.stdout.write(f"Created setting {key}")
            else:
                self.stdout.write(f"Setting {key} already exists")
