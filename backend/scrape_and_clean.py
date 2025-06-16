import requests
from bs4 import BeautifulSoup
import re
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def clean_for_ml(text: str) -> str:
    if not isinstance(text, str):
        return ""
    # normalizam textul
    text = text.lower()
    # scoatem toate caracterele in afara de litere diacritice si cratimi
    text = re.sub(r"[^\w\săâîșț-]", "", text, flags=re.UNICODE)
    # inlocuim caracterele albe cu un singur spatiu
    text = re.sub(r"\s+", " ", text).strip()
    return text

def scrape_and_clean(url: str):
    """
    Scrapes content from a URL, cleans it to match the ML model's training
    data preprocessing, and returns the cleaned text or an error dictionary.
    """
    logging.info(f"Attempting to scrape URL: {url}")
    try:
        # Setam un agent user ca sa imitam un browser care poate ajuta impotriva masurilor anti scraping
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        # timeout sa prevenim asteptatul interminabil
        page = requests.get(url, headers=headers, timeout=10)
        # asta cauzeaza HTTPerror daca requestul returneaza un cod de fail
        page.raise_for_status()

    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch or access URL {url}. Error: {e}")
        return {"error": f"Failed to retrieve content from the URL. It may be down, or access is forbidden. Error: {e}"}

    try:
        soup = BeautifulSoup(page.text, 'html.parser')

        # extragem tot ce gasim intre <p> si concatenam cu spatiu
        raw_text = " ".join([p.get_text(strip=True) for p in soup.find_all('p')])

        if not raw_text.strip():
            logging.warning(f"No paragraph (<p>) content was found on {url}.")
            return {"error": "No readable paragraph content was found on the page."}

        cleaned_text = clean_for_ml(raw_text)
        logging.info(f"Successfully scraped and cleaned content from {url}.")
        return cleaned_text

    except Exception as e:
        logging.error(f"An error occurred during parsing or cleaning for URL {url}. Error: {e}")
        return {"error": f"An error occurred during content processing: {e}"}
