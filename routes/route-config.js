const fs = require('fs');
const jwt = require('jsonwebtoken');
const Multer = require('multer');
const path = require('path');
require('dotenv').config;


const storage = Multer.diskStorage({
    destination: path.join(__dirname, '../tmp/upload'),

    filename: function(req, file, cb) {
        cb(null, path.extname(file.originalname) + '-' + Date.now())
    }
})
module.exports.multer = Multer({ storage });

module.exports.notAuth = (req, res, next) => {
    if (req.session.authUser) {
        return res.redirect('/')
    }
    next()
}

module.exports.auth = (req, res, next) => {
    req.session.intended = null;
    if (!req.session.authUser) {
        req.session.intended = req.url;
        return res.redirect('/auth')
    }
    next()
}


let Controller = {};
const ctrPath = __dirname + '/../controllers/';
const ctrFiles = fs.readdirSync(ctrPath);
for (let ctr of ctrFiles) {
    if (fs.statSync(ctrPath + ctr).isDirectory()) continue;
    Controller[/.+(?=\.\w?)/.exec(ctr)[0]] = require(ctrPath + ctr)
}
module.exports.Controller = Controller