
import os
from dotenv import load_dotenv
from unittest import TestCase
from models import db, User, WalletCard
from create_app import create_app
import json
import stripe

load_dotenv('.env.test')
os.environ['DATABASE_URL'] = os.environ['SQL_DB']

app = create_app()
db.create_all()

class ServerTestCase(TestCase):
    """Test views for messages."""

    def setUp(self):
        """Create test client, add sample data."""

        WalletCard.query.delete()
        User.query.delete()
        self.client = app.test_client()

        # u = User(
        #     username="testuser",
        #     password="HASHED_PASSWORD"
        # )

        # db.session.add(u)
        # db.session.commit()

        # # print('id: ', u.id)
        # card = WalletCard(
        #     username_id = u.id,
        #     name = 'TEST NAME 1',
        #     bankname = 'TEST BANK',
        #     addr_name = 'Test Name 1',
        #     addr_line1 = '102 Stoney Rd.',
        #     addr_line2 = 'Paris, TX 30042',
        #     last4 = "",
        #     pm_id = "",
        #     card_color = "RGB(0,255,0)",
        #     logo_color = "RGB(255,0,0)",
        #     text_color = "white",
        #     index = 0
        # )

        # db.session.add(card)
        # db.session.commit()

        # card2 = WalletCard(
        #     username_id = u.id,
        #     name = 'TEST NAME 2',
        #     bankname = 'TEST BANK',
        #     addr_name = 'Test Name 2',
        #     addr_line1 = '104 Stoney Rd.',
        #     addr_line2 = 'Paris, TX 30042',
        #     last4 = "",
        #     pm_id = "",
        #     card_color = "RGB(0,255,0)",
        #     logo_color = "RGB(255,0,0)",
        #     text_color = "white",
        #     index = 1
        # )

        # db.session.add(card2)
        # db.session.commit()

        # u2 = User(
        #     username="testuser2",
        #     password="HASHED_PASSWORD2"
        # )

        # db.session.add(u2)
        # db.session.commit()

        # card3 = WalletCard(
        #     username_id = u2.id,
        #     name = 'TEST NAME 3',
        #     bankname = 'TEST BANK',
        #     addr_name = 'Test Name 3',
        #     addr_line1 = '106 Stoney Rd.',
        #     addr_line2 = 'Paris, TX 30042',
        #     last4 = "4444",
        #     pm_id = "",
        #     card_color = "RGB(0,255,0)",
        #     logo_color = "RGB(255,0,0)",
        #     text_color = "black",
        #     index = 0
        # )

        # db.session.add(card3)
        # db.session.commit()

    def tearDown(self):
        db.session.rollback()

    def test_login_etc(self):
        with app.test_client() as client:

            # check not signed in as anybody
            resp = client.get('/current-userid')
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('data: ', data)
            self.assertIn('userid', data)
            self.assertIn('-1', data)
 
            # sign up Frank
            resp = client.post('/signup',json={'username': 'frank', 'password': 'abc123'})
            # print ('resp: ', resp)
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('data: ', data)
            frank_id = json.loads(data)['userid']
            # print('id: ', id)

            # check that logged in as Frank
            resp = client.get('/current-userid')
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('data: ', data)
            id2 = json.loads(data)['userid']
            assert frank_id == id2

            # logout
            resp = client.post('/logout', json={'userid': frank_id})
            # print ('logout resp: ', resp)
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('logout data: ', data)

            # check not signed in as anybody
            resp = client.get('/current-userid')
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('userid data: ', data)
            self.assertIn('userid', data)
            self.assertIn('-1', data)
        
            # sign up Larry
            resp = client.post('/signup',json={'username': 'larry', 'password': '123456'})
            # print ('resp: ', resp)
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('data: ', data)
            larry_id = json.loads(data)['userid']
            # print('larry id: ', larry_id)

            # logout, then login againas Frank
            resp = client.post('/logout', json={'userid': larry_id})
            # print ('logout resp: ', resp)
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('logout data: ', data)
            resp = client.post('/login',json={'username': 'frank', 'password': 'abc123'})
            # print ('resp: ', resp)
            assert resp.status_code == 200

            # check that logged in
            resp = client.get('/current-userid')
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('userid data: ', data)
            id = json.loads(data)['userid']
            assert id == frank_id

            # logout
            resp = client.post('/logout', json={'userid': frank_id})
            assert resp.status_code == 200

            # find username, given user id
            resp = client.get(f'/api/username/{frank_id}')
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('username data: ', data)
            name = json.loads(data)['username']
            assert name == 'frank'
    
    def test_cards(self):
        with app.test_client() as client:

            # sign up Billy
            resp = client.post('/signup',json={'username': 'billy', 'password': 'abc123'})
            # print ('resp: ', resp)
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('data: ', data)
            billy_id = json.loads(data)['userid']
            # print('billy id: ', billy_id)

            # give Billy a card
            resp = client.post('/api/cards',json={
                'userid': billy_id,
                'name': 'BILLY BOB', 
                'bankname': 'Big Bob Bank',
                'last4' : '',
                'exp': '',
                'brand': '',
                'pmID': '',
                'addr_name': 'Billy Bob',
                'addr_line1': '123 Oak Lane',
                'addr_line2': 'Pueblo, NM 41234',
                'card_color': 'RGB(0,0,0)',
                'logo_color': 'RGB(255,255,0)',
                'text_color': 'white',
                'index': 0})
            # print('resp: ', resp)
            assert resp.status_code == 201
            data = resp.get_data(as_text=True)
            # print('card: ', data)
            card1_id = json.loads(data)['card']['userid']

            # give Billy another card
            resp = client.post('/api/cards',json={
                'userid': billy_id,
                'name': 'BILLY BOB', 
                'bankname': 'Big Sam Bank',
                'last4' : '',
                'exp': '',
                'brand': '',
                'pmID': '',
                'addr_name': 'Billy Bob',
                'addr_line1': '123 Oak Lane',
                'addr_line2': 'Pueblo, NM 41234',
                'card_color': 'RGB(0,255,0)',
                'logo_color': 'RGB(255,255,255)',
                'text_color': 'black',
                'index': 1})
            # print('resp: ', resp)
            assert resp.status_code == 201
            data = resp.get_data(as_text=True)
            # print('card: ', data)
            card2_id = json.loads(data)['card']['userid']

            # print(card1_id, card2_id)

            # change some info for Billy's first card
            resp = client.post(f'/api/cards/{card2_id}/delete')
            # print('resp: ', resp)
            assert resp.status_code == 200
            
    def test_stripe(self):
        with app.test_client() as client:

            stripe.api_key = os.environ.get('STRIPE_API_KEY')

            # get list of Stripe customers
            resp = client.get(f'/customers')
            assert resp.status_code == 200
            data = resp.get_data(as_text=True)
            # print ('username data: ', data)
            list = json.loads(data)['data']
            # print('list: ', list)
            # print('len: ', len(list))

            # try to charge
            resp = client.post('/charge',json={
                'amount': 12.30,
                'pm': 'pm_1PDWnLBKOM7KLRhMNwj6xq5c',
                'customerID': 'cus_Q3e544DS8C2dfM'})
            # print('resp', resp)
            assert resp.status_code == 200

    def test_home_page(self):
        with app.test_client() as client:
            resp = client.get('/')
            html = resp.get_data(as_text=True)
            self.assertIn('Greenway Payment Portal', html)