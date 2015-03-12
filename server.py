from flask import Flask, url_for
from flask import app, request, render_template
from flask.ext.bcrypt import Bcrypt
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketError
from server import app
import hashlib, uuid
import database_helper
import json
import string, random
import re

app = Flask(__name__)

active_sockets = dict()
 
@app.route('/')
def home():
	database_helper.get_db()

	#render_template('static/client.html')
	return render_template('client.html')

@app.route('/signin', methods=['POST'])
def sign_in():
	email = request.form['email']
	password = request.form['password']
	user = database_helper.get_user(email)
	if user == None:
		return json.dumps({'success' : False, 'message' : 'This user does not exist'})
	elif bcrypt.check_password_hash(user[1], password):
		token =''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(30));
		if database_helper.get_logged_in_user(token):
			return json.dumps({'success' : False, 'message' : 'Already logged in'})
		elif database_helper.get_logged_in_user_by_email(email):
			# remove other token if signed in again
			if email in active_sockets:
				try:
					ws = active_sockets[email] 
					ws.send(json.dumps({'success' : False, 'message' : 'You have been logged out'}))
				except WebSocketError as e:
					repr(e)
					print "WebSocketError on logout"
					# websocket already closed
					del active_sockets[email]
			database_helper.remove_logged_in_user_by_email(email)
		# add token to database
		database_helper.add_logged_in_user(email, token)
		return json.dumps({'success' : True, 'message' : 'you have logged in', 'data' : token})
	else:
		return json.dumps({'success' : False, 'message' : 'Wrong password'})

@app.route('/signup', methods=['POST'])
def sign_up():
	if request.method == 'POST':
		data = {}
		data['email'] = request.form['email']
		data['password'] = request.form['password']
		data['firstname'] = request.form['firstname']
		data['familyname'] = request.form['familyname']
		data['gender'] = request.form['gender']
		data['city'] = request.form['city']
		data['country'] = request.form['country']

		if not(is_valid_signup(data)):
			return json.dumps({'success' : False, 'message' : 'Invalid data'})

		if database_helper.get_user(data['email'])==None:
			database_helper.add_user(data['email'], bcrypt.generate_password_hash(data['password']), data['firstname'], data['familyname'], data['gender'], data['city'], data['country'])
			return json.dumps({'success' : True, 'message' : 'Signup successful'})
		return json.dumps({'success' : False, 'message' : 'User already exist'})

def is_valid_signup(data):
	if not (re.match("[^@]+@[^@]+\.[^@]+", data['email'])):
		return False
	if (len(data['password']) < 5):
		return False
	if (len(data['firstname']) == 0 ):
		return False
	if (len(data['familyname']) == 0 ):
		return False
	if not(data['gender'] == 'Female' or data['gender'] == 'Male'):
		return False
	if (len(data['city']) == 0 ):
		return False
	if (len(data['country']) == 0 ):
		return False
	return True
		

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
	if len(new_password) < 5:
		return json.dumps({"success": False, "message": "The password has to be 5 characters or more."})
	else:
		user = database_helper.get_logged_in_user(token)
		if user != None:
			email = user[0]
			current_password = database_helper.get_user(email)[1]
			if bcrypt.check_password_hash(current_password, old_password):
				database_helper.set_password(email, bcrypt.generate_password_hash(new_password))
				return json.dumps({"success": True, "message": "Password changed."})
			return json.dumps({"success": False, "message": "Wrong password."})
		return json.dumps({"success": False, "message": "Not logged in."})

@app.route('/getuserdatabytoken/<clientEmail>/<hashedClientData>', methods=['GET'])
def get_user_data_by_token(clientEmail=None, hashedClientData=None):

	if verifyToken(hashedClientData, 'getuserdatabytoken', clientEmail):
		return get_user_data(clientEmail)
	else:
		return json.dumps({"success": False, "message": "You are not signed in."})


	#userInfo = database_helper.get_logged_in_user(token)
	#if userInfo is None:
	#	return json.dumps({"success": False, "message": "You are not signed in."})
	#else:
	#	email = userInfo[0]
	#	return get_user_data(email)

