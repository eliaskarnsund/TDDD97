import sqlite3
from flask import g

conn = sqlite3.connect('database.db')
c = conn.cursor()


DATABASE = 'database.db'

#Create table


def get_db(): 
	db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database()
    return db

def close_db():
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
	db = get_db();
	if db is not None:
