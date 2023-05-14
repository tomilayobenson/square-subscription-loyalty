const express = require('express')
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const cors = require('./cors')
const updatedRouter = express.Router()

updatedRouter.route('/')
    .post((req, res) => {
        const customer_id = req.body.data.object.invoice.primary_recipient.customer_id;
        const location_id = req.body.location_id;

        const subscription_plan_id = process.env.SUBSCRIPTION_PLAN_ID
        const loyalty_program_id = process.env.LOYALTY_PROGRAM_ID

        console.log(`${customer_id} ${location_id}`)

        //check if it is not a subscription invoice that was paid
        if (!req.body.data.object.invoice.subscription_id) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Not a subscription invoice");
        }
        const subscription_id = req.body.data.object.invoice.subscription_id
        //check if subscription is a part of membership plan by retrieving subscription details
        var myHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.SECRET_KEY}`
        };

        var requestOptions = {
            method: 'GET',
            headers: myHeaders
        };
        fetch(` https://connect.squareupsandbox.com/v2/subscriptions/${subscription_id}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                //check if subscription plan is not the membership program
                const customer_plan_id = result.subscription.plan_id
                if (customer_plan_id !== subscription_plan_id) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end("Not a membership program subscription");
                }
                //else check if customer has loyalty account
                var myHeaders = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.SECRET_KEY}`
                };
                var raw = JSON.stringify({
                    "query": {
                        "customer_ids": [
                            customer_id
                        ]
                    }
                });
                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw
                };
                fetch("https://connect.squareupsandbox.com/v2/loyalty/accounts/search", requestOptions)
                    .then(response => response.json())
                    .then(response => {
                        //if there is no loyalty program
                        console.log("response.json is", response)
                        if (!response.loyalty_accounts) {
                            console.log('there is no loyalty program')
                            //fetch mapping phone number field of customer
                            fetch(`https://connect.squareupsandbox.com/v2/customers/${customer_id}`,
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${process.env.SECRET_KEY}`
                                    }
                                })
                                .then(response => response.json())
                                .then(result => {
                                    console.log("customer details is: ", result)
                                    const phone_number = result.customer.phone_number
                                    var idempotency_key = uuidv4();
                                    const now = new Date();
                                    const isoString = now.toISOString();
                                    var myHeaders = {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${process.env.SECRET_KEY}`
                                    };

                                    var raw = JSON.stringify({
                                        "idempotency_key": idempotency_key,
                                        "loyalty_account": {
                                            "enrolled_at": isoString,
                                            "customer_id": customer_id,
                                            "program_id": loyalty_program_id,
                                            "mapping": {
                                                "phone_number": phone_number
                                            }
                                        }
                                    });

                                    var requestOptions = {
                                        method: 'POST',
                                        headers: myHeaders,
                                        body: raw
                                    };
                                    //create loyalty account for customer
                                    fetch("https://connect.squareupsandbox.com/v2/loyalty/accounts", requestOptions)
                                        .then(response => response.json())
                                        .then(result => {
                                            console.log(`the loyalty account created is: ${JSON.stringify(result)}`)
                                            var account_id = result.loyalty_account.id;
                                            console.log(account_id)
                                            console.log(`account id is ${account_id}`)
                                            var idempotency_key = uuidv4();
                                            var myHeaders = {
                                                "Content-Type": "application/json",
                                                "Authorization": `Bearer ${process.env.SECRET_KEY}`
                                            };

                                            var raw = JSON.stringify({
                                                "accumulate_points": {
                                                    "points": 29
                                                },
                                                "idempotency_key": idempotency_key,
                                                "location_id": location_id
                                            });

                                            var requestOptions = {
                                                method: 'POST',
                                                headers: myHeaders,
                                                body: raw
                                            };
                                            //accumulate loyalty points for customer
                                            fetch(`https://connect.squareupsandbox.com/v2/loyalty/accounts/${account_id}/accumulate`, requestOptions)
                                                .then(response => response.text())
                                                .then(result => {
                                                    console.log(result)
                                                    res.statusCode = 200;
                                                    res.setHeader('Content-Type', 'text/plain');
                                                    res.end("29 points accumulated");
                                                })
                                                .catch(err => {
                                                    res.statusCode = 500
                                                    res.end(`there was a problem with points accumulation due to the following error: ${err}`)
                                                });
                                        })
                                        .catch(err => {
                                            res.statusCode = 500
                                            res.end(`there was a problem creating new loyalty account fr customer due to the following error: ${err}`)
                                        });
                                })
                        } else {
                            console.log(`result is ${JSON.stringify(response)}`)
                            var account_id = response.loyalty_accounts.find(account => account.program_id == loyalty_program_id).id
                            console.log(`account id is ${account_id}`)
                            var idempotency_key = uuidv4();
                            var myHeaders = {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${process.env.SECRET_KEY}`
                            };

                            var raw = JSON.stringify({
                                "accumulate_points": {
                                    "points": 29
                                },
                                "idempotency_key": idempotency_key,
                                "location_id": location_id
                            });

                            var requestOptions = {
                                method: 'POST',
                                headers: myHeaders,
                                body: raw
                            };

                            fetch(`https://connect.squareupsandbox.com/v2/loyalty/accounts/${account_id}/accumulate`, requestOptions)
                                .then(response => response.text())
                                .then(result => {
                                    console.log(result)
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'text/plain');
                                    res.end("29 points accumulated");
                                })
                                .catch(err => {
                                    res.statusCode = 500
                                    res.end(`there was a problem with points accumulation due to the following error: ${err}`)
                                });
                        }
                    })
                    .catch(err => {
                        res.statusCode = 500
                        res.end(`there was a problem with account search in loyalty programs due to the following error: ${err}`)
                    })
            })
            .catch(err => {
                res.statusCode = 500
                res.end(`there was a problem with subscription details retrieval due to the following error: ${err}`)
            })
    })

module.exports = updatedRouter