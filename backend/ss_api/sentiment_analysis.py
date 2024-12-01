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

        sentiment_mapping = {0: "negative", 1: "neutral", 2: "positive"}
        return sentiment_mapping.get(sentiment, "neutral")
