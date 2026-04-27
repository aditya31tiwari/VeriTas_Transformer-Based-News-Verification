from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ml import analyze_text
from url_extraction import extract_text
from fastapi import UploadFile, File, Form
from image_extraction import extract_text_from_image
from db import engine, Base, SessionLocal
import os
from auth import create_user, authenticate_user
from fastapi.middleware.cors import CORSMiddleware
from model import Analysis
from sqlalchemy import desc
Base.metadata.create_all(bind=engine)

app = FastAPI()
origins = ["https://veritas-pied.vercel.app"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class TextRequest(BaseModel):
    text: str
    user_id: int

@app.post("/analyze-text")
def analyse_text(data:TextRequest):
    result = analyze_text(data.text)
    db = SessionLocal()

    new_entry = Analysis(
        user_id = data.user_id,
        input_type = "text", 
        content=data.text,
        verdict=result["verdict"],
        confidence=result["raw_score"]
    )

    db.add(new_entry)
    db.commit()
    db.close()

    return {
    "verdict": result["verdict"],
    "confidence": result["confidence"],
    "raw_score": result["raw_score"],
    "extracted_text": data.text
}

class URLRequest(BaseModel):
    url:str
    user_id: int

@app.post("/analyze-url")
def analyze_url(data: URLRequest):
    text = extract_text(data.url)
    if not text or len(text.strip()) < 300:
        raise HTTPException(
            status_code=400, 
            detail="Could not extract text. The site might be blocking scrapers, heavily JavaScript-based (like MSN), or a video page."
        )
    result = analyze_text(text)

    print(text[:500]) #temp

    db = SessionLocal()

    new_entry = Analysis(
        user_id = data.user_id,
        input_type = "url", 
        content=text,
        verdict=result["verdict"],
        confidence=result["raw_score"]
    )

    db.add(new_entry)
    db.commit()
    db.close()
    
    return {
    "verdict": result["verdict"],
    "confidence": result["confidence"],
    "raw_score": result["raw_score"],
    "extracted_text": text
}


@app.post("/analyze-image")
def analyse_image(file: UploadFile = File(...), user_id: int = Form(...)):
    os.makedirs("temp", exist_ok=True)
    path = f"temp/{file.filename}"

    with open(path, "wb") as f:
        f.write(file.file.read())

    text = extract_text_from_image(path)
    result = analyze_text(text)
    os.remove(path)
    
    db = SessionLocal()

    new_entry = Analysis(
        user_id = user_id,
        input_type = "image",
        content=text,
        verdict=result["verdict"],
        confidence=result["raw_score"]
    )

    db.add(new_entry)
    db.commit()
    db.close()
    
    return {
    "verdict": result["verdict"],
    "confidence": result["confidence"],
    "raw_score": result["raw_score"],
    "extracted_text": text
}

@app.get("/test-db")
def test_db():
    try:
        engine.connect()
        return {"status": "connected"}
    except:
        return {"status":"failed"}

class AuthRequest(BaseModel):
    email:str
    password:str

@app.post("/register")
def register(data: AuthRequest):
    user = create_user(data.email, data.password)
    if not user:
        return {"error": "User already exists"}
    return {"message": "User created", "user_id": user.id}

@app.post("/login")
def login(data: AuthRequest):

    user = authenticate_user(data.email, data.password)

    if not user:
        return {"error": "Invalid credentials"}

    return {"message": "Login successful", "user_id": user.id}

@app.get("/history/{user_id}")
def get_user_history(user_id: int):

    db = SessionLocal()

    data = db.query(Analysis).filter(Analysis.user_id == user_id).all()
    db.close()

    db.close()

    return data

# main.py

@app.delete("/history/delete/{analysis_id}")
def delete_specific_history(analysis_id: int):
    db = SessionLocal()
    try:
        # Look for the specific analysis record
        item = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if item:
            db.delete(item)
            db.commit()
            return {"message": "Deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Record not found")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/history/clear/{user_id}")
def clear_all_history(user_id: int):
    db = SessionLocal()
    try:
        db.query(Analysis).filter(Analysis.user_id == user_id).delete()
        db.commit()
        return {"message": "History cleared"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()