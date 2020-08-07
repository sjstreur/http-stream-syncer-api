const cors = require('cors');

function setCORSsettings(app) {
    app.use(cors({ origin: '*' }));
    // Settings for CORS
    app.use(function (req, res, next) {
        
        // Website you wish to allow to connect
        res.header('Access-Control-Allow-Origin', '*');
        
        // Request methods you wish to allow
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        
        // Request headers you wish to allow
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        
        // Pass to next layer of middleware
        next();
    });
}

module.exports = {
    setCORSsettings
};