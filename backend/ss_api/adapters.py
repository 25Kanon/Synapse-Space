from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialAccount
from django.core.exceptions import ValidationError

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        """
        Overrides the save_user method to ensure that custom fields are populated
        during Google login, associate the user with a SocialAccount, and
        validate that the user's email belongs to the 'tip.edu.ph' domain.
        """
        user = sociallogin.user

        # Only populate fields if this is a new user (i.e., they do not yet have a primary key)
        if not user.pk:
            # Populate custom fields from the Google response
            extra_data = sociallogin.account.extra_data

            user.email = extra_data.get('email', user.email)
            user.first_name = extra_data.get('given_name', user.first_name)
            user.last_name = extra_data.get('family_name', user.last_name)
            user.username = extra_data.get('name', user.username)
            user.profile_pic = extra_data.get('picture', user.profile_pic)
            user.is_google = True

            # Check if the email domain is 'tip.edu.ph'
            if not self.is_valid_email_domain(user.email):
                raise ValidationError("Only emails from the domain 'tip.edu.ph' are allowed.")

            # Save the user instance before proceeding to associate it with the SocialAccount
            user.save()

        # Ensure the user is associated with a SocialAccount
        if not SocialAccount.objects.filter(user=user, provider=sociallogin.account.provider).exists():
            social_account = sociallogin.account
            social_account.user = user
            social_account.save()

        return user

    def is_valid_email_domain(self, email):
        """
        Checks if the email belongs to the domain 'tip.edu.ph'.
        """
        domain = email.split('@')[-1]
        return domain == 'tip.edu.ph'

