from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import User, Community, Membership, Post, CommunityActivity
from .recommender import embedding_cache

@receiver(post_save, sender=User)
@receiver(post_save, sender=Community)
@receiver(post_save, sender=Membership)
@receiver(post_save, sender=Post)
@receiver(post_save, sender=CommunityActivity)
@receiver(post_delete, sender=User)
@receiver(post_delete, sender=Community)
@receiver(post_delete, sender=Membership)
@receiver(post_delete, sender=Post)
@receiver(post_delete, sender=CommunityActivity)
def invalidate_cache(sender, instance, **kwargs):
    """
    Invalidate the embedding cache when a User, Community, Membership, Post, or CommunityActivity is modified or deleted.
    """
    if isinstance(instance, User):
        # Remove the cached embedding for the specific user
        print(f"Invalidating user embedding for user {instance.id}")
        embedding_cache["users"].pop(f"user_{instance.id}", None)
        embedding_cache["users"].pop(f"user_activity_{instance.id}", None)
    elif isinstance(instance, Community):
        # Remove the cached embedding for the specific community
        print(f"Invalidating community embedding for community {instance.id}")
        embedding_cache["communities"].pop(f"community_{instance.id}", None)
    elif isinstance(instance, Membership):
        # Clear all user-related community embeddings when membership changes
        print(f"Invalidating user embeddings for user {instance.user_id}")
        embedding_cache["users"].clear()
        embedding_cache["communities"].clear()
    elif isinstance(instance, Post):
        # Remove the cached embedding for the specific post
        print(f"Invalidating post embedding for post {instance.id}")
        embedding_cache["posts"].pop(f"post_{instance.id}", None)
    elif isinstance(instance, CommunityActivity):
        # Remove the cached embedding for the specific activity
        print(f"Invalidating activity embedding for activity {instance.id}")
        embedding_cache["activities"].pop(f"activity_{instance.id}", None)