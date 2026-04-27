import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_kuq6NfFT4beJ@ep-calm-shape-an149n68.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
)
engine = create_engine(DATABASE_URL, 
    pool_pre_ping=True,   
    pool_recycle=300      
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()



