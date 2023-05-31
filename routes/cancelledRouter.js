const express = require('express')
const cors = require('./cors');
const deleteCustomerGroup = require('../functions/deleteCustomerGroup');
const sendEmail = require('../functions/sendEmail');

const cancelledRouter = express.Router()

cancelledRouter.route('/')
    .post((req, res) => {
        const subscriptionStatus = req.body.data.object.subscription.status
        const subscription_plan_id = process.env.SUBSCRIPTION_PLAN_ID
        const customer_plan_id = req.body.data.object.subscription.plan_id
        const first_name ="Not provided"
        const last_name ="Not provided"
        const email = "Not provided"
        if ((subscriptionStatus !== "ACTIVE") && (customer_plan_id === subscription_plan_id)) {
            const customer_id = req.body.data.object.subscription.customer_id;
            const membership_group_id = process.env.MEMBERSHIP_GROUP_ID

            deleteCustomerGroup(customer_id, membership_group_id)
                .then(response => {
                    console.log('customer deleted from group')
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end("customer deleted from group");
                })
                .catch(err => {
                    res.statusCode = 500
                    sendEmail(customer_id, first_name, last_name, email, `there was a problem with deleting group from the customer due to the following error: ${err}`)
                    res.end(`there was a problem with deleting group from the customer due to the following error: ${err}`)
                });
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Status is still active or this is not the adoniaa membership plan subscription");
        }
    })

module.exports = cancelledRouter