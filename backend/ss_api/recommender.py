import logging
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from .models import Community, User, Membership

# Initialize the fine-tuned RoBERTa model and tokenizer
tokenizer = AutoTokenizer.from_pretrained('xlm-roberta-large-finetuned-conll03-english')
model = AutoModelForSequenceClassification.from_pretrained('xlm-roberta-large-finetuned-conll03-english', output_hidden_states=True)
logger = logging.getLogger(__name__)

# Generate embeddings for text using a fine-tuned RoBERTa model
def get_roberta_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)

    # Check if hidden states are returned
    if outputs.hidden_states is None:
        logger.error("No hidden states returned from model.")
        return None  # or raise an exception depending on your use case

    # Get the last hidden state (from the last layer)
    last_hidden_state = outputs.hidden_states[-1]

    # Average the token embeddings to get the sentence embedding
    sentence_embedding = last_hidden_state.mean(dim=1).cpu().numpy()  # (1, embedding_size)

    return sentence_embedding

# Content-Based Filtering: Recommend communities based on RoBERTa embeddings with similarity scores
def content_based_recommendation(user_profile):
    # Get user interests and bio for profiling
    user = User.objects.get(id=user_profile)
    user_text = " ".join(user.interests) + " " + (user.bio if user.bio else "")
    user_embedding = get_roberta_embedding(user_text)

    if user_embedding is None:
        return []  # Handle case where embedding could not be generated

    # Get all communities and compute embeddings for them
    communities = list(Community.objects.all())  # Convert the QuerySet to a list
    community_embeddings = []
    for community in communities:
        community_embeddings.append(get_roberta_embedding(community.description))

    # Compute cosine similarity between user profile and community descriptions
    similarities = cosine_similarity(user_embedding, np.array(community_embeddings).reshape(len(community_embeddings), -1))

    # Get the top N recommended community indices
    recommended_community_indices = np.argsort(similarities[0])[-5:][::-1]  # Get top 5 communities sorted by similarity

    # Use the indices to fetch communities and their similarity scores
    recommended_communities = [(communities[i], similarities[0][i]) for i in recommended_community_indices]

    return recommended_communities


# Collaborative Filtering: Recommend communities using RoBERTa embeddings with similarity scores
def collaborative_filtering(user_id):
    # Get all memberships to create user-community pairs
    memberships = Membership.objects.all()

    # Create a list of (user_id, community_id) pairs
    user_community_pairs = [(str(membership.user.id), str(membership.community.id)) for membership in memberships]

    logger.error("User-Community Pairs: %s", user_community_pairs)  # Debug print

    # Get all unique user and community IDs
    user_ids = list(set(pair[0] for pair in user_community_pairs))  # Unique user IDs
    community_ids = list(set(pair[1] for pair in user_community_pairs))  # Unique community IDs

    # Get user embedding
    user = User.objects.get(id=user_id)
    user_text = " ".join(user.interests) + " " + (user.bio if user.bio else "")
    user_embedding = get_roberta_embedding(user_text)

    if user_embedding is None:
        return []  # Handle case where embedding could not be generated

    # Get community embeddings
    communities = list(Community.objects.all())
    community_embeddings = []
    for community in communities:
        community_embeddings.append(get_roberta_embedding(community.description))

    # Compute cosine similarity between user profile and community descriptions
    similarities = cosine_similarity(user_embedding, np.array(community_embeddings).reshape(len(community_embeddings), -1))

    # Get the top N recommended community indices
    recommended_community_indices = np.argsort(similarities[0])[-5:][::-1]  # Top 5

    # Use the indices to fetch communities and their similarity scores
    recommended_communities = [(communities[i], similarities[0][i]) for i in recommended_community_indices]

    return recommended_communities


# Hybrid recommendation function: Combine CBF and CF recommendations with similarity scores
def get_hybrid_recommendations(user_profile):
    logger.error("Getting hybrid recommendations...")  # Debug print

    # Get recommendations using content-based filtering
    cbf_recommendations = content_based_recommendation(user_profile)

    # Get recommendations using collaborative filtering
    cf_recommendations = collaborative_filtering(user_profile)

    # Combine both recommendations (deduplicate and limit to top 5)
    combined_recommendations = {community: score for community, score in cbf_recommendations + cf_recommendations}

    # Sort communities by the highest similarity score
    sorted_combined_recommendations = sorted(combined_recommendations.items(), key=lambda x: x[1], reverse=True)[:5]

    logger.error("Hybrid recommendations with scores: %s", sorted_combined_recommendations)  # Debug print

    # Return community IDs and similarity scores instead of community objects
    final_recommendations = [(community, score) for community, score in sorted_combined_recommendations]
    return final_recommendations
