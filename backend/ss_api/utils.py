# utils/moderation.py

from .models import ModeratorSettings

def check_banned_words(text, community_id):
    """
    Check if the provided text contains any banned words for the given community.

    :param text: Plain text from the post.
    :param community_id: ID of the community to get the banned words list.
    :return: A list of banned words found in the text.
    """
    try:
        mod_settings = ModeratorSettings.objects.get(community_id=community_id)
        banned_words = mod_settings.banned_words
    except ModeratorSettings.DoesNotExist:
        banned_words = []

    found_banned_words = [word for word in banned_words if word.lower() in text.lower()]
    return found_banned_words
