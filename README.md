<img width="590" height="274" alt="Screenshot 2026-03-08 160819" src="https://github.com/user-attachments/assets/68529288-3d21-4eee-b621-f1156b26d548" />

# VeriTas: Transformer Based Fake News Verification

# VeriTas: Transformer-Based Fake News Verification

VeriTas is a full-stack, multimodal fake news detection system that analyzes text, URLs, and images to classify news content as real or fake.

This project is a complete architectural and algorithmic overhaul of my previous baseline work, pushing the system from a simple local script to a realistic, scalable, cloud-hosted application.

## Previous Version

This builds on my earlier project: [FAKE_NEWS_DETECTION](https://github.com/aditya31tiwari/FAKE_NEWS_DETECTION)

Back then, the focus was:
* TF-IDF + Logistic Regression / SVM
* Simpler, monolithic pipelines
* Limited ability to understand complex linguistic context

It worked as a proof of concept, but it wasn’t robust enough for real-world, nuanced journalism.

## What’s Different Now

This version is a serious upgrade. I shifted entirely from traditional ML to a fine-tuned **RoBERTa** transformer model and decoupled the architecture into a modern web stack.

* **Context-Aware:** RoBERTa utilizes self-attention to understand the surrounding context of words in articles, drastically outperforming frequency-based models.
* **Full-Stack Pipeline:** Replaced the local scripts with a robust Next.js frontend (styled with Tailwind CSS) and a FastAPI backend.
* **Multimodal Inputs:** It no longer just takes raw text. The system can now scrape live URLs and perform OCR on images to analyze screenshots of news.

## Live Deployment & Architecture

VeriTas is deployed live and utilizes a decoupled, serverless architecture:

* **Frontend (Vercel):** The Next.js UI is hosted on Vercel.
* **Database (Neon PostgreSQL):** A serverless relational database handles secure user authentication (`bcrypt` hashing) and maintains a persistent history of user analyses.
* **Backend & Model (Hugging Face Spaces):** The core inference engine lives in the Hugging Face Space. 
  > **Note for Reviewers:** The backend API, extraction logic, and the fine-tuned RoBERTa model are hosted in the `backend-logic` folder. This FastAPI server acts as the bridge between the Vercel frontend, the Neon database, and the transformer model.

## Core Features

* **Real-time Classification:** Provides binary FAKE/REAL predictions alongside a percentage-based confidence score.
* **Multimodal Analysis:** Analyze raw text, extract article body text directly from live URLs, or upload images/screenshots for OCR text extraction.
* **User Accounts:** Secure registration and login functionality.
* **Analysis History:** Users have a personalized, persistent dashboard to review or delete their previous verification logs.
* **Minimalist UI:** Clean, distraction-free interface designed for quick verification.

## Dataset & Approach

Instead of manually engineering features, I used a pretrained RoBERTa transformer and fine-tuned it to learn contextual deception markers. 

Combined multiple datasets for diverse training:
* ISOT Dataset
* Misinformation Dataset
* FakeNewsNet (subset)

**Final dataset specs:**
* ~108k articles
* Balanced distribution (real vs fake)
* Covers multiple domains (politics, global news, entertainment)
* Data range: ~2016–2019

## How It Works

1. User logs into the frontend and submits content (Text, URL, or Image).
2. Frontend sends an API request to the Hugging Face backend.
3. Backend processes the input (stripping HTML from URLs or running OCR on images) to isolate the core text.
4. The text is tokenized and passed through the fine-tuned RoBERTa model for inference.
5. The backend logs the result to the Neon database and returns the Verdict and Confidence Score to the UI.

## Current State & Next Steps

The system is fully deployed and operational. However, high performance on a curated dataset does not always equal perfect real-world behavior. The model can occasionally struggle with highly neutral or exceptionally well-balanced opinion pieces.

### Next Steps:
* Train for more epochs to refine edge-case accuracy.
* Expand the dataset to include post-2020 news events to update the model's worldly context.
* Improve URL extraction logic to bypass strict anti-scraping paywalls.

## Tech Stack

* **Model:** RoBERTa (Fine-tuned via Hugging Face Transformers)
* **Backend:** Python, FastAPI, SQLAlchemy
* **Frontend:** Next.js, React, Tailwind CSS
* **Database:** Neon (Serverless PostgreSQL)
* **Hosting:** Vercel (UI), Hugging Face Spaces (API/Model)

Tech Stack
Model: RoBERTa (Fine-tuned via Hugging Face Transformers)

Backend: Python, FastAPI, SQLAlchemy

Frontend: Next.js, React, Tailwind CSS

Database: Neon (Serverless PostgreSQL)

Hosting: Vercel (UI), Hugging Face Spaces (API/Model)
