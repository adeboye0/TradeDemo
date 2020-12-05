const express = require('express');
const cors = require('cors');
const webRoute = require('./routes/web');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const viewEngine = require("ejs-blocks");
const flash = require('express-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session)
const cookieParser = require('cookie-parser');


const mongoose = require('mongoose');

const app = express();

var port = process.env.PORT || 5000;

require('dotenv').config();

app.engine('ejs', viewEngine);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('keyboard cat'));
app.use(session({
    cookie: { maxAge: 8 * 60 * 60 * 1000 },
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(flash());
app.use(express.static('./public'));


mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(() => console.log('MongoDb connected')).catch(err => console.log(err));


app.use(function(req, res, next) {
    res.locals.baseHost = req.protocol + '://' + req.hostname;
    res.locals.Request = {
        query: req.query,
        params: req.params
    };
    console.log((new Date).toLocaleString() + ' - ', req.method + ': ' + res.locals.baseHost + req.url)
    next();
});


app.use('/', webRoute);

app.listen(port, function() {
    console.log("Server started on port " + port);
})