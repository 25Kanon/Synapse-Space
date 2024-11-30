from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import User, Community, Membership
from .recommender import embedding_cache

@receiver(post_save, sender=User)
@receiver(post_save, sender=Community)
@receiver(post_save, sender=Membership)
@receiver(post_delete, sender=User)
@receiver(post_delete, sender=Community)
@receiver(post_delete, sender=Membership)
def invalidate_cache(sender, instance, **kwargs):
    """
    Invalidate the embedding cache when a User, Community, or Membership is modified or deleted.
    """

    if isinstance(instance, User):
        # Remove the cached embedding for the specific user
        print(f"Invalidating user embedding for user {instance.id}")
        embedding_cache["users"].pop(f"user_{instance.id}", None)
    elif isinstance(instance, Community):
        # Remove the cached embedding for the specific community
        print(f"Invalidating community embedding for community {instance.id}")
        embedding_cache["communities"].pop(f"community_{instance.id}", None)
    elif isinstance(instance, Membership):
        # Clear all user-related community embeddings when membership changes
        print(f"Invalidating user embeddings for user {instance.user_id}")
        embedding_cache["users"].clear()
        embedding_cache["communities"].clear()
