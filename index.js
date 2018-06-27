const dotenv = require('dotenv');
dotenv.config();


const db = require('./db');
const express = require('express');
const app = express();
const setupAuth = require('./auth');
const ensureAuthenticated = require('./auth').ensureAuthenticated;
const expressHbs = require('express-handlebars');
const bodyParser = require('body-parser');

app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

const static = express.static;
app.use(static('public'));
setupAuth(app);
app.use(bodyParser.urlencoded({ extended: false }))



app.get('/', (req, res) => {
    res.send('Sign In');
    // console.log(req.session.passport.user.username);
    // res.send(req.session.passport.user.username);
});

app.get('/setup', ensureAuthenticated, (req, res) => {
    res.send(req.session.passport.user)
})


app.listen(5000, () => {
    console.log('Someones here');
});