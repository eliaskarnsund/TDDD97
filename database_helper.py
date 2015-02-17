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

def connect_to_database():
	return sqlite3.connect('database.db')

def close_db():
	db = getattr(g, '_database', None)
	if db is not None:
		db.close()

def init_db(app):
	with app.app_context():
		db = get_db()
		with app.open_resource('database.schema', mode='r') as f:
			db.cursor().executescript(f.read())
		db.commit()

def getUser(email):
	cur = get_db().cursor()
	query = 'SELECT * FROM user AS U WHERE U.email = ?'
	cur.execute(query, [email])
	userInfo = cur.fetchone()
	return userInfo

