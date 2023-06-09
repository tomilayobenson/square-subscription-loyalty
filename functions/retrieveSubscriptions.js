const fetch = require('node-fetch');
const retrieveSubscriptions = (subscription_id) => {
    var myHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SECRET_KEY}`
    };

    var requestOptions = {
        method: 'GET',
        headers: myHeaders
    };
    return fetch(` https://connect.squareup.com/v2/subscriptions/${subscription_id}`, requestOptions)
        .then(response => response.json())
}

module.exports = retrieveSubscriptions;