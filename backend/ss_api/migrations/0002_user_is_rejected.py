# Generated by Django 5.0.8 on 2024-11-16 21:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ss_api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_rejected',
            field=models.BooleanField(default=False),
        ),
    ]
