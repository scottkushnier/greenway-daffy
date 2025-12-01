

from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

bcrypt = Bcrypt()
db = SQLAlchemy()


class User(db.Model):
    """User of the system."""

    __tablename__ = 'users'

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    username = db.Column(
        db.Text,
        nullable=False,
        unique=True,
    )

    password = db.Column(
        db.Text,
        nullable=False,
    )

    @classmethod
    def authenticate(cls, username, password):
        user = cls.query.filter_by(username=username).first()
        if user:
            is_auth = bcrypt.check_password_hash(user.password, password)
            if is_auth:
                return user
        return False


class WalletCard(db.Model):
    """ An individual credit card """

    __tablename__ = 'walletcards'

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    username_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id')
    )

    name = db.Column(
        db.String(100),
        nullable=False,
    )

    bankname = db.Column(
        db.String(50),
        nullable=False,
    )

    last4 = db.Column(
        db.String(25),
        nullable=False,
    )

    exp = db.Column(
        db.String(10),
    )

    brand = db.Column(
        db.String(25),
    )

    # payment method identifier (known to Stripe, ref. to sensitive card info)
    pm_id = db.Column(
        db.String(50),
        nullable=False,
    )

    addr_name = db.Column(
        db.String(50),
        nullable=False,
    )

    addr_line1 = db.Column(
        db.String(100),
        nullable=False,
    )

    addr_line2 = db.Column(
        db.String(100),
        nullable=False,
    )

    card_color = db.Column(
        db.String(50),
        nullable=False,
    )
    
    logo_color = db.Column(
        db.String(50),
        nullable=False,
    )

    text_color = db.Column(
        db.String(50),
        nullable=False,
    )

    index = db.Column(
        db.Integer,
    )

    def __repr__(self):
        if (self.last4 != "-1" and self.last4 != -1):
            return f"<User #{self.name}: {self.bankname}, x{self.last4}, ({self.username_id})>"
        else:
            return f"<User #{self.name}: {self.bankname}, ({self.username_id})>"


# Transaction storage, maybe for future enhancements...

# class Transaction(db.Model):

#     __tablename__ = 'transactions'

#     id = db.Column(
#         db.Integer,
#         primary_key=True,
#     )

#     wallet_card_id = db.Column(
#         db.Integer,
#     )

#     timestamp = db.Column(
#         db.DateTime,
#         nullable=False,
#     )

#     # integer, in cents USD
#     amount = db.Column(
#         db.Integer,
#     )


def connect_db(app):
    db.app = app
    db.init_app(app)
    app.app_context().push()


