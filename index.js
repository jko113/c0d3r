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
    // var raw = (req.session.passport.user._raw)
    // raw = (JSON.parse(raw))
    // res.send(raw)
    console.log('here');
    if (req.session.passport){
        res.send(`WELCOME ${req.session.passport.user.username}!`);
    } else {
        // res.send('Welcome!')
        res.sendFile(__dirname + '/public/frontpage.html');
    }
});



// redirected here from login using the functions in auth
// the stuff after the else will be handled through res.render and allow for user to input in form format
// will also make the remake the function after .then as a named function passed in
app.get('/newprofile', ensureAuthenticated, (req, res) => {
    var userSession = req.session.passport.user
    // console.log(userSession._raw);
    // console.log(rawParsed);
    db.getUserByGithubId(userSession.id)
    .then((data) => {
        if(data){
            console.log('data exists');
            res.redirect('/')
        } else {
            console.log('data doesnt exist');
            // res.send(userSession)
            var rawParsed = JSON.parse(userSession._raw)
                var locArr = rawParsed.location.split(',');
                var city = locArr[0];
                var state = locArr[1];
                res.render('makeprofile', {
                   alias: userSession.username,
                   gitHubId: userSession.id,
                   username: userSession.username,
                   gitURL: userSession.profileUrl,
                   city: city,
                   state: state
                });   
            }
    });
    // console.log(req.session.passport.user.username);
    // res.send(req.session.passport.user.username);
});

app.post('/newprofile', (req, res) => {
    var githubid = parseInt(req.body.githubid)
    var zip = parseInt(req.body.zip_code)
    var newDate = new Date();
    var newDate = parseInt(newDate)
    db.addUser(req.body.alias, githubid, req.session.passport.user.username, req.body.fname, req.body.lname, req.body.gitURL, req.body.employer, req.body.city, req.body.state, zip, newDate, true, true, true, 'Hey')
        .then((data) => {
            // res.send(data)
            res.redirect('/');
        })
        .catch(console.log)
});

app.get('/setup', ensureAuthenticated, (req, res) => {
    res.send(req.session.passport.user)
})


app.listen(5000, () => {
    console.log('Someones here');
});