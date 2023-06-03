const express = require('express');
const morgan = require('morgan');
require('dotenv').config()
var createdRouter = require('./routes/createdRouter');
var updatedRouter = require('./routes/updatedRouter');
var cancelledRouter = require('./routes/cancelledRouter');

const hostname = 'localhost';
const port = 3000;
const app = express()

app.use(morgan('dev'))
app.use(express.json())

app.use('/created', createdRouter);
app.use('/updated', updatedRouter);
app.use('/cancelled', cancelledRouter);
app.use(express.static(__dirname + "/public"))
/**
     * using http
     */
// app.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });

exports.squareSub = app;