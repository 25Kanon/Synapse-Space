# utils.py (or recommendation/utils.py)

from transformers import RobertaTokenizer, RobertaModel
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Load pre-trained RoBERTa model and tokenizer
tokenizer = RobertaTokenizer.from_pretrained('roberta-large')
model = RobertaModel.from_pretrained('roberta-large')


def get_community_embeddings(description: str) -> torch.Tensor:
    """
    Generate a community embedding based on the community description.

    Args:
        description (str): The community description text.

    Returns:
        torch.Tensor: The embedding for the community description.
    """
    # Tokenize the community description and get the corresponding embedding
    inputs = tokenizer(description, return_tensors='pt', padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)

    # Get the average of the token embeddings (mean across tokens in the sentence)
    embeddings = outputs.last_hidden_state.mean(dim=1)
    return embeddings


def get_user_embedding(user_interests: list) -> torch.Tensor:
    """
    Generates a user embedding by averaging the embeddings of their interests.

    Args:
        user_interests (list of str): List of user interests as strings.

    Returns:
        torch.Tensor: Averaged embedding of the user's interests.
    """
    interest_embeddings = []

    for interest in user_interests:
        # Tokenize each interest and get the corresponding embedding
        inputs = tokenizer(interest, return_tensors='pt', padding=True, truncation=True)
        with torch.no_grad():
            outputs = model(**inputs)

        # Get the embedding for the [CLS] token (or average of all tokens)
        embeddings = outputs.last_hidden_state.mean(dim=1)
        interest_embeddings.append(embeddings)

    # If there are any embeddings, average them to get the final user embedding
    if interest_embeddings:
        user_embedding = torch.stack(interest_embeddings).mean(dim=0)
        return user_embedding
    else:
        # Return a zero tensor if the user has no interests
        return torch.zeros(model.config.hidden_size)


def rank_communities_by_similarity(user_embedding: torch.Tensor, community_embeddings: list) -> list:
    """
    Rank communities based on the cosine similarity between the user embedding and community embeddings.

    Args:
        user_embedding (torch.Tensor): The embedding for the user's interests.
        community_embeddings (list of tuples): List of (community_id, community_embedding) tuples.

    Returns:
        list: A sorted list of community IDs based on similarity to the user.
    """
    similarities = []

    for community_id, community_embedding in community_embeddings:
        # Compute cosine similarity between user embedding and community embedding
        cosine_sim = cosine_similarity(user_embedding.numpy().reshape(1, -1),
                                       community_embedding.numpy().reshape(1, -1))
        similarities.append((community_id, cosine_sim[0][0]))

    # Sort communities based on similarity scores in descending order
    ranked_communities = sorted(similarities, key=lambda x: x[1], reverse=True)

    # Return the sorted community IDs
    return ranked_communities


def get_content_based_recommendations(user) -> list:
    """
    Generate content-based recommendations based on the user's interests and the community descriptions.

    Args:
        user (User): The current user object.

    Returns:
        list: A list of recommended community IDs based on content-based filtering.
    """
    # Fetch community descriptions and generate embeddings for them
    communities = Community.objects.all()
    community_embeddings = []

    for community in communities:
        description = community.description
        embedding = get_community_embeddings(description)  # From RoBERTa
        community_embeddings.append((community.id, embedding))

    # Get the user embedding based on their interests
    user_embedding = get_user_embedding(user.interests)

    # Rank communities based on cosine similarity to the user's embedding
    ranked_communities = rank_communities_by_similarity(user_embedding, community_embeddings)

    # Return the top N community IDs as recommendations (e.g., top 5)
    top_communities = [community_id for community_id, _ in ranked_communities[:5]]
    return top_communities