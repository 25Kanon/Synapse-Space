# Generated by Django 5.0.2 on 2024-11-25 01:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ss_api', '0011_feedback'),
    ]

    operations = [
        migrations.CreateModel(
            name='SystemSetting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=100, unique=True)),
                ('value', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
            ],
        ),
    ]