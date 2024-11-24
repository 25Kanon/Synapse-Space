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
    user = User.objects.get(id=user_id)
    user_memberships = Membership.objects.filter(user_id=user_id).values_list('community_id', flat=True)

    user_text = " ".join(user.interests)
    user_embedding = get_embedding(user_text, cache_key=f"user_{user.id}", cache_type="users")

    if user_embedding is None:
        logger.error("User embedding is empty, cannot proceed with content-based filtering.")
        return []

    communities = list(Community.objects.exclude(id__in=user_memberships))
    community_embeddings = [
        get_embedding(community.description, cache_key=f"community_{community.id}", cache_type="communities")
        for community in communities
    ]
    community_embeddings = validate_embeddings(community_embeddings)

    if not community_embeddings:
        logger.error("No valid community embeddings available.")
        return []

    similarities = cosine_similarity([user_embedding], community_embeddings)[0]

    # Generate recommendations with tags
    recommended_communities = []
    for community, similarity in zip(communities, similarities):
        matching_interests = [interest for interest in user.interests if interest.lower() in community.description.lower()]
        reason = f"Matches your interest: {', '.join(matching_interests)}" if matching_interests else "Recommended for you"
        recommended_communities.append((community, similarity, reason))

    # Sort by similarity score
    recommended_communities = sorted(recommended_communities, key=lambda x: x[1], reverse=True)[:5]

    return recommended_communities  # Returns (Community, similarity_score, reason)





def collaborative_filtering(user_id):
    """
    Recommend communities based on memberships of similar users, excluding communities the user is already a member of.
    """
    user_memberships = Membership.objects.filter(user_id=user_id).values_list('community_id', flat=True)

    similar_users = Membership.objects.filter(
        community_id__in=user_memberships
    ).exclude(user_id=user_id).values_list('user_id', flat=True).distinct()

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

    user = User.objects.get(id=user_id)
    user_text = " ".join(user.interests)
    user_embedding = get_embedding(user_text, cache_key=f"user_{user.id}", cache_type="users")

    if user_embedding is None:
        logger.error("User embedding is empty for collaborative filtering.")
        return []

    similarities = cosine_similarity([user_embedding], community_embeddings)[0]

    # Generate recommendations with tags
    recommended_communities = []
    for community, similarity in zip(communities, similarities):
        reason = "Popular among users like you"
        recommended_communities.append((community, similarity, reason))

    # Sort by similarity score
    recommended_communities = sorted(recommended_communities, key=lambda x: x[1], reverse=True)[:5]

    return recommended_communities  # Returns (Community, similarity_score, reason)




def get_hybrid_recommendations(user_id, cbf_weight=0.6, cf_weight=0.4):
    """
    Combine content-based and collaborative filtering recommendations, excluding communities the user is already a member of.
    """
    cbf_recommendations = content_based_recommendation(user_id)
    cf_recommendations = collaborative_filtering(user_id)

    combined_scores = {}
    combined_communities = {}

    for community, score, reason in cbf_recommendations:
        if community.id not in combined_scores:
            combined_scores[community.id] = 0
            combined_communities[community.id] = (community, reason)
        combined_scores[community.id] += score * cbf_weight

    for community, score, reason in cf_recommendations:
        if community.id not in combined_scores:
            combined_scores[community.id] = 0
            combined_communities[community.id] = (community, reason)
        combined_scores[community.id] += score * cf_weight

    sorted_recommendations = sorted(
        combined_scores.items(), key=lambda x: x[1], reverse=True
    )[:5]

    return [(combined_communities[community_id][0], score, combined_communities[community_id][1]) for community_id, score in sorted_recommendations]


def log_hybrid_recommendations(user_id):
    recommendations = get_hybrid_recommendations(user_id)
    logger.info(f"Hybrid Recommendations for User {user_id}: {recommendations}")
    return recommendations
