Scott Kushnier   
2/11/2004       

                                                                                         

**PROPOSAL - SPRINGBOARD CAPSTONE PROJECT 1**

**Summary:**

This proposal describes a web-based payment “portal” which would allow a user to process credit card payments by using the stripe.com API. The typical use case would be that a customer would be able to pay for a product or service via credit card by visiting the payment portal site, selecting from his or her previously used credit cards (or specify a new one), and specify a dollar amount and recipient. 

**Benefits:**

*Ease, Speed, Flexibility* - Using previously stored credit card information would 
save the customer time and effort (fishing out a card, reading numbers, 
answering questions about zip code, expiration date, etc.), reduce the 
probability of miskeyed / misunderstood numbers, and serve to further 
protect physical cards from loss and theft. Vendors would benefit equally 
from the eased transaction and would have streamlined access to accepting 
credit cards as a form of payment.  Records of payment could be stored and 
audited in case of potential payment disputes. 

*Privacy & Security* - The vendor would not have access to the credit card details. This would result in a smaller probability of compromise of credit card information. Also, there would be less cause to suspect a vendor if credit card information were to become compromised.

*Lower Cost* - Increased security could translate into lower credit card fees, being 
offset by less losses due to credit card fraud. A more central clearinghouse (like stripe.com) for credit card processing could result in economy-of-scale savings. A more streamlined web portal could result in less CPU cycles, electricity, maintenance, and support calls for web site infrastructure devoted to customers using multiple, potentially confusing, websites for credit card processing with varying levels of ease and clarity in keying in credit card information.

**Fulfillment of Capstone Project Objectives:**

* Requires extensive use of JavaScript for front-end, in order for the interface 
  to look presentable, be intuitive and easy to use, and to minimize chance of error 
  (e.g. state code of ‘AA’ or expiration date of Feb, 1937.)

* Requires interfacing with a well-known, commonly used API, i.e. stripe.com

* Requires user login for customers to access their private credit card data
- Requires database storage of credit card data (i.e. virtual wallet of credit cards)

- Requires careful consideration of security due to the sensitive nature of credit card data
