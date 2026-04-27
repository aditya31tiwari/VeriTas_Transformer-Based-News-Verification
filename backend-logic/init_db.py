from db import engine, Base
import model
from sqlalchemy import inspect

Base.metadata.create_all(bind=engine)

inspector = inspect(engine)
print("TABLES:", inspector.get_table_names())