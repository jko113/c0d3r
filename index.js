const dotenv = require('dotenv');
dotenv.config();

const stateArray = [ 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' ];

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
        // res.send(`WELCOME ${req.session.passport.user.username}!`);
        res.redirect('home');
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
    console.log(userSession._json.avatar_url);
    console.log(userSession._json.avatar_url)
    // console.log(typeof userSession.id)
    // console.log(userSession.id + ' LOOK FOR ME!!!')
    console.log(typeof Number(userSession.id))
    db.getUserByGithubId(Number(userSession.id))
        .then((data) => {
        // console.log(data)
        if(data){
            // console.log('data exists');
            res.redirect('/home')
        } else {
            // console.log('data doesnt exist');
            // res.send(userSession)
            var rawParsed = JSON.parse(userSession._raw)
            var locArr = rawParsed.location.split(',');
            var city = locArr[0];
            var state = locArr[1];
            res.render('makeprofile', {
                alias: userSession.username,
                gitHubId: userSession.id,
                gitHubAv: userSession._json.avatar_url,
                username: userSession.username,
                name: userSession.displayName, // TODO: this isn't working
                gitURL: userSession.profileUrl,
                city: city,
                state: state,
                bio: rawParsed.bio
            });   
        }
    });
    // console.log(req.session.passport.user.username);
    // res.send(req.session.passport.user.username);
});

app.post('/newprofile', (req, res) => {
    var githubid = Number(req.body.githubid);
    var zip = Number(req.body.zip_code);
    console.log('!!!!!!!!!!!!!!!!!!!!!');
    console.log(req.body);
    console.log(req.body.tabs);
    console.log(req.body.curly_braces);
    console.log(req.body.quotes);
    // console.log(typeof new Date());
    // console.log(Date.parse(new Date()));
    db.addUser(req.body.alias, githubid, req.body.githubav, req.body.name, req.body.gitURL, req.body.employer, req.body.city, req.body.state, zip, new Date(), Number(req.body.tabs), Number(req.body.curly_braces), Number(req.body.quotes), req.body.bio)
    .then((data) => {
        // res.send(data)
        res.redirect('/home');
    })
    .catch(console.log);
});


// dunno why this is here or if it is needed !!!!!!!!!!!!!
// can revisit and reassess later as needed !!!!!!!!!!!!!!
// app.get('/setup', ensureAuthenticated, (req, res) => {

//     res.send(req.session.passport.user)
// });

app.get('/search', (req, res) => {
    res.render('search')
});

app.post('/search', (req, res) => {
    req.queryObject = generateQueryObject(req.body);
    console.log(req.queryObject);
    // res.redirect('/')

    // Helper functions
    function generateQueryObject(body) {
        let queryObject = {};
        for (let item in req.body) {
            let itemId = getId(item)[0];
            let itemTable = getId(item)[1];
            if(parseInt(itemId)){
                if(!queryObject[itemTable]) {
                    queryObject[itemTable] = []
                }
                queryObject[itemTable].push(parseInt(itemId));
                
            } else {
                if(item == 'state' && req.body[item] == 'State') {
                    queryObject[item] = '';
                } else {
                    queryObject[item] = req.body[item];
                }
            }
        }
        return queryObject;
    }
    function getId(itemName) {
        itemName = itemName.split('_');
        let id = itemName.pop();
        return [id, itemName.join('_')];
    }
});


app.get('/home', (req, res) => {
    db.getAllUsers()
        .then((data) => {
            var check = arrayIsProfile(req.session.passport.user, data)
            // console.log(check)
            return check
        })
        .then((check) => {
            console.log('LINE 114!!!!!!!!!!!!!!!!!!!!')
            console.log(check)
            res.render('home', check)
        })
        .catch(console.log)
    });

app.get('/messages', (req, res) => {
    db.getMessagesByRecipient(req.session.passport.user)
    res.render('messages')
});
app.post('/messages', (req, res) => {
    res.render('messages')
});


app.get('/messages/new', (req, res) => {
    res.render('messages-new')
});
app.post('/messages/new', (req, res) => {
    res.redirect('/messages')
});
    
app.get('/profile', ensureAuthenticated, (req, res) => {
        console.log(req.session.passport.user)
        console.log(req.session.passport.user.id)
        db.getUserByGithubId((req.session.passport.user.id))
        .then((data) => {
            console.log('LINE 142!!!!!!!!!!!!');
            console.log(data)
            res.render('profile', {
                data: data,
                isProfile: isProfile(req.session.passport.user, data)
            })
        })
})
app.post('/profile', (req, res) => {
    db.editUser(req.body.name, req.body.employer, req.body.city, req.body.state, req.body.zip_code, req.body.tabs, req.body.curly_braces, req.body.quotes, req.body.bio, req.session.passport.user.id)
        .then((data) => {
            res.redirect('/profile');
        })
});

app.get('/profile/:user_id', (req, res) => {
        db.getUserByUserId(req.params.user_id)
        .then((data) => {
            
            res.render('profile', {
                data: data,
                isProfile: null
            })
        })    
    .catch(console.log)
});



app.listen(5000, () => {
    console.log('Someones here');
});


function isProfile(session, dbUser){
    console.log(session.id)
    console.log(dbUser.github_id)
    console.log(dbUser)
    if(Number(session.id) === Number(dbUser.github_id)){
        console.log('they are the same')
        return true
    }
};

function arrayIsProfile(session, dbUser){
    var fixedArr = [];
    // console.log('LINE 171!!!!!!!!!!!!!')
    // console.log(dbUser);
    dbUser.forEach(function(data){
        // console.log(session.id);
        // console.log(data.github_id);
        if(Number(session.id) !== Number(data.github_id)){
            fixedArr.push(data);
        }
    })
    return fixedArr;
};