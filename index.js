const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user-routes');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use('/users', userRoutes);

mongoose.connect('mongodb://localhost:27017/rfp')
    .then(() => {
        app.listen(3000, '0.0.0.0', () => {
            console.log("Listening on http://localhost:3000 ...");
        });
    })
    .catch((err) => {
        console.log("Connection failed: " + err.message);
    });
