const Product = require('../models/product');
const User = require('../models/user');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
const { promisify } = require('util');
const db = require('../config/firestore').db;

var nodemailer = require('nodemailer');

const unlinkAsync = promisify(fs.unlink)
require('../config/cloudinary');


module.exports = {
    index: function(req, res) {
        var authUser = req.session.authUser
        res.render('app/upload-product', {
            data: req.body,
            data: req.session.authUser
        });
    },

    uploadProduct: async function(req, res) {
        var { name, description, address, lat, long } = req.body;
        if (!name || !description || !address || !long || !lat) {
            return res.json({ status: 'error', msg: 'Fill in all fields' });
        }

        try {
            var authUser = req.session.authUser;

            var user = await User.findById(authUser._id).select('-password').then(user => user);
            const result = await cloudinary.uploader.upload(req.file.path, {
                use_filename: true,
                folder: 'products',
                unique_filename: false
            })
            const newProduct = new Product({
                name,
                description,
                imageUrl: result.secure_url,
                location: { type: 'Point', coordinates: [+long, +lat] },
                address: address,
                user_name: user.name,
                user_email: user.email,
                user_phoneNumber: user.phoneNumber,
            });
            newProduct.save().then(async product => {

                await db.collection("products").add({
                        name,
                        description,
                        imageUrl: result.secure_url,
                        location: { type: 'Point', coordinates: [+long, +lat] },
                        address: address,
                        user_name: user.name,
                        user_email: user.email,
                        user_phoneNumber: user.phoneNumber,
                    }

                );

                res.json({ status: 'success', msg: 'Product Uploaded' })
            }).catch(err => {
                if (err) throw err;
                res.status(400).json({ msg: 'Error Occured, Please try again later' })
            });
            await unlinkAsync(req.file.path);
        } catch (err) {
            console.log(err);
        }
    },

    product: function(req, res) {
        const { id } = req.params;
        if (id) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                Product.findById(id).then(product => {
                    return res.render('app/product', {
                        data: req.body,
                        product
                    });
                }).catch(err => console.log(err));
            } else {
                return res.status(400).json({ msg: 'Invalid Id' });
            }
        }

    },

    comment: async function(req, res) {
        const { id } = req.params;
        if (id) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                var authUser = req.session.authUser;
                var comment_id = ObjectId();
                Product.update({
                    "_id": id
                }, {
                    $push: {
                        "comments": { _id: comment_id, name: authUser.name, email: authUser.email, phoneNumber: authUser.phoneNumber, comment: req.body.comment }
                    }
                }).then(data => {
                    res.send({
                        status: "success",
                        id: data.insertedId
                    })
                }).catch(err => { console.log(err) })
            } else {
                return res.status(400).json({ msg: 'Invalid Id' });
            }
        }
    },

    reply: async function(req, res) {
        const { pid, id } = req.params;
        if (id) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                var authUser = req.session.authUser;
                var reply_id = ObjectId();
                Product.update({
                    "_id": pid,
                    "comments._id": ObjectId(id)
                }, {
                    $push: {
                        "comments.$.replies": {
                            _id: reply_id,
                            name: authUser.name,
                            reply: req.body.reply

                        }
                    }
                }).then(data => {
                    const Nexmo = require('nexmo');

                    const nexmo = new Nexmo({
                        apiKey: '78a8008c',
                        apiSecret: 'z4bzi9QJVFYZbOtB',
                    });

                    const from = 'Trade Demo';
                    const to = '234' + req.body.phoneNumber;
                    const text = authUser.name + ' has replied on your comment';

                    nexmo.message.sendSms(from, to, text);
                    console.log("SMS Sent");

                    var transporter = nodemailer.createTransport({
                        host: 'kilonsele.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: 'support@kilonsele.com',
                            pass: 'DatGiga2019@'
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });
                    var mailOptions = { from: 'no-reply@tradeDemo.com', to: req.body.email, subject: 'New Reply', text: authUser.name + ' has replied on your comment' };
                    transporter.sendMail(mailOptions, function(err) {
                        if (err) { return res.json({ status: 'error', msg: err.message }); }
                        console.log("Email Sent")
                    });
                    res.send({
                        status: "success",
                        id: data.insertedId
                    })
                }).catch(err => { console.log(err) })
            } else {
                return res.status(400).json({ msg: 'Invalid Id' });
            }
        }
    },


}