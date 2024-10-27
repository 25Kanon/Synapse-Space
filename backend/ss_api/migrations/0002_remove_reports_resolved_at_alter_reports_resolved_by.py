# Generated by Django 5.0.8 on 2024-10-25 19:53

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ss_api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reports',
            name='resolved_at',
        ),
        migrations.AlterField(
            model_name='reports',
            name='resolved_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='resolved_reports', to=settings.AUTH_USER_MODEL),
        ),
    ]
