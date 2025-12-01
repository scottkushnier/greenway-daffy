**GREENWAY PAYMENT PORTAL**

**FOR USERS:**

---

This application is a proof-of-concept and will not work to charge real
money on real credit cards. The integration with Stripe uses "Test Mode"
only. As such, only "dummy" credit card numbers should be used:

    Visa - 4242 4242 4242 4242
    
    Mastercard - 5555 5555 5555 4444
    
    Discover - 6011 1111 1111 1117
    
    Amex - 3782 822463 10005
    
    (Bad Card) - 4000 0000 0000 0002

Do **NOT** attempt to use credit card numbers from real cards. Not only will
this not work, this may put your credit card information at risk for theft or
fraud.

All other field data entered is entirely at users' discretion.

The database has been seeded for two 'users', "authors" and "cereal".
Use the password "123" to access.

---

You can change card color and logo color by clicking each. 
Click on right side of card, since left side is busy with input fields.

Click once to choose from broad choice of colors.  
Click again to refine a present color.

The color tables for choosing color are based on HSL values.
On the first table, hue increases with row, lightness increases with column.
For the fine color tables, each table represents a slightly different hue.
On these tables saturation decreases with row, again lightness increases with column.

---

Once _credit card number_, _expiration date_, _CVV_, and _name-on-card_ are
entered, a Stripe payment method will be generated and associated
with the card. If a user returns to the card later, only the last4 and
expiration date will be shown. Name, expiration date, and last4 will be
fixed; however, you may erase and re-enter card data but clicking twice on the
last4 field.

---

The 'filter' input will hide cards that don't include the selected text.
Note that card number (other than last 4 digits) and CVV codes can not
be filtered for.

---

You can select a stored card by clicking on it or by using up and down 
arrow keys.
You can deselect all cards & enter a new card by clicking on empty area
above or below stored cards.
You can move a selected card up or down in the list by using 
'SHIFT-Up-Arrow' and 'SHIFT-Down-Arrow'.

---

_Scott Kushnier_, _5/6/24_
