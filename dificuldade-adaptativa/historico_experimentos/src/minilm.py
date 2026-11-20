import os

from sklearn.base import BaseEstimator, TransformerMixin


class MiniLMEncoder(TransformerMixin, BaseEstimator):
    def __init__(self, checkpoint, revision, batch_size=16, max_length=128):
        self.checkpoint = checkpoint
        self.revision = revision
        self.batch_size = batch_size
        self.max_length = max_length

    def fit(self, texts, y=None):
        return self

    def __getstate__(self):
        return {key: value for key, value in vars(self).items() if key not in ("model", "tokenizer")}

    def transform(self, texts):
        import numpy as np
        import torch
        from transformers import AutoModel, AutoTokenizer

        if not hasattr(self, "model"):
            torch.set_num_threads(min(4, os.cpu_count() or 1))
            self.tokenizer = AutoTokenizer.from_pretrained(self.checkpoint, revision=self.revision)
            self.model = AutoModel.from_pretrained(self.checkpoint, revision=self.revision).eval()
        embeddings = []
        with torch.inference_mode():
            for start in range(0, len(texts), self.batch_size):
                batch = self.tokenizer(texts[start:start + self.batch_size], padding=True,
                                       truncation=True, max_length=self.max_length, return_tensors="pt")
                hidden = self.model(**batch).last_hidden_state
                mask = batch["attention_mask"].unsqueeze(-1)
                embeddings.append(((hidden * mask).sum(1) / mask.sum(1).clamp(min=1)).numpy())
        return np.concatenate(embeddings)
