const fetch = require('node-fetch');
const createLoyaltyAccount = (idempotency_key, isoString, customer_id,loyalty_program_id, phone_number) => {
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
    
    return fetch("https://connect.squareupsandbox.com/v2/loyalty/accounts", requestOptions)
        .then(response => response.json())
}
module.exports = createLoyaltyAccount