# Generated by Django 5.0.2 on 2024-11-19 00:42

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ss_api', '0006_user_last_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='community',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]