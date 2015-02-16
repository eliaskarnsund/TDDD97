
from flask import Flask 
from flask import app, request, render_template
import database_helper

app = Flask(__name__)      
 
@app.route('/')
def home():
	return 'hello sir'

@app.route('/signin')
def sign_in(email, password):
	return

@app.route('/signup', methods=['POST'])
def sign_up(email, password, firstname, familyname, gender, city, country):
	if request.method == 'POST':
		# TODO add to database
		# database_helper.addUser(email, password, firstname, familyname, gender, city, country);
		return


@app.route('/signout')
def sign_out(token):
	return

@app.route('/changepassword')
def change_password(token, old_password, new_password):
	return

@app.route('/getuserdatabytoken')
def get_user_data_by_token(token):
	return

@app.route('/getuserdatabyemail')
def get_user_data_by_email(token, email):
	return

@app.route('/getusermessagesbytoken')
def get_user_messages_by_token(token):
	return

@app.route('/getusermessagesbyemail')
def get_user_messagaes_by_email(token, email):
	return

@app.route('/postmessage')
def post_message(token, message, email):
	return

if __name__ == '__main__':
	# database_helper.init_db(app)
	app.debug = True
	app.run(host = '0.0.0.0', port = 5000)