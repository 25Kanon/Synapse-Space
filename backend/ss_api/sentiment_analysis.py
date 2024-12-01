from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

class SentimentAnalyzer:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("dost-asti/RoBERTa-tl-sentiment-analysis")
        self.model = AutoModelForSequenceClassification.from_pretrained("dost-asti/RoBERTa-tl-sentiment-analysis")

    def analyze(self, text):
        if not text.strip():
            return "neutral"

        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        outputs = self.model(**inputs)
        logits = outputs.logits
        sentiment = torch.argmax(logits, dim=1).item()

        # Fixed sentiment mapping (swapping positive and neutral)
        sentiment_mapping = {0: "negative", 1: "positive", 2: "neutral"}
        return sentiment_mapping.get(sentiment, "neutral")
    