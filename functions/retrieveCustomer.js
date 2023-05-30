const fetch = require('node-fetch');
const retrieveCustomer = (customer_id) => {
    return fetch(`https://connect.squareupsandbox.com/v2/customers/${customer_id}`,
    {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.SECRET_KEY}`
        }
    })
    .then(response => response.json())
}
module.exports = retrieveCustomer