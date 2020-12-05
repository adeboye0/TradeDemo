const Product = require("../models/product");
const User = require('../models/user');

module.exports = {
    index: async function(req, res) {
        try {
            var authUser = req.session.authUser;
            var user = await User.findById(authUser._id).select('-password').then(user => user);

            var METERS_PER_MILE = 1609.34
            Product.find({ location: { $nearSphere: { $geometry: { type: "Point", coordinates: [user.long, user.lat] }, $maxDistance: 5 * METERS_PER_MILE } } }).then(product => {
                res.render('app/app', {
                    data: req.body,
                    data: req.session.authUser,
                    product
                });
            });
        } catch (error) {
            console.log(error)
        }
    },
}