import logging
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from django.db.models import Q
import numpy as np
from .models import Community, User, Membership

# Initialize the SentenceTransformer model
model = SentenceTransformer('sentence-transformers/paraphrase-MiniLM-L12-v2')
logger = logging.getLogger(__name__)

# Cache for embeddings to optimize performance
embedding_cache = {"users": {}, "communities": {}}


def get_embedding(text, cache_key=None, cache_type=""):
    """
    Generate or retrieve cached embeddings for text.
    """
    if cache_key and cache_type in embedding_cache and cache_key in embedding_cache[cache_type]:
        return embedding_cache[cache_type][cache_key]

    # Generate embedding
    if text.strip():
        embedding = model.encode(text, convert_to_tensor=True).cpu().numpy()
    else:
        logger.error(f"Empty text provided for {cache_type}, skipping embedding generation.")
        return None

    # Cache the result
    if cache_key:
        embedding_cache[cache_type][cache_key] = embedding

    return embedding


def validate_embeddings(embeddings):
    """
    Filter out empty or invalid embeddings.
    """
    return [embedding for embedding in embeddings if embedding is not None and len(embedding) > 0]


# Content-Based Filtering
def content_based_recommendation(user_id):
    """
    Recommend communities based on the user's interests only, excluding communities the user is already a member of.
    """
    # Fetch the user profile
    user = User.objects.get(id=user_id)

    # Get communities the user is already a member of
    user_memberships = Membership.objects.filter(user_id=user_id).values_list('community_id', flat=True)

    # Use only the user's interests for generating the profile embedding
    user_text = " ".join(user.interests)  # Combine all interests into a single string

    # Generate the user's embedding
    user_embedding = get_embedding(user_text, cache_key=f"user_{user.id}", cache_type="users")

    if user_embedding is None:
        logger.error("User embedding is empty, cannot proceed with content-based filtering.")
        return []

    # Get all communities excluding those the user is already a member of
    communities = list(Community.objects.exclude(id__in=user_memberships))
    community_embeddings = [
        get_embedding(community.description, cache_key=f"community_{community.id}", cache_type="communities")
        for community in communities
    ]
    community_embeddings = validate_embeddings(community_embeddings)

    if not community_embeddings:
        logger.error("No valid community embeddings available.")
        return []

    # Compute cosine similarity between the user's embedding and community embeddings
    similarities = cosine_similarity([user_embedding], community_embeddings)[0]

    # Sort communities by similarity
    recommended_communities = sorted(
        zip(communities, similarities), key=lambda x: x[1], reverse=True
    )[:5]

    return recommended_communities  # Returns a list of (Community, similarity_score)




def collaborative_filtering(user_id):
    """
    Recommend communities based on memberships of similar users, excluding communities the user is already a member of.
    """
    # Fetch communities the user is already a member of
    user_memberships = Membership.objects.filter(user_id=user_id).values_list('community_id', flat=True)

    # Find users with overlapping memberships
    similar_users = Membership.objects.filter(
        community_id__in=user_memberships
    ).exclude(user_id=user_id).values_list('user_id', flat=True).distinct()

    # Get communities from similar users, excluding those the user is already a member of
    similar_user_memberships = Membership.objects.filter(
        user_id__in=similar_users
    ).values_list('community_id', flat=True).distinct()

    communities = Community.objects.filter(id__in=similar_user_memberships).exclude(id__in=user_memberships)
    community_embeddings = [
        get_embedding(community.description, cache_key=f"community_{community.id}", cache_type="communities")
        for community in communities
    ]
    community_embeddings = validate_embeddings(community_embeddings)

    if not community_embeddings:
        logger.error("No valid community embeddings for collaborative filtering.")
        return []

    # Get user embedding
    user = User.objects.get(id=user_id)
    user_text = " ".join(user.interests)  # Use only interests for embeddings
    user_embedding = get_embedding(user_text, cache_key=f"user_{user.id}", cache_type="users")

    if user_embedding is None:
        logger.error("User embedding is empty for collaborative filtering.")
        return []

    # Compute cosine similarity
    similarities = cosine_similarity([user_embedding], community_embeddings)[0]

    # Sort communities by similarity
    recommended_communities = sorted(
        zip(communities, similarities), key=lambda x: x[1], reverse=True
    )[:5]

    return recommended_communities  # Returns list of (Community, similarity_score)



def get_hybrid_recommendations(user_id, cbf_weight=0.6, cf_weight=0.4):
    cbf_recommendations = content_based_recommendation(user_id)
    cf_recommendations = collaborative_filtering(user_id)

    combined_scores = {}
    combined_communities = {}

    for community, score in cbf_recommendations:
        if community.id not in combined_scores:
            combined_scores[community.id] = 0
            combined_communities[community.id] = community
        combined_scores[community.id] += score * cbf_weight

    for community, score in cf_recommendations:
        if community.id not in combined_scores:
            combined_scores[community.id] = 0
            combined_communities[community.id] = community
        combined_scores[community.id] += score * cf_weight

    sorted_recommendations = sorted(
        combined_scores.items(), key=lambda x: x[1], reverse=True
    )[:5]

    return [(combined_communities[community_id], score) for community_id, score in sorted_recommendations]

def log_hybrid_recommendations(user_id):
    recommendations = get_hybrid_recommendations(user_id)
    logger.info(f"Hybrid Recommendations for User {user_id}: {recommendations}")
    return recommendations
