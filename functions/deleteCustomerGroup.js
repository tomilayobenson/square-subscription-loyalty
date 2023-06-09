const fetch = require('node-fetch');
const deleteCustomerGroup = (customer_id,membership_group_id ) => {
    var myHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SECRET_KEY}`
    };
    var requestOptions = {
        method: 'DELETE',
        headers: myHeaders
    }
    return fetch(`https://connect.squareup.com/v2/customers/${customer_id}/groups/${membership_group_id}`, requestOptions)
}
module.exports = deleteCustomerGroup