@app.route('/getuserdatabyemail/<email>/<clientEmail>/<hashedClientData>', methods=['GET'])
def get_user_data_by_email(email=None, clientEmail=None, hashedClientData=None):
	print '------------------------------'
	print email
	print clientEmail
	print hashedClientData
	print verifyToken(hashedClientData, 'getuserdatabyemail/'+email, clientEmail)
	print '------------------------------'

	if verifyToken(hashedClientData, 'getuserdatabyemail/'+email, clientEmail):
		return get_user_data(email)
	else:
		return json.dumps({"success": False, "message": "You are not signed in."})

	#if database_helper.get_logged_in_user(token) is None:
	#	return json.dumps({"success": False, "message": "You are not signed in."})
	#else:
	#	return get_user_data(email)

def get_user_data(email):
	userInfo = database_helper.get_user(email)
	if userInfo is None:
		print '--------- Finns inte' 
		return json.dumps({"success": False, "message": "No such user."})
	else:
		user=[userInfo[0],userInfo[2], userInfo[3], userInfo[4], userInfo[5], userInfo[6]]
		print '--------- Finns' 
		return json.dumps({"success": True, "message": "User data retrieved.", "data": user})

@app.route('/getusermessagesbytoken/<clientEmail>/<hashedData>', methods=['GET'])
def get_user_messages_by_token(clientEmail=None, hashedData=None):

	if verifyToken(hashedData, 'getusermessagesbytoken', clientEmail):
		messages = database_helper.get_user_messages(clientEmail)
		return json.dumps({"success": True, "message": "Messages retrieved.", "data": messages})
	return json.dumps({"success": False, "message": "You are not signed in."})


def verifyToken(hashedClientData, route, clientEmail):

	userData = database_helper.get_logged_in_user_by_email(clientEmail)

	if userData == None:
		return json.dumps({"success": False, "message": "You are not signed in."})

	# step 7
	serverToken = userData[1]

	# step 8
	dataToHash = '/'+route+'/'+clientEmail+'/'+serverToken
	# encode string to bytes when hashing
	server_hash = hashlib.sha256(dataToHash.encode()).hexdigest()

	print 'Hash from client: ' + server_hash
	print 'Hash from server: ' + hashedClientData

	return hashedClientData == server_hash




@app.route('/getusermessagesbyemail/<email>/<token>', methods=['GET'])
def get_user_messagaes_by_email(token=None, email=None):
	loggedInUser = database_helper.get_logged_in_user(token)
	userInfo = database_helper.get_user(email)
	if loggedInUser != None:
		messages = database_helper.get_user_messages(email)
		if userInfo != None:
			return json.dumps({"success": True, "message": "Messages retrieved.", "data": messages})
		return json.dumps({"success": False, "message": "Could not find user."})
	return json.dumps({"success": False, "message": "You are not signed in."})

@app.route('/postmessage', methods=['POST'])
def post_message():
	fromUser = database_helper.get_logged_in_user(request.form['token'])
	toUser = database_helper.get_user(request.form['email'])
	if fromUser != None and toUser != None:
		database_helper.add_user_message(toUser[0], fromUser[0], request.form['message'])
		return json.dumps({"success": True, "message": "Message posted"})
	return json.dumps({"success": False, "message": "Message not posted"})

@app.route('/connectsocket')
def web_socket():

	if request.environ.get('wsgi.websocket'):

		ws = request.environ['wsgi.websocket']
		obj = ws.receive()
		data = json.loads(obj)

		# check if logged in
		if not database_helper.get_logged_in_user(data['token']):
			ws.send(json.dumps({"success": False, "message": "You are not signed in."}))

		try:

			# if already in active sockets then it must be a page refresh
			if data['email'] in active_sockets:
				print data['email'] + ' already has active socket'

			# save active websocket for logged in email
			print 'Setting socket for: ' + data['email']
			active_sockets[data['email']] = ws

			# listen on socket
			# needed to keep socket open
			while True:
				obj = ws.receive()
				if obj == None:
					del active_sockets[data['email']]
					ws.close()
					print 'Socket closed: ' + data['email']
					return ''


		except WebSocketError as e:
			repr(e)
			print "WebSocketError"
			del active_sockets[data['email']]
			
	return ''

if __name__ == '__main__':
	# database_helper.init_db(app)
	app.debug = True
	bcrypt = Bcrypt(app)
	# app.run(host = '0.0.0.0', port = 5000)
	http_server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
	http_server.serve_forever()
