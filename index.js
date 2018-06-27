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


// need to handle 
app.get('/', (req, res) => {
    var raw = (req.session.passport.user._raw)
    raw = (JSON.parse(raw))
    res.send(raw)
    // res.send(`WELCOME ${req.session.passport.user.username}!`)
});



// redirected here from login using the functions in auth
// the stuff after the else will be handled through res.render and allow for user to input in form format
// will also make the remake the function after .then as a named function passed in
app.get('/newprofile', (req, res) => {
    var userSession = req.session.passport.user
    var rawParsed = JSON.parse(userSession.raw)
    db.getUserByGithubId(userSession.id)
        .then((data) => {
            if(data){
                res.redirect('/')
            } else {
                var locArr = rawParse.location.split(',');
                var city = locArr[0];
                var state = locArr[1];
                res.render('homepage',{
                   alias: userSession.username,
                   gitHubId: userSession.id,
                   username: userSession.username,
                   gitURL: userSession.profileUrl,
                   city: city,
                   state: state
                }) 
                db.addUser(userSession.username, userSession.id, userSession.username, userSession.displayName, userSession.displayName, userSession.profileUrl, null, null, null, null, new Date(), null, null, null, null)
                res.send(userSession)    
            }
    });
    // console.log(req.session.passport.user.username);
    // res.send(req.session.passport.user.username);
});

app.get('/setup', ensureAuthenticated, (req, res) => {
    res.send(req.session.passport.user)
})


app.listen(5000, () => {
    console.log('Someones here');
});