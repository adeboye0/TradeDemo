const express = require('express');
const router = express.Router();
const auth = require('./route-config').auth;
const notAuth = require('./route-config').notAuth;
const Controller = require('./route-config').Controller;
const multer = require('./route-config').multer;

router.route('/').get(auth, Controller.Home.index);

router.route('/auth').get(notAuth, Controller.Auth.index);

router.route('/register').post(notAuth, Controller.Auth.register);
router.route('/login').post(notAuth, Controller.Auth.login);

router.route('/confirmation/:token').get(notAuth, Controller.Auth.confirmation);

router.route('/product/:id').get(auth, Controller.Product.product);

router.route('/product/comment/:id').post(auth, Controller.Product.comment);


router.route('/product/reply/:pid/:id').post(auth, Controller.Product.reply);

router.route('/upload-product').get(Controller.Product.index);


router.route('/upload-product').post(auth, multer.single('image'), Controller.Product.uploadProduct);

router.route("/logout").get(Controller.Auth.logout);

module.exports = router;