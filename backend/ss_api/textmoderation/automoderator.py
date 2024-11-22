import os
import torch
from django.core.cache import cache
from transformers import AutoTokenizer, AutoModelForSequenceClassification

class AutoModerator:
    def __init__(self, model_name="ggpt1006/tl-hatespeech-detection", cache_dir="./models"):
        """
        Initializes the AutoModerator class.
        - Loads the tokenizer and model for hate speech detection.
        - Caches the model and tokenizer to the specified directory.
        
        :param model_name: Hugging Face model name
        :param cache_dir: Directory to store the cached model
        """
        self.model_name = model_name
        self.cache_dir = cache_dir

        try:
            # Load and cache the tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, cache_dir=self.cache_dir)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name, cache_dir=self.cache_dir)
        except Exception as e:
            raise RuntimeError(f"Failed to load model or tokenizer: {e}")

    def is_malicious(self, text):
        """
        Checks if the provided text is malicious using the loaded model.
        
        :param text: Text to analyze
        :return: True if the text contains hate speech, False otherwise
        """
        if not text or not isinstance(text, str):
            raise ValueError("Input text must be a non-empty string.")

        # Tokenize the input text
        try:
            inputs = self.tokenizer(text, return_tensors="pt")
        except Exception as e:
            raise RuntimeError(f"Failed to tokenize text: {e}")

        # Perform inference
        try:
            with torch.no_grad():
                outputs = self.model(**inputs)

            # Get the predicted class
            predicted_class = torch.argmax(outputs.logits, dim=1).item()

            # Class 1 indicates hate speech, 0 indicates non-hate speech
            return predicted_class == 1
        except Exception as e:
            raise RuntimeError(f"Failed during model inference: {e}")
