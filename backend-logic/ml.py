import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import AutoTokenizer, CamembertTokenizer
MODEL_PATH = "./roberta"
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
except ValueError:
    # Fallback to the specific class if AutoTokenizer struggles
    tokenizer = CamembertTokenizer.from_pretrained(MODEL_PATH)


model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()
print("Model Loaded.")


#MAIN FUNCTION
def analyze_text(text: str):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=256
    )
# Force use_fast=False and add trust_remote_code=True

    with torch.no_grad():
        outputs = model(**inputs)

    probabilities = F.softmax(outputs.logits, dim=1)

    max_prob, pred = torch.max(probabilities, dim=1)

    confidence_score = max_prob.item()
    predicted_class_id = pred.item()

    label = "FAKE NEWS" if predicted_class_id == 0 else "REAL NEWS"

    return {
        "verdict": label,
        "confidence": f"{confidence_score * 100:.1f}%",
        "raw_score": confidence_score
    }