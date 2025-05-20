import requests
from bs4 import BeautifulSoup
import re
import logging

logging.basicConfig(level=logging.DEBUG)

def scrape_and_clean(url):
    logging.debug(f"Scraping URL: {url}")

    try:
        page = requests.get(url)# face request la acest url si primeste raspuns
        # in functie de raspunsuri afisam in front daca a mers sau n a mers si de ce n a mers
        if page.status_code != 200:
            #logging.error(f"Failed to fetch page. Status Code: {page.status_code}")
            return {"error": f"Failed to fetch page. Status Code: {page.status_code}"}

        soup = BeautifulSoup(page.text, 'html.parser') #cu page preluam html ul raw, tagu e cum il parsam=> adica intr un formal html
        soup.prettify() # afiseaza html ul frumos formatat

        #formatam paragrafele sub tiparul datelor
        paragraph = " ".join([p.text.strip() for p in soup.find_all('p')])
        paragraph = paragraph.lower()
        paragraph = paragraph.replace("\n", " ").replace("\r", " ").replace("\t", " ")
        #stergem caractere speciale care nu sunt litere sau cifre
        paragraph = re.sub(r"[^a-zA-Z0-9\sșțăîâ-]", "", paragraph)  # Keep "-"
        #in cazul cratimelor am pus spatiu, am adaugat la stopwords terminatii de propozitii
        paragraph = paragraph.replace("-", " ")  # Replace "-" with " "

        logging.debug(f"Scraped Content: {paragraph[:500]}")  # Print first 500 chars
        return {"content": paragraph}

    except Exception as e:
        logging.error(f"Error scraping: {str(e)}")
        return {"error": str(e)}
