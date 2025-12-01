
import os
from dotenv import load_dotenv
from unittest import TestCase
from models import db, User, WalletCard
from create_app import create_app

load_dotenv('.env.test')
os.environ['DATABASE_URL'] = os.environ['SQL_DB']

app = create_app()
db.create_all()

class ModelsTestCase(TestCase):
    """Test views for messages."""

    def setUp(self):
        """Create test client, add sample data."""

        WalletCard.query.delete()
        User.query.delete()
        self.client = app.test_client()

    def test_models(self):
        """Does basic model work?"""

        u = User(
            username="testuser",
            password="HASHED_PASSWORD"
        )

        db.session.add(u)
        db.session.commit()

        # print('id: ', u.id)
        card = WalletCard(
            username_id = u.id,
            name = 'TEST NAME 1',
            bankname = 'TEST BANK',
            addr_name = 'Test Name 1',
            addr_line1 = '102 Stoney Rd.',
            addr_line2 = 'Paris, TX 30042',
            last4 = "",
            pm_id = "",
            card_color = "RGB(0,255,0)",
            logo_color = "RGB(255,0,0)",
            text_color = "white",
            index = 0
        )

        db.session.add(card)
        db.session.commit()

        card2 = WalletCard(
            username_id = u.id,
            name = 'TEST NAME 2',
            bankname = 'TEST BANK',
            addr_name = 'Test Name 2',
            addr_line1 = '104 Stoney Rd.',
            addr_line2 = 'Paris, TX 30042',
            last4 = "",
            pm_id = "",
            card_color = "RGB(0,255,0)",
            logo_color = "RGB(255,0,0)",
            text_color = "white",
            index = 1
        )

        db.session.add(card2)
        db.session.commit()

        u2 = User(
            username="testuser2",
            password="HASHED_PASSWORD2"
        )

        db.session.add(u2)
        db.session.commit()

        card3 = WalletCard(
            username_id = u2.id,
            name = 'TEST NAME 3',
            bankname = 'TEST BANK',
            addr_name = 'Test Name 3',
            addr_line1 = '106 Stoney Rd.',
            addr_line2 = 'Paris, TX 30042',
            last4 = "4444",
            pm_id = "",
            card_color = "RGB(0,255,0)",
            logo_color = "RGB(255,0,0)",
            text_color = "black",
            index = 0
        )

        db.session.add(card3)
        db.session.commit()

        self.assertIsInstance(u, User)
        self.assertIsInstance(u2, User)
        self.assertIsInstance(card, WalletCard)