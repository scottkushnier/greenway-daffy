

import stripe
from flask import Flask, render_template, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, connect_db, WalletCard, User
from os import getenv
import os
import sys

print ('TESTING: ', getenv('TESTING'));

if (getenv('TESTING') == 'True'):
   just_testing = True
elif (getenv('TESTING') == 'False'):
   just_testing = False
else: 
   print("*** Need to set TESTING env variable. ***")
   sys.exit(1)




print ('Here in create app.')

if (just_testing):
    stripe.api_key = getenv('STRIPE_API_KEY')
else:
    stripe.api_key = os.environ.get('STRIPE_API_LIVE_KEY')

bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__)

 #   app.config['SQLALCHEMY_DATABASE_URI'] = getenv('SQL_DB')

    app.config['SQLALCHEMY_DATABASE_URI'] = (
        os.environ.get('DATABASE_URL', os.environ.get('SQL_DB')))

 #   app.config['SQLALCHEMY_ECHO'] = eval(getenv('SQL_ECHO'))
    app.config['SECRET_KEY'] = "midichlor"
    app.config['TESTING'] = getenv('TESTING')
    connect_db(app)
    make_route_for_home_page(app)
    make_routes_for_api(app)
    make_routes_for_login_logout(app)
    make_routes_for_stripe_api(app)
    return (app)


def make_route_for_home_page(app):
    @app.route('/')
    def home_page():
        """ single page, all interactions are through JS """
        return render_template('index.html/')

#################################################################
# API for dealing with storing cards in SQL db
#################################################################


def serialize_card(card):
    """ represent card from DB for xfer over axios """
    return ({'id': card.id,
             'userid': card.id,
             'name': card.name,
             'bankname': card.bankname,
             'last4': card.last4,
             'exp': card.exp,
             'brand': card.brand,
             'pmID': card.pm_id,
             'addr_name': card.addr_name,
             'addr_line1': card.addr_line1,
             'addr_line2': card.addr_line2,
             'card_color': card.card_color,
             'logo_color': card.logo_color,
             'text_color': card.text_color})


def check_user(userid):
    """ used to validate that we're changing data for user we're logged in as """
    if CURR_USER_KEY in session:
        if (userid == session[CURR_USER_KEY]):
            return True
        else:
            print('userid given: ', userid,
                  'current: ', session[CURR_USER_KEY])
            return False


def make_routes_for_api(app):

    @app.route('/api/cards/<int:userid>', methods=["GET"])
    def api_list_cards(userid):
        """ retrieve all stored cards for a logged-in user """
        if (not check_user(userid)):
            return ('access denied - wrong userid')
        cards = WalletCard.query.filter(
            WalletCard.username_id == userid).order_by(WalletCard.index).all()
        cards_list = [serialize_card(card) for card in cards]
        # print('cards-list', cards_list)
        return jsonify({'cards': cards_list})

    @app.route('/api/cards', methods=["POST"])
    def api_make_card():
        """ store a new card in DB """
        card = WalletCard()
        card.username_id = request.json['userid']
        if (not check_user(card.username_id)):
            return ('access denied - wrong userid')
        card.name = request.json['name']
        card.bankname = request.json['bankname']
        card.last4 = request.json['last4']
        card.exp = request.json['exp']
        card.brand = request.json['brand']
        card.pm_id = request.json['pmID']
        card.addr_name = request.json['addr_name']
        card.addr_line1 = request.json['addr_line1']
        card.addr_line2 = request.json['addr_line2']
        card.card_color = request.json['card_color']
        card.logo_color = request.json['logo_color']
        card.text_color = request.json['text_color']
        card.index = request.json['index']
        db.session.add(card)
        db.session.commit()
        return (jsonify({'card': serialize_card(card)}), 201)

    @app.route('/api/cards/<int:id>', methods=["POST"])
    def api_mod_card(id):
        """ modify a card & store in DB, just send all fields over """
        # print('request: ', request.json)
        card = db.session.get(WalletCard, id)
        card.userid = request.json['userid']
        if (not check_user(card.username_id)):
            return ('access denied - wrong userid')
        card.name = request.json['name']
        card.bankname = request.json['bankname']
        card.last4 = request.json['last4']
        card.exp = request.json['exp']
        card.brand = request.json['brand']
        card.pm_id = request.json['pmID']
        card.addr_name = request.json['addr_name']
        card.addr_line1 = request.json['addr_line1']
        card.addr_line2 = request.json['addr_line2']
        card.card_color = request.json['card_color']
        card.logo_color = request.json['logo_color']
        card.text_color = request.json['text_color']
        print('got update for card: ', card)
        card.index = request.json['index']
        db.session.commit()
        return (jsonify({'card': serialize_card(card)}), 201)

    @app.route('/api/cards/<int:id>/delete', methods=["POST"])
    def card_destroy(id):
        """Delete a card from wallet."""
        card = db.session.get(WalletCard, id)
        userid = card.username_id
        if (not check_user(userid)):
            return ('access denied - wrong userid')
        # also need to decrease indexes for all cards with higher index
        cards_to_change = WalletCard.query.filter(
            WalletCard.username_id == userid, WalletCard.index > card.index).all()
        for mod_card in cards_to_change:
            mod_card.index = mod_card.index-1
            db.session.add(mod_card)
        db.session.delete(card)
        db.session.commit()
        return 'success'


#############################################################
# LOGIN / LOGOUT / SIGN-UP
#############################################################

CURR_USER_KEY = "curr_user"


def make_routes_for_login_logout(app):

    @app.route('/current-userid')
    def current_user():
        """ retrieve currently logged-in user, mainly for F5 / page refresh
        so that can redraw page properly """
        if (CURR_USER_KEY in session):
            userid = session[CURR_USER_KEY]
        else:
            userid = -1
        return ({'userid': userid})

    @app.route('/api/username/<int:userid>')
    def get_username(userid):
        """ retrieve username for id """
        user = db.session.get(User, userid)
        # user = User.query.get(userid)
        if (user):
            return ({'username': user.username})
        else:
            return ({'username': 'error'})

    @app.route('/login', methods=["POST"])
    def login():
        """ new user login with bcrypt authentication """
        username = request.json['username']
        password = request.json['password']
        # print('username: ', username, ' trying to log in')
        user = User.query.filter(User.username == username).all()
        if len(user) == 0:
            print("no such user")
            return ('no such user')
        if User.authenticate(username, password):
            session[CURR_USER_KEY] = user[0].id
            # print('userid:', user[0].id)
            return ({'userid': user[0].id})
        else:
            return ('wrong password')

    @app.route('/logout', methods=["POST"])
    def logout():
        userid = request.json['userid']
        # print('userid: ', userid, ' trying to log out')
        if CURR_USER_KEY in session:
            del session[CURR_USER_KEY]
        return ('OK')

    @app.route('/signup', methods=["POST"])
    def signup():
        """ all new user to sign up with empty wallet, specifying username & password desired """
        # print('req json: ', request.json)
        username = request.json['username']
        password = request.json['password']
        # print('username: ', username, ' trying to sign up')
        # check if already such a username
        user = User.query.filter(User.username == username).all()
        if len(user) > 0:
            return "user already exists"
        hashed_pwd = bcrypt.generate_password_hash(password).decode('UTF-8')
        user = User(
            username=username,
            password=hashed_pwd,
        )
        db.session.add(user)
        db.session.commit()
        session[CURR_USER_KEY] = user.id
        return {'userid': user.id}


#############################################################
# STRIPE INTERFACE
#############################################################
# Most of interfacing is done from flask server through Python
# Exception is generating a tokenized payment method to hide sensitive card details
#    from flask server, details are sent straight to Stripe using AXIOS call from JS.
#    Details are collected and sent using Stripe's "elements" input fields
#    for such as credit card number, CVV, expiration date.

def make_routes_for_stripe_api(app):

    @app.route('/customers', methods=["GET"])
    def list_customers():
        """ Stripe stores customer names & associates with cards (i.e. payment methods) """
        res = stripe.Customer.list(limit=30)
        print("Existing Customers:\n")
        print(res)
        return (res)

    @app.route('/customers', methods=["POST"])
    def add_customer():
        """ Tell Stripe about a new customer """
        name = request.json['name']
        print('called to local API: new customer: ', name)
        res = stripe.Customer.create(
            name=name,
            email="scottkushnier@hstreet.com",
        )
        # print(res)
        return (res)

    @app.route('/customer-payment-methods/<string:id>')
    def list_customer_pms(id):
        """ Stripe stores tokenized payments for customers
            This call allows app to see what payment methods are already in Stripes DB for a customer
            Otherwise, to charge, need to add associated payment method for a customer """
        res = stripe.Customer.list_payment_methods(id)
        return (res)

    @app.route('/attach-payment-method/<string:custid>/<string:pm>')
    def attach_payment_method(custid, pm):
        print('attaching payment method')
        """ Tell Stripe about additional payment method (i.e. card) for a customer. """
        try:
            res = stripe.PaymentMethod.attach(pm, customer=custid)
        except stripe.error.CardError as e:
            print("A payment error occurred: {}".format(e.user_message))
            return ({'error': format(e.user_message)})

        return (res)

    @app.route('/charge', methods=["POST"])
    def add_charge():
        """ Tell Stripe to process a payment.
            Requires two steps:
            (1) Generate a payment intent.
            (2) Confirm that payment intent.  """
        amount = round(request.json['amount'] *
                       100)  # Stripe wants amounts in cents.
        payment_method = request.json['pm']
        customer = request.json['customerID']
        # print("amount: ", amount)
        try:
            res = stripe.PaymentIntent.create(
                amount=amount,
                currency="usd",
                customer=customer,
                payment_method=payment_method,
                # make Stripe payment w/no muss, no fuss
                automatic_payment_methods={"enabled": True, "allow_redirects": "never"})
        except:
            print('STRIPE ERROR')
            return ('error')

    #    print('res: ', res)
        pi = res.id
        try:
            res2 = stripe.PaymentIntent.confirm(pi)
    #        print('res2: ', res2)
        except stripe.error.CardError as e:
            print("A payment error occurred: {}".format(e.user_message))
            return ({'error': format(e.user_message)})
        return (res2)

    @app.route('/payments', methods=["GET"])
    def list_payments():
        """ Stripe stores all payments """
        res = stripe.stripe.PaymentIntent.list(limit=25)
        # print("Payments:\n")
        # print(res)
        return (res)

    @app.route('/refund', methods=["POST"])
    def do_refund():
        amount = round(request.json['amount'] *
                       100)  # Stripe wants amounts in cents.
        id = request.json['id']
        print("Refund for: ", amount, " for pi: ", request.json['id'])
        res = stripe.Refund.create(amount=amount, payment_intent=id)
        return (res)
