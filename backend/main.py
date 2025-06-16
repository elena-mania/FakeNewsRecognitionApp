import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from scrape_and_clean import scrape_and_clean
import joblib
import asyncio
import sys
from transformers import BertTokenizer, BertForSequenceClassification
import torch

# incarcam  modelele si encoderele
try:
    svm_pipeline = joblib.load('models/best_svm_pipeline.pkl')
    nb_pipeline = joblib.load('models/best_nb_pipeline.pkl')
    label_encoder = joblib.load('models/label_encoder.pkl')
    print("Modelele și codificatorul de etichete au fost încărcate cu succes.")
except FileNotFoundError as e:
    print(f"Eroare la încărcarea fișierelor: {e}")
    sys.exit(1)

try:
    bert_model_path = 'models/fine_tuned_bert_optimized'
    tokenizer = BertTokenizer.from_pretrained(bert_model_path)
    bert_model = BertForSequenceClassification.from_pretrained(bert_model_path)
    bert_model.eval()
    print("Modelul BERT a fost încărcat cu succes.")
except Exception as e:
    print(f"Eroare la încărcarea modelului BERT: {e}")
    sys.exit(1)

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app = FastAPI(debug=True)

# Configurare CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite orice origine pentru dezvoltare
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

# Endpoint pentru predictii
@app.post("/submit-url")
async def submit_url(payload: URLRequest):
    """
    primeste un URL, extrage continutul si returneazs predictiile.
    """
    url = payload.url
    cleaned_content = scrape_and_clean(url)

    if isinstance(cleaned_content, dict) and "error" in cleaned_content:
        return JSONResponse(status_code=400, content={"error": cleaned_content["error"]})

    if not cleaned_content or not cleaned_content.strip():
        return JSONResponse(status_code=400, content={"error": "Nu s-a putut extrage conținut relevant de la URL."})

    try:
        # facem predictiile
        svm_pred_encoded = svm_pipeline.predict([cleaned_content])
        nb_pred_encoded = nb_pipeline.predict([cleaned_content])

        # decodam labelurile in text natural
        svm_prediction_label = label_encoder.inverse_transform(svm_pred_encoded)[0]
        nb_prediction_label = label_encoder.inverse_transform(nb_pred_encoded)[0]

        # predictiile bert
        inputs = tokenizer(cleaned_content, return_tensors="pt", truncation=True, padding=True, max_length=512)
        with torch.no_grad():
            outputs = bert_model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]  # [num_classes]
            predicted_class_id = torch.argmax(probs).item()

        bert_prediction_label = label_encoder.inverse_transform([predicted_class_id])[0]
        bert_probs_dict = {
            label_encoder.inverse_transform([i])[0]: round(probs[i].item(), 4)
            for i in range(len(probs))
        }

        # returneaza un obiect JSON cu un wrapper "data"
        return {
            "data": {
                "svm_prediction": svm_prediction_label,
                "nb_prediction": nb_prediction_label,
                "bert_prediction": bert_prediction_label,
                "bert_probabilities": bert_probs_dict,
                "content": cleaned_content
            }
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"A apărut o eroare în timpul predicției: {str(e)}"})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
