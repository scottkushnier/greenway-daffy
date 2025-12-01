Scott Kushnier   
                                                                                                                 4/18/2004

**SQL DATABASE SCHEMA**

_User table stores data associated with a particular user of the credit card portal. 
That user has access and full control of all the cards they've created._
    
User

- id (integer, primary key)
- username (string, unique)
- password (string, hashed & encrypted)

_Card table stores all relevant data for each credit card. 
Note that sensitive info is not stored such as credit card number, expiration, and CVV. 
This information is stored on Stripe server, referenced by the "pm-id"._

Card

- id (integer, primary key)
- username-id (integer) [refers back to User table]
- name (string, name on card, (also Stripe customer name))
- bank-name (string, bank for card)
- last4 (string, last 4 digits of credit card number)
- exp (string, expiration date MM/YY)
- brand (string, "visa", "mastercard", etc.)
- address-name (name on address that card is billed to)
- address-line-1 (string)
- address-line-2 (string, includes city, state, zip)
- pm-id (string, Stripe's "payment method" identifier associated with card)
- card-color (string (ex. "RGB(0,128,0)"))
- logo-color (string)
- text-color (string)
- index (gives order in which cards are shown)

