
from flask import Flask 
from flask import app, request, render_template
import hashlib, uuid
import database_helper
import json
import string, random

app = Flask(__name__)      
 
@app.route('/')
def home():
	database_helper.get_db()
	return 'hello sir'

@app.route('/signin', methods=['POST'])
def sign_in():
	email = request.form['email']
	password = request.form['password']
	user = database_helper.get_user(email)
	if user == None:
		return 'This user does not exist'
	elif verifyPassword(password, user[1]):
		token =''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(30));
		if database_helper.get_logged_in_user(token):
			return 'already logged in'
		else:
			database_helper.add_logged_in_user(email, token)
		return json.dumps({'success' : True, 'message' : 'you have logged in', 'data' : token})
	else:
		return 'wrong password'

@app.route('/signup', methods=['POST'])
def sign_up():
	if request.method == 'POST':
		email = request.form['email']
		password = request.form['password']
		firstname = request.form['firstname']
		familyname = request.form['familyname']
		gender = request.form['gender']
		city = request.form['city']
		country = request.form['country']

		database_helper.add_user(email, password, firstname, familyname, gender, city, country)
		return 'added'

@app.route('/signout', methods=['POST'])
def sign_out():
	if database_helper.get_logged_in_user(request.form['token']):
		database_helper.remove_logged_in_user(request.form['token'])
		return json.dumps({"success": True, "message": "Successfully signed out."})
	else:
		return json.dumps({"success": False, "message": "You are not signed in"})

@app.route('/changepassword', methods=['POST'])
def change_password():
	token = request.form['token']
	old_password = request.form['old_password']
	new_password = request.form['new_password']

	user = database_helper.get_logged_in_user(token)
	if user != None:
		email = user[0]
		current_password = database_helper.get_user(email)[1]
		if current_password == old_password:
			database_helper.set_password(email, new_password)
			return json.dumps({"success": True, "message": "Password changed."})
		return json.dumps({"success": False, "message": "Wrong password."})
	return json.dumps({"success": False, "message": "Not logged in."})

@app.route('/getuserdatabytoken/<token>', methods=['GET'])
def get_user_data_by_token(token=None):
	userInfo = database_helper.get_logged_in_user(token)
	if userInfo is None:
		return json.dumps({"success": False, "message": "You are not signed in."})
	else:
		email = userInfo[0]
		return get_user_data(email)

@app.route('/getuserdatabyemail/<email>/<token>', methods=['GET'])
def get_user_data_by_email(email=None, token=None):
	if database_helper.get_logged_in_user(token) is None:
		return json.dumps({"success": False, "message": "You are not signed in."})
	else:
		return get_user_data(email)

def get_user_data(email):
	userInfo = database_helper.get_user(email)
	if userInfo is None:
		return json.dumps({"success": False, "message": "No such user."})
	else:
		user=[userInfo[0],userInfo[2], userInfo[3], userInfo[4], userInfo[5], userInfo[6]]
		return json.dumps({"success": True, "message": "User data retrieved.", "data": user})

@app.route('/getusermessagesbytoken')
def get_user_messages_by_token(token):
	return

@app.route('/getusermessagesbyemail')
def get_user_messagaes_by_email(token, email):
	return

@app.route('/postmessage')
def post_message(token, message, email):
	return

def hashPassword(password):
	salt = uuid.uuid4().hex
	hashedPassword = hashlib.sha512(password + salt).hexdigest()
	return hashedPass

def verifyPassword(password, databasePass):
	#reHashed = hashPassword(password)
	return password == databasePass

if __name__ == '__main__':
	# database_helper.init_db(app)
	app.debug = True
	app.run(host = '0.0.0.0', port = 5000)
