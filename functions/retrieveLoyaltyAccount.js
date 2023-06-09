const fetch = require('node-fetch');
const retrieveLoyaltyAccounts = (customer_id) => {
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
    return fetch("https://connect.squareup.com/v2/loyalty/accounts/search", requestOptions)
        .then(response => response.json())
}
module.exports = retrieveLoyaltyAccounts