const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Token = require('../models/token');
const jwt = require('jsonwebtoken');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = {
    index: async function(req, res) {
        res.render('auth/auth', {
            data: req.session.authUser,
        });
    },

    register: function(req, res) {
        const { name, email, password, address, phone, lat, long } = req.body;
        if (!name || !email || !password || !address || !phone || !lat || !long) {
            return res.json({ status: 'error', msg: 'Fill in all fields' });
        }

        User.findOne({ email }).then(user => {
            if (user) return res.json({ status: 'error', msg: 'User Already Exists' });

            const newUser = new User({
                name,
                email,
                password,
                address,
                lat,
                long,
                phoneNumber: phone
            })


            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save().then(user => {
                        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

                        token.save(function(err) {
                            if (err) { return res.json({ status: 'error', msg: err.message }); }

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
                            var mailOptions = { from: 'no-reply@tradeDemo.com', to: user.email, subject: 'Account Verification', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token };
                            transporter.sendMail(mailOptions, function(err) {
                                if (err) { return res.json({ status: 'error', msg: err.message }); }
                                res.send(JSON.stringify({ status: 'OK', intended: '/login' }))
                            });
                        });


                    }).catch(err => {
                        return res.json({ status: 'error', msg: 'Error Occured' });
                    })
                })
            })
        })
    },

    login: function(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ status: 'error', msg: 'Fill in all fields' });
        }
        User.findOne({ email }).then(user => {
            if (!user) return res.json({ status: 'error', msg: 'User Does Not Exist' });

            bcrypt.compare(password, user.password).then(isMatch => {
                if (!isMatch) return res.json({ status: 'error', msg: 'Wrong Password' });

                if (!user.isVerified) {
                    var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

                    token.save(function(err) {
                        if (err) { return res.json({ status: 'error', msg: err.message }); }

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
                        var mailOptions = { from: 'no-reply@tradeDemo.com', to: user.email, subject: 'Account Verification', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token };
                        transporter.sendMail(mailOptions, function(err) {
                            if (err) { return res.json({ status: 'error', msg: err.message }); }
                        });
                    });

                    return res.json({ status: 'error', msg: 'Account not Verified, Verification code was resent to your email' });
                }

                jwt.sign({ id: user._id },
                    process.env.jwtSecret,
                    (err, token) => {
                        if (err) throw err;

                        var authUser = user;
                        authUser.id = user._id;
                        authUser.check = true;

                        // Sets user session
                        req.session.authUser = authUser;
                        console.log(authUser)
                        res.cookie('uid', user._id, { maxAge: 864000 * 1000 });

                        var data = {
                            status: 'OK',
                            intended: req.session.intended ? req.session.intended : `/`,
                            token: token
                        };
                        res.send(JSON.stringify(data));
                        console.log(token);
                    }
                )
            })

        })
    },

    confirmation: function(req, res) {
        Token.findOne({ token: req.params.token }, function(err, token) {
            if (!token) return res.json({ status: 'error', msg: 'We were unable to find a valid token. Your token my have expired.' });

            User.findOne({ _id: token._userId }, function(err, user) {
                if (!user) return res.json({ status: 'error', msg: 'Unable to find a user for this token.' });
                if (user.isVerified) return res.json({ status: 'error', msg: 'This user has already been verified.' });

                user.isVerified = true;
                user.save(function(err) {
                    if (err) { return res.json({ status: 'error', msg: err.message }); }
                    req.flash('success', 'User has been verified. Please login');
                    return res.redirect('/auth')
                });
            });
        });
    },

    logout: function(req, res) {
        res.locals.authUser = null;
        req.session.authUser = null;
        res.clearCookie("uid");
        return res.redirect("/auth");
    },

}