from sqlalchemy import Column, Integer, String, Float
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password_hash = Column(String)


class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)   # link to user (for later)
    input_type = Column(String)
    content = Column(String)
    verdict = Column(String)
    confidence = Column(Float)