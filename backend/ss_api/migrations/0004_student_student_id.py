# Generated by Django 5.0.8 on 2024-08-31 14:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ss_api', '0003_alter_student_interests'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='student_id',
            field=models.IntegerField(blank=True, null=True, unique=True),
        ),
    ]
