from sqlalchemy.orm import Session
from model import User
from db import SessionLocal
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def create_user(email: str, password: str):
    db: Session = SessionLocal()

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        db.close()
        return None

    user = User(
        email=email,
        password_hash=hash_password(password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    return user


def authenticate_user(email: str, password: str):
    db: Session = SessionLocal()

    user = db.query(User).filter(User.email == email).first()
    if not user:
        db.close()
        return None

    if not verify_password(password, user.password_hash):
        db.close()
        return None

    db.close()
    return user