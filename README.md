
**GREENWAY PAYMENT PORTAL**

This project represents a web interface that allows a customer to
store and charge from a list of credit cards.  Alternatively, it could
be used by a vendor to store client credit cards in order to expedite frequent
or recurring charges.

The portal interfaces with the Stripe (TM) API for storage of sensitive credit
card information and to process charges. A SQL database is used to store the non-sensitive card information, including last 4 digits of the card number, expiration date, and Stripe's "payment method" identifier which links to
all the card details (safely stored on Stripe's database).

As a customer buying goods or services online, it can be a hassle digging 
through credit cards in a wallet, typing the card information 
(for the nth time, which is also error-prone and a security risk),
checking that the site is guaranteed secure, and then wonder what this vendor
might do with your card (sell the info, charge the card later without consent,
etc.)

As a vendor charging clients using an online merchant portal, 
it is similarly an error-prone and risky hassle entering the card information.
Clients often say things along the lines of "can you just charge the card ending in 6789?" or "just use the same credit card I used last time". Having a secure and search-able store of credit cards would be great.

Futhermore, it is in both clients and vendors best interest that vendors
don't have direct access to sensitive credit card information. It creates
PCI hassles for vendors and vulnerability to accusations against vendors 
in doing something untoward with the credit card info. 
Vendors generally just want to be paid. 
Customers, also, would be happier, knowing that vendors couldn't profit from 
the credit card information that they have access to. A web credit card charging portal, in concert with a system like Stripe, enables credit card information
to be hidden from vendors. 

See further documentation in the 'docs' folder:

* for-users.md
* for-developers.md

---

Available via Render Here:

[https://capstone-1-jjae.onrender.com/](https://capstone-1-jjae.onrender.com/)

Usernames: 'authors', 'cereal'.

Password: '123'

---

_Scott Kushnier_, _5/6/24_

