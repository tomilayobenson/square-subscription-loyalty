const express = require('express')
const { v4: uuidv4 } = require('uuid');
const cors = require('./cors');
const retrieveSubscriptions = require('../functions/retrieveSubscriptions');
const retrieveLoyaltyAccounts = require('../functions/retrieveLoyaltyAccount');
const retrieveCustomer = require('../functions/retrieveCustomer');
const createLoyaltyAccount = require('../functions/createLoyalty Account');
const addCustomerGroup = require('../functions/addCustomerGroup');
const accumulateLoyaltyPoints = require('../functions/accumulateLoyaltyPoints');
const sendEmail = require('../functions/sendEmail');
const updatedRouter = express.Router()

updatedRouter.route('/')
    .post((req, res) => {
        const customer_id = req.body.data.object.invoice.primary_recipient.customer_id;
        const email = req.body.data.object.invoice.primary_recipient.email_address;
        const first_name = req.body.data.object.invoice.primary_recipient.given_name;
        const last_name = req.body.data.object.invoice.primary_recipient.family_name;
        const location_id = req.body.location_id;

        const subscription_plan_id = process.env.SUBSCRIPTION_PLAN_ID
        const loyalty_program_id = process.env.LOYALTY_PROGRAM_ID
        const membership_group_id = process.env.MEMBERSHIP_GROUP_ID

        console.log(`${customer_id} ${location_id}`)

        //check if it is not a subscription invoice that was paid
        if (!req.body.data.object.invoice.subscription_id) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Not a subscription invoice");
        }
        const subscription_id = req.body.data.object.invoice.subscription_id
        //check if subscription is a part of membership plan by retrieving subscription details
        retrieveSubscriptions(subscription_id)
            .then(result => {
                //check if subscription plan is not the membership program
                const customer_plan_id = result.subscription.plan_id
                if (customer_plan_id !== subscription_plan_id) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end("Not a membership program subscription");
                }
                //else check if customer has loyalty account
                retrieveLoyaltyAccounts(customer_id)
                    .then(response => {
                        //if there is no loyalty program
                        console.log("response.json is", response)
                        if (!response.loyalty_accounts) {
                            console.log('there is no loyalty program')
                            //fetch mapping phone number field of customer
                            retrieveCustomer(customer_id)
                                .then(result => {
                                    console.log("customer details is: ", result)
                                    const resultPhone = result.customer.phone_number;
                                    if (!resultPhone) {
                                        console.log('phone number is blank')
                                        res.statusCode = 200;
                                        sendEmail(customer_id, first_name, last_name, email, `Phone number is blank for this customer. Please enter customer's phone number in customer's account in Square`)
                                        res.end(`Phone number is blank`);
                                    } else {
                                        const phone_number = resultPhone.startsWith("+") ? resultPhone : `+${resultPhone}`;
                                        var idempotency_key = uuidv4();
                                        const now = new Date();
                                        const isoString = now.toISOString();
                                        //create loyalty account
                                        createLoyaltyAccount(idempotency_key, isoString, customer_id, loyalty_program_id, phone_number)
                                            .then(result => {
                                                console.log(`the loyalty account created is: ${JSON.stringify(result)}`)
                                                var account_id = result.loyalty_account.id;
                                                var idempotency_key = uuidv4();
                                                //add loyalty points
                                                accumulateLoyaltyPoints(idempotency_key, location_id, account_id)
                                                    .then(result => {
                                                        console.log(result)
                                                        //add to customer group
                                                        addCustomerGroup(customer_id, membership_group_id)
                                                            .then(response => {
                                                                console.log('customer added to group')
                                                                res.statusCode = 200;
                                                                res.setHeader('Content-Type', 'text/plain');
                                                                res.end("29 points accumulated");
                                                            })
                                                            .catch(err => {
                                                                res.statusCode = 500
                                                                sendEmail(customer_id, first_name, last_name, email, `there was a problem with adding group to the customer due to the following error: ${err}`)
                                                                res.end(`there was a problem with adding group to the customer due to the following error: ${err}`)
                                                            });
                                                    })
                                                    .catch(err => {
                                                        res.statusCode = 500
                                                        sendEmail(customer_id, first_name, last_name, email, `there was a problem with points accumulation due to the following error: ${err}`)
                                                        res.end(`there was a problem with points accumulation due to the following error: ${err}`)
                                                    });
                                            })
                                            .catch(err => {
                                                res.statusCode = 500
                                                sendEmail(customer_id, first_name, last_name, email, `there was a problem creating new loyalty account fr customer due to the following error: ${err}`)
                                                res.end(`there was a problem creating new loyalty account fr customer due to the following error: ${err}`)
                                            });
                                    }

                                })
                        } else {
                            console.log(`result is ${JSON.stringify(response)}`)
                            var account_id = response.loyalty_accounts.find(account => account.program_id == loyalty_program_id).id
                            console.log(`account id is ${account_id}`)
                            var idempotency_key = uuidv4();
                            accumulateLoyaltyPoints(idempotency_key, location_id, account_id)
                                .then(result => {
                                    console.log(result)
                                    //add to customer group
                                    addCustomerGroup(customer_id, membership_group_id)
                                        .then(response => {
                                            console.log('customer added to group')
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'text/plain');
                                            res.end("29 points accumulated");
                                        })
                                        .catch(err => {
                                            res.statusCode = 500
                                            sendEmail(customer_id, first_name, last_name, email, `there was a problem withadding group to the customer due to the following error: ${err}`)
                                            res.end(`there was a problem withadding group to the customer due to the following error: ${err}`)
                                        });
                                })
                                .catch(err => {
                                    res.statusCode = 500
                                    sendEmail(customer_id, first_name, last_name, email, `there was a problem with points accumulation due to the following error: ${err}`)
                                    res.end(`there was a problem with points accumulation due to the following error: ${err}`)
                                });
                        }
                    })
                    .catch(err => {
                        res.statusCode = 500
                        sendEmail(customer_id, first_name, last_name, email, `there was a problem with account search in loyalty programs due to the following error: ${err}`)
                        res.end(`there was a problem with account search in loyalty programs due to the following error: ${err}`)
                    })
            })
            .catch(err => {
                res.statusCode = 500
                sendEmail(customer_id, first_name, last_name, email, `there was a problem with subscription details retrieval due to the following error: ${err}`)
                res.end(`there was a problem with subscription details retrieval due to the following error: ${err}`)
            })
    })

module.exports = updatedRouter