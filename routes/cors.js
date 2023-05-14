const cors = require('cors');
const whitelist = ['http://localhost:3000','http://localhost:3001','https://wonderful-gumdrop-6ce085.netlify.app'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if (whitelist.indexOf(req.header('Origin'))!== -1) {
        corsOptions = {origin:true};
    }else {
        corsOptions={origin:false}
    }
    callback(null,corsOptions)
}

exports.cors = cors()
exports.corsWithOptions = cors(corsOptionsDelegate)