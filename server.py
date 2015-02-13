
from flask import Flask, render_template


app = Flask(__name__)      
 
@app.route('/')
def home():
    return 'hello sir'

def sign_in(email, password):
	return

def sign_up(email, password, firstname, familyname, gender, city, country):
	return

def sign_out(token):
	return

def change_password(token, old_password, new_password):
	return

def get_user_data_by_token(token):
	return

def get_user_data_by_email(token, email):
	return

def get_user_messages_by_token(token):
	return

def get_user_messagaes_by_email(token, email):
	return

def post_message(token, message, email):
	return

if __name__ == '__main__':
    app.debug = True
    app.run(host = '0.0.0.0', port = 5000)




