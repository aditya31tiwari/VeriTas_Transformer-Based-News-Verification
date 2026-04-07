<img width="590" height="274" alt="Screenshot 2026-03-08 160819" src="https://github.com/user-attachments/assets/68529288-3d21-4eee-b621-f1156b26d548" />

# VeriTas: Transformer Based Fake News Verification

VeriTas is a transformer-based fake news detection system that analyzes news content and classifies it as **real or fake**.

This project is not built from scratch — it’s a **continuation of my previous work**, where I started with traditional ML models and then pushed it further toward something more realistic and scalable.

---

##  Previous Version

This builds on my earlier project:
-> https://github.com/aditya31tiwari/FAKE_NEWS_DETECTION

Back then, the focus was:

* TF-IDF + Logistic Regression / SVM
* Simpler pipelines
* Limited ability to understand context

It worked, but it wasn’t enough for real-world use.

---

##  What’s Different Now

This version is a **serious upgrade**.

* Switched from traditional ML → **RoBERTa (transformer model)**
* Much better at understanding context in news articles
* Trained on a **larger and more diverse dataset (~100k+ articles)**
* Built a **full pipeline** instead of just a model:

  * FastAPI backend
  * Next.js frontend
* Supports **real-time predictions with confidence scores**

---

##  Approach (Simple Version)

Instead of manually engineering features, I used a pretrained transformer and fine-tuned it for:

* Real News
* Fake News

The idea is simple:

> Let the model learn context instead of trying to handcraft it.

---

##  Dataset

Combined multiple datasets:

* ISOT Dataset
* Misinformation Dataset
* FakeNewsNet (subset)

Final dataset:

* ~108k articles
* Balanced (real vs fake)
* Covers multiple domains
* Data range: ~2016–2019

---

##  How It Works

1. User enters news text
2. Frontend sends request
3. Backend processes it:

   * Tokenization
   * Model inference
4. Output:

   * Prediction (Real / Fake)
   * Confidence score

---

##  Features

* Real-time fake news detection
* End-to-end pipeline (UI → API → Model)
* Confidence-based output
* Clean and simple interface

---

##  Current State

Right now, the system runs **locally** and is still being actively improved.

Also, something important I noticed:

* High performance on dataset ≠ perfect real-world behavior
* The model can struggle with **neutral or well-balanced articles**

That’s something I’m actively working on fixing.

---

##  What’s Next

* Train for more epochs (planned in the coming weeks)
* Improve performance on real-world data
* Add:

  * URL → text extraction
  * Image → text (OCR)
* Deploy the system
* Add authentication + database support

---

##  Tech Stack

* **Model:** RoBERTa (fine-tuned)
* **Backend:** FastAPI
* **Frontend:** Next.js
* **Languages:** Python, JavaScript

---

