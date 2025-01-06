const router = require('express').Router()
const User = require('../db/user-model');
const path = require('path');
const bcrypt = require('bcrypt');
const sendOtpToMail = require('./mail-otp');

router.post('/signup', async (req, res) => {
    const data = req.body;

    if (data !== undefined) {
        const { password } = data;
        
        bcrypt.hash(password, 10).then(function(hash) {
            data.passwordHash = hash;
            
            delete data.password;
            
            const user = User(data);
            
            user.save().then(() => {
                const userMail = data.email;
                sendOtpToMail(userMail);
                console.log('User saved successfully!');
                res.render('otpVerification', { userEmail: userMail });
            }).catch((err) => {
                console.log(err.message);
                res.send({code: 501, message: 'User not saved!'})
            })
        });
    } else {
        res.send({code: 500, message: 'No data received'});
    }
});

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
});

router.post('/otp', (req, res) => {
    console.log(req.body);
    res.send({code: 404, message: "Needs to be immplemented"});
});

module.exports = router;