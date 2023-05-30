const fetch = require('node-fetch');
const accumulateLoyaltyPoints = (idempotency_key, location_id, account_id) => {
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
    
    return fetch(`https://connect.squareupsandbox.com/v2/loyalty/accounts/${account_id}/accumulate`, requestOptions)
        .then(response => response.text())
}
module.exports = accumulateLoyaltyPoints