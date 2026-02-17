#This file is only used for quick debugging and testing. It can be removed during production

from sqlalchemy import create_engine
from dotenv import load_dotenv
import os
from models import *

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

#drop all existing tables
Base.metadata.drop_all(engine)

#create all tables
Base.metadata.create_all(engine)