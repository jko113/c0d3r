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
    if (req.session.passport){
        res.send(`WELCOME ${req.session.passport.user.username}!`)
    } else {
        res.send('Welcome!')
    }
});



// redirected here from login using the functions in auth
// the stuff after the else will be handled through res.render and allow for user to input in form format
// will also make the remake the function after .then as a named function passed in
app.get('/newprofile', ensureAuthenticated, (req, res) => {
    var userSession = req.session.passport.user
    // console.log(userSession._raw);
    // console.log(rawParsed)
    console.log(typeof userSession.id)
    console.log(userSession.id + ' LOOK FOR ME!!!')
    console.log(typeof Number(userSession.id))
    db.getUserByGithubId(Number(userSession.id))
        .then((data) => {
        console.log(data)
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
                   name: userSession.displayName,
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
    var githubid = Number(req.body.githubid)
    var zip = Number(req.body.zip_code)
    console.log('!!!!!!!!!!!!!!!!!!!!!');
    console.log(typeof githubid);
    console.log(typeof zip);
    // console.log(typeof new Date());
    // console.log(Date.parse(new Date()));
    db.addUser(req.body.alias, githubid, req.body.name, req.body.gitURL, req.body.employer, req.body.city, req.body.state, zip, new Date(), true, true, true, 'Hey')
        .then((data) => {
            // res.send(data)
            res.redirect('/');
        })
        .catch(console.log);
});

app.get('/setup', ensureAuthenticated, (req, res) => {
    res.send(req.session.passport.user)
});

app.get('/search', (req, res) => {
    res.render('search')
});

app.post('/search', (req, res) => {
    res.redirect('/')
});


app.get('/home', (req, res) => {
    db.getAllUsers()
    .then
        res.render('home', data)
    .catch(console.log)
});


app.get('/messages', (req, res) => {
    res.render('messages')
});
app.post('/messages', (req, res) => {
    res.render('messages')
});


app.get('/messages/new', (req, res) => {
    res.render('messages-new')
});
app.post('messages/new', (req, res) => {
    res.redirect('/messages')``
});



app.listen(5000, () => {
    console.log('Someones here');
});