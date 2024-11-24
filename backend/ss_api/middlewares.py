import logging
from django.utils.timezone import now
from ss_api.permissions import CookieJWTAuthentication
# Configure the logger
logger = logging.getLogger(__name__)

class UpdateLastActiveMiddleware:
    """
    Middleware to update the last_active field of authenticated users
    whenever they make a request.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Use CookieJWTAuthentication to authenticate the user
        auth = CookieJWTAuthentication()
        user = None
        
        try:
            user, _ = auth.authenticate(request)  # Authenticate and retrieve user
        except Exception as e:
            logger.error(f"Authentication error in UpdateLastActiveMiddleware: {e}")

        # If the user is authenticated, update last_active
        if user and user.is_authenticated:
            logger.info(f"Authenticated user: {user.username}")
            user.last_active = now()
            user.save(update_fields=["last_active"])
        else:
            logger.info("User is not authenticated.")

        response = self.get_response(request)
        return response