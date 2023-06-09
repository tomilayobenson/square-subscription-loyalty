
const nodemailer = require('nodemailer')

const sendEmail = (customer_id, first_name, last_name, email, err) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      var mailOptions = {
        from: process.env.EMAIL,
        to: 'tomilayoafolabi@gmail.com',
        subject: `Client Error from Adoniaa Membership Application - ${customer_id}`,
        html: `<h3>Error Message</h3><p>Customer Id: ${customer_id}</p><p>Customer Name: ${first_name} ${last_name}</p><p>Email: ${email}</p><p>${err}</p>`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log('email not sent due to:' + error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

module.exports = sendEmail