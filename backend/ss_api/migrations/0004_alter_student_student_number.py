# Generated by Django 5.0.8 on 2024-09-08 16:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ss_api', '0003_alter_student_student_number'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='student_number',
            field=models.IntegerField(unique=True),
        ),
    ]
