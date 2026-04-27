import trafilatura
from newspaper import Article
from readability import Document
import re

def extract_trafilatura(url):
    downloaded = trafilatura.fetch_url(url)
    return trafilatura.extract(downloaded) if downloaded else ""


def extract_newspaper(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        return article.text
    except:
        return ""
    


def extract_readability(url):
    try:
        res = requests.get(url)
        doc = Document(res.text)
        html = doc.summary()

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")

        return soup.get_text(separator="\n")
    except:
        return ""


# 🔹 SIMPLE SCORING FUNCTION
def score_text(text):
    if not text:
        return 0

    # reject garbage
    if len(text) < 300:
        return 0

    if "<" in text and ">" in text:
        return 0

    words = text.split()
    word_count = len(words)
    sentences = text.count(".")
    paragraphs = text.count("\n")

    return word_count + (sentences * 5) + (paragraphs * 2)

def clean_extracted_text(text):
    if not text:
        return ""
    truncation_markers = [
        "ABOUT THE AUTHOR",
        "- ABOUT THE AUTHOR",
        "Read More",
        "Click here to read",
        "Sign up for our newsletter",
        "Subscribe to our",
        "Was this article helpful?",
        "Share this article"
    ]
    
    for marker in truncation_markers:
        # re.split allows us to chop the string at the first instance of the marker
        parts = re.split(marker, text, flags=re.IGNORECASE)
        # Keep only the text *before* the marker
        text = parts[0]
    paragraphs = text.split('\n')
    clean_paragraphs = []

    # Generic markers often found in footers, ads, and bios
    junk_markers = ['©', 'copyright', 'all rights reserved', 'subscribe', 'newsletter', 'read more:', 'also read:']

    for p in paragraphs:
        p_clean = p.strip()
        p_lower = p_clean.lower()

        # 1. Skip empty lines
        if not p_clean:
            continue

        # 2. Skip very short lines (often UI buttons, dates, or tags) unless they are proper sentences
        if len(p_clean) < 25 and not p_clean.endswith('.'):
            continue

        # 3. Skip paragraphs that contain junk markers AND are relatively short (to avoid deleting real paragraphs that happen to mention "subscribe")
        if any(marker in p_lower for marker in junk_markers) and len(p_clean.split()) < 40:
            continue

        clean_paragraphs.append(p_clean)

    # Rejoin the surviving paragraphs
    return '\n\n'.join(clean_paragraphs)



# 🔹 MAIN FUNCTION
def extract_text(url):
    t1 = extract_trafilatura(url)
    t2 = extract_newspaper(url)
    t3 = extract_readability(url)

    print("TRAF:", score_text(t1))
    print("NEWS:", score_text(t2))
    print("READ:", score_text(t3))

    candidates = [t1, t2, t3]
    best_text = max(candidates, key=score_text)
    final_text = clean_extracted_text(best_text)
    return final_text