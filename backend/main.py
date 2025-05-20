import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from scrape_and_clean import scrape_and_clean
import joblib
import numpy as np
import asyncio
import sys

# Windows-specific event loop policy
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Load the vectorizer and models
vectorizer = joblib.load("models/vectorizer.pkl")
svm_model = joblib.load("models/modelSVM.pkl")
nb_model = joblib.load("models/modelNB.pkl")

app = FastAPI(debug=True)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Allow frontend (Vite dev server)
    "http://localhost:3000",  # Common React dev server
    "http://127.0.0.1:5173",  # Alternative localhost
    "http://127.0.0.1:3000",  # Alternative localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Explicitly list allowed methods
    allow_headers=["*"],  # Allow all headers
)

# Pydantic model to receive the data
class URLRequest(BaseModel):
    url: str

@app.post("/submit-url")
async def submit_url(payload: URLRequest):
    url = payload.url
    result = scrape_and_clean(url)

    # Check for scraping error
    if "error" in result:
        return JSONResponse(status_code=400, content={"error": result["error"]})

    content = result["content"]
    
    # Transform the text using the vectorizer
    content_vectorized = vectorizer.transform([content])

    # Make predictions
    svm_prediction = int(svm_model.predict(content_vectorized)[0])
    nb_prediction = int(nb_model.predict(content_vectorized)[0])

    return {
        "data": {
            "svm_prediction": svm_prediction,
            "nb_prediction": nb_prediction,
            "content": content
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
