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


def get_embedding(text, cache_key=None, cache_type="", force_update=False):
    """
    Generate or retrieve cached embeddings for text.
    Automatically refreshes the cache if the data changes or force_update is True.
    """
    # Check if the cache exists and force_update is False
    if cache_key and cache_type in embedding_cache:
        cached_value = embedding_cache[cache_type].get(cache_key)
        if cached_value is not None and not force_update:
            return cached_value

    # Generate a new embedding
    if text.strip():
        embedding = model.encode(text, convert_to_tensor=True).cpu().numpy()
    else:
        logger.error(f"Empty text provided for {cache_type}, skipping embedding generation.")
        return None

    # Update the cache
    if cache_key:
        if cache_type not in embedding_cache:
            embedding_cache[cache_type] = {}
        embedding_cache[cache_type][cache_key] = embedding

    return embedding



#validate embeddings
def validate_embeddings(embeddings):
    """
    Filter out empty or invalid embeddings.
    """
    valid_embeddings = []
    for embedding in embeddings:
        if embedding is not None and isinstance(embedding, np.ndarray) and embedding.size > 0:
            valid_embeddings.append(embedding)
    return valid_embeddings


# Content-Based Filtering
def content_based_recommendation(user_id, score_threshold=0.3):
    """
    Recommend communities based on the user's interests only, excluding communities the user is already a member of.
    Only recommend communities with a similarity score above the threshold.
    """
    user = User.objects.get(id=user_id)
    user_memberships = Membership.objects.filter(user_id=user_id).values_list('community_id', flat=True)

    user_text = " ".join(user.interests)
    user_embedding = get_embedding(user_text, cache_key=f"user_{user.id}", cache_type="users")

    if user_embedding is None:
        logger.error("User embedding is empty, cannot proceed with content-based filtering.")
        return []

    communities = list(Community.objects.exclude(id__in=user_memberships))

    # Create a combined field for the embedding: name, description, and keywords
    community_embeddings = [
        get_embedding(
            f"{community.name} {community.keyword}",
            cache_key=f"community_{community.id}",
            cache_type="communities"
        )
        for community in communities
    ]
    community_embeddings = validate_embeddings(community_embeddings)

    if not community_embeddings:
        logger.error("No valid community embeddings available.")
        return []

    similarities = cosine_similarity([user_embedding], community_embeddings)[0]

    # Filter communities based on the similarity score threshold
    recommended_communities = []
    for community, similarity in zip(communities, similarities):
        if similarity >= score_threshold:  # Only include communities above the threshold
            combined_text = f"{community.name} {community.keyword}".lower()
            matching_interests = [interest for interest in user.interests if interest.lower() in combined_text]
            reason = f"Matches your interest: {', '.join(matching_interests)}" if matching_interests else "Recommended for you"
            recommended_communities.append((community, similarity, reason))

    # Sort by similarity score
    recommended_communities = sorted(recommended_communities, key=lambda x: x[1], reverse=True)

    print('cbf', recommended_communities)
    return recommended_communities  # Returns (Community, similarity_score, reason)


def collaborative_filtering(user_id, score_threshold=0.3):
    """
    Recommend communities based on memberships of similar users, excluding communities the user is already a member of.
    Only recommend communities with a popularity score above the threshold.
    """
    user_memberships = Membership.objects.filter(user_id=user_id).values_list('community_id', flat=True)

    # Find similar users based on overlapping community memberships
    similar_users = Membership.objects.filter(
        community_id__in=user_memberships
    ).exclude(user_id=user_id).values_list('user_id', flat=True).distinct()

    # Get communities that similar users are members of but exclude current user's communities
    similar_user_memberships = Membership.objects.filter(
        user_id__in=similar_users
    ).values_list('community_id', flat=True).distinct()

    communities = Community.objects.filter(id__in=similar_user_memberships).exclude(id__in=user_memberships)

    if not communities.exists():
        logger.warning("No communities found for collaborative filtering.")
        return []

    # Rank communities by popularity (number of similar users who joined)
    community_popularity = {
        community.id: Membership.objects.filter(community_id=community.id).count()
        for community in communities
    }

    # Filter communities based on popularity score threshold
    recommended_communities = []
    for community in communities:
        popularity_score = community_popularity.get(community.id, 0)
        if popularity_score >= score_threshold * len(similar_users):  # Scale threshold by user base
            reason = "Popular among users like you"
            recommended_communities.append((community, popularity_score, reason))

    # Sort by popularity score
    recommended_communities = sorted(recommended_communities, key=lambda x: x[1], reverse=True)

    print('cf', recommended_communities)
    return recommended_communities  # Returns (Community, popularity_score, reason)


def normalize_scores(scores):
    """
    Normalize a list of scores to the range [0, 1].
    """
    if not scores:
        return []
    min_score = min(scores)
    max_score = max(scores)
    if max_score == min_score:
        # Avoid division by zero
        return [1 for _ in scores]
    return [(score - min_score) / (max_score - min_score) for score in scores]


def get_hybrid_recommendations(user_id, cbf_weight=0.6, cf_weight=0.4, score_threshold=0.3):
    """
    Combine content-based and collaborative filtering recommendations, excluding communities the user is already a member of.
    Normalize the scores from both methods and filter by a similarity/popularity threshold.
    """
    # Get recommendations
    cbf_recommendations = content_based_recommendation(user_id, score_threshold=score_threshold)
    cf_recommendations = collaborative_filtering(user_id, score_threshold=score_threshold)

    # Extract scores for normalization
    cbf_scores = [score for _, score, _ in cbf_recommendations]
    cf_scores = [score for _, score, _ in cf_recommendations]

    # Normalize the scores within their own range
    normalized_cbf_scores = normalize_scores(cbf_scores)
    normalized_cf_scores = normalize_scores(cf_scores)

    # Map normalized scores back to their respective recommendations
    normalized_cbf = [
        (community, score, reason)
        for (community, _, reason), score in zip(cbf_recommendations, normalized_cbf_scores)
    ]
    normalized_cf = [
        (community, score, reason)
        for (community, _, reason), score in zip(cf_recommendations, normalized_cf_scores)
    ]

    # Combine the normalized scores
    combined_scores = {}
    combined_communities = {}

    for community, score, reason in normalized_cbf:
        if community.id not in combined_scores:
            combined_scores[community.id] = 0
            combined_communities[community.id] = (community, reason)
        combined_scores[community.id] += score * cbf_weight

    for community, score, reason in normalized_cf:
        if community.id not in combined_scores:
            combined_scores[community.id] = 0
            combined_communities[community.id] = (community, reason)
        combined_scores[community.id] += score * cf_weight

    # Filter by final score threshold
    filtered_recommendations = [
        (combined_communities[community_id][0], score, combined_communities[community_id][1])
        for community_id, score in combined_scores.items() if score >= score_threshold
    ]

    # Sort combined recommendations
    sorted_recommendations = sorted(filtered_recommendations, key=lambda x: x[1], reverse=True)

    return sorted_recommendations


def log_hybrid_recommendations(user_id):
    recommendations = get_hybrid_recommendations(user_id)
    logger.info(f"Hybrid Recommendations for User {user_id}: {recommendations}")
    return recommendations


