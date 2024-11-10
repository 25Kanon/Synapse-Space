import os
import sys

import tensorflow as tf
import tensorflow_recommenders as tfrs
from tensorflow.keras import layers
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Set the DJANGO_SETTINGS_MODULE environment variable
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Initialize Django
import django
django.setup()
from ss_api.models import Membership, Community


class CollaborativeFilteringModel(tfrs.Model):
    def __init__(self, user_model, community_model, candidate_ids):
        super().__init__()
        self.user_model = user_model
        self.community_model = community_model

        # Ensure candidates are correctly formatted as a string dataset
        # candidate_ids should be a tf.data.Dataset of strings
        self.candidates = tf.data.Dataset.from_tensor_slices(candidate_ids)  # Create dataset of string IDs
        self.candidates = self.candidates.batch(1)  # Batch size of 1

        # Define the task for retrieval using FactorizedTopK
        self.task = tfrs.tasks.Retrieval(metrics=tfrs.metrics.FactorizedTopK(candidates=self.candidates))

    def compute_loss(self, features: dict, training=False):
        # Generate embeddings for user and community
        user_embeddings = self.user_model(features["user_id"], training=training)
        community_embeddings = self.community_model(features["community_id"], training=training)

        # Compute and return the loss
        return self.task(user_embeddings, community_embeddings)


# Helper function to create embeddings using TensorFlow Recommenders
def create_embedding_layer(vocabulary_size, embedding_dim):
    return tf.keras.Sequential([
        layers.StringLookup(mask_token=None),  # Converts raw string input to integer indices
        layers.Embedding(vocabulary_size, embedding_dim)  # Creates embeddings from integer indices
    ])


def prepare_dataset():
    # Fetch user-community interaction data from Membership model
    user_ids = Membership.objects.values_list('user_id', flat=True)  # List of user IDs
    community_ids = Membership.objects.values_list('community_id', flat=True)  # List of community IDs

    # Convert user and community IDs to strings
    user_ids = [str(user_id) for user_id in user_ids]
    community_ids = [str(community_id) for community_id in community_ids]

    # Convert the data into a TensorFlow dataset
    dataset = tf.data.Dataset.from_tensor_slices({
        "user_id": user_ids,
        "community_id": community_ids
    })

    # Shuffle and batch the dataset for training
    dataset = dataset.shuffle(100_000).batch(32)
    return dataset


def train_collaborative_model():
    # Prepare the dataset
    dataset = prepare_dataset()

    # Create embedding models for users and communities
    user_model = create_embedding_layer(vocabulary_size=10000, embedding_dim=32)  # Adjust size
    community_model = create_embedding_layer(vocabulary_size=5000, embedding_dim=32)  # Adjust size

    # Fetch all community IDs from the database for candidate generation
    community_ids = Community.objects.values_list('id', flat=True)  # List of community IDs
    candidate_ids = [str(id) for id in community_ids]  # Convert IDs to strings for FactorizedTopK

    # Print the first few candidate IDs for verification
    print(f"Candidate IDs: {candidate_ids[:10]}")  # Print the first 10 candidate IDs

    # Initialize the Collaborative Filtering model
    collaborative_model = CollaborativeFilteringModel(user_model, community_model, candidate_ids)

    # Compile the model with an optimizer
    collaborative_model.compile(optimizer=tf.keras.optimizers.Adagrad(0.5))  # Example: You can choose other optimizers

    # Train the model for a specific number of epochs
    collaborative_model.fit(dataset, epochs=3)  # Adjust epochs as needed

    # Optionally, save the trained model
    collaborative_model.save('path_to_save_trained_model')

    print("Training complete!")


# Run the training
# train_collaborative_model()
