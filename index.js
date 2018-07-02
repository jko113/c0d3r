

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
const port = 5000;

app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

const static = express.static;
app.use(static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.urlencoded({
//     extended: true
// }));
// app.use(bodyParser.json());
setupAuth(app);

// need to handle 
app.get('/', (req, res) => {
    // var raw = (req.session.passport.user._raw)
    // raw = (JSON.parse(raw))
    // res.send(raw)
    // console.log('here');
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
    db.getUserByGithubId(Number(userSession.id))
        .then((data) => {
            if(data){
                res.redirect('/home');
            } else {
                let userStateArray = [];
                stateArray.forEach(state => {
                    let stateEntry = {}
                        stateEntry = {
                            name: state
                        };
                    userStateArray.push(stateEntry);
                });
                let languages = db.getLanguages();
                let editors = db.getEditors();
                let curlies = db.getCurlyPrefs();
                let quotes = db.getQuotePrefs();
                let tabsPre = db.getTabsPrefs();
                Promise.all([languages, editors, curlies, quotes, tabsPre])
                    .then((moreData) => {
                        // console.log(moreData);
                        var rawParsed = JSON.parse(userSession._raw);
                        var locArr = rawParsed.location.split(',');
                        var city = locArr[0];
                        var state = locArr[1];
                        res.render('makeprofile', {
                            alias: userSession.username,
                            state: userStateArray,
                            gitHubId: userSession.id,
                            gitHubAv: userSession._json.avatar_url,
                            username: userSession.username,
                            name: userSession.displayName,
                            gitURL: userSession.profileUrl,
                            city: city,
                            bio: rawParsed.bio,
                            language: moreData[0],
                            editors: moreData[1],
                            curlies: moreData[2],
                            quotes: moreData[3],
                            tabsPref: moreData[4]

                        });   
                    })
                    .catch(console.log)
                    }
                });
    
    // console.log(req.session.passport.user.username);
    // res.send(req.session.passport.user.username);
});

app.post('/newprofile', (req, res) => {
    // let githubid = Number(req.body.githubid);
    let newBody = generateConvertedObject(req.body);
    // console.log(newBody);
    let zip = Number(req.body.zip_code);
    let userSession = req.session.passport.user;
    // console.log(userSession)
    let quotes = newBody.single_quotes_preference;
    let tabs = req.body.tabs_preference;
    let lines = req.body.same_line_curlies_preference;
    if(!quotes){
        quotes = 3
    }if(!tabs){
        tabs = 3
    }if(!lines){
        lines = 3
    }if(!zip){
        zip = null
    }
        db.addUser(userSession.username, userSession.id, userSession._json.avatar_url, newBody.name, userSession.profileUrl, newBody.employer, newBody.city, newBody.state, zip, new Date(), Number(tabs), Number(lines), Number(quotes), newBody.bio)
        .then((data) => {
            db.getUserByGithubId(userSession.id)
            .then((data) => {
                let user_id = data.user_id
                if (newBody.editor && newBody.language){
                    db.editUserEditors(user_id, newBody.editor)
                    .then((data) => {
                        db.editUserLanguages(user_id, newBody.editor)
                        .then((data) => {})
                        .catch(console.log)
                    })
                    .catch(console.log)
                } else {
                    if(newBody.language && !newBody.editor){
                        db.editUserLanguages(user_id, newBody.language)
                        .catch(console.log)
                    } else {

                        if(!newBody.language && newBody.editor){
                            db.editUserEditors(user_id, newBody.editor)
                            .catch(console.log)
                        }
                    }
                }
                res.redirect('/home')
                })
                .catch(console.log)
            })
            .catch(console.log)
    })

app.get('/search', ensureAuthenticated, (req, res) => {

    const userData = req.session.passport.user;
    const github_id = userData.id;

    // check if user exists in database
    db.checkUserExistence(github_id)
        .then((data) => {
            if (data && data.length) {
                const isRegistered = data[0].user_exists;
                // render search page if user exists
                if (isRegistered) {
                    const internalId = data[0].user_id;
                    // Search route code here
                    let tabPrefsPromise = db.getTabsPrefsList();
                    let quotesPrefsPromise = db.getQuotesPrefsList();
                    let curlyPrefsPromise = db.getCurlyPrefsList();
                    let languagePrefsPromise = db.getLanguages();
                    let editorPrefsPromise = db.getEditors();
                    Promise.all([curlyPrefsPromise, quotesPrefsPromise, tabPrefsPromise, languagePrefsPromise, editorPrefsPromise])
                        .then(moreData => {
                            console.log(moreData[2]);
                            res.render('search', {
                                user_id: internalId,
                                state: stateArray,
                                curlyPrefs: moreData[0],
                                quotesPrefs: moreData[1],
                                tabsPrefs: moreData[2],
                                language: moreData[3],
                                editor: moreData[4]
                            });
                        })
                        .catch(console.error);

                // otherwise, redirect to root
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        })
        .catch(console.error);
});

app.post('/search', (req, res) => {
    req.queryObject = generateConvertedObject(req.body);
    // console.log(req.queryObject);
    if(req.body.searchType == 'and') {
        db.andSearch(req.queryObject)
            .then((data) => {
                res.render('home', {
                    data: data,
                    isSearchResults: true
                });
            })
            .catch(console.log);
    } else {
        db.orSearch(req.queryObject)
            .then((data) => {
                // console.log(data);
                res.render('home', {
                    data: data,
                    isSearchResults: true
                });
            })
            .catch(console.error);
    }
});

app.get('/home', ensureAuthenticated, (req, res) => {
    const userData = req.session.passport.user;
    const github_id = userData.id;

    db.checkUserExistence(github_id)
        .then((data) => {

            if (data && data.length) {

                const isRegistered = data[0].user_exists;
    
                // render home page if user exists
                if (isRegistered) {
                    const internalId = data[0].user_id;
                
                    db.getRandomUsers(internalId, 5)
                        .then((randomUsersArray) => {
                            randomUsersArray.forEach(function(data){
                                data.join_date = formatDateTime(data.join_date);
                            });
                            res.render('home', {
                                data: randomUsersArray,
                                isSearchResults: false
                            });
                        })
                    .catch(console.log)
                
                // otherwise redirect to login page
                } else {
                    res.redirect('/login');
                }
            } else {
                res.redirect('/login');
            }
    });
});

app.post('/home', (req, res) => {
    const userData = req.session.passport.user;
    const github_id = userData.id;

    db.checkUserExistence(github_id)
        .then((data) => {

            if (data && data.length) {

                const isRegistered = data[0].user_exists;
    
                // render home page if user exists
                if (isRegistered) {
                    const internalId = data[0].user_id;
                
                    db.getRandomUsers(internalId, 5)
                        .then((randomUsersArray) => {

                            randomUsersArray.forEach(function(data){
                                data.join_date = formatDateTime(data.join_date);
                            });
                            console.log(randomUsersArray.length)
                            res.render('home', {
                                data: randomUsersArray,
                                isSearchResults: false
                            });
                        })
                        .catch(console.log)
                
                // otherwise redirect to login page
                } else {
                    res.redirect('/login');
                }
            } else {
                res.redirect('/login');
            }
        })
})

app.get('/messages', ensureAuthenticated, (req, res) => {
    const userData = req.session.passport.user;
    const github_id = userData.id;

    // check if user exists in database
    db.checkUserExistence(github_id)
        .then((data) => {

            if (data && data.length) {

                const isRegistered = data[0].user_exists;
    
                // render messages page if user exists
                if (isRegistered) {
                    const internalId = data[0].user_id;
                    db.getMessagesByRecipient(internalId)
                        .then( (receivedMessages) => {
                            receivedMessages.forEach((message, index) => {
                                // message.date_time = message.date_time.toString();
                                message.date_time = formatDateTime(message.date_time);
                            });

                            db.getMessagesBySender(internalId)
                               
                                .then(sentMessages => {

                                    sentMessages.forEach((message, index) => {
                                        message.date_time = message.date_time.toString();
                                    });
                                    let messageObject = {};
                                    messageObject.sent = sentMessages;
                                    messageObject.received = receivedMessages;

                                    res.render('messages', {
                                        messages: messageObject
                                    });
                                })
                                .catch(console.error);
                        })
                        .catch(console.error);

                // otherwise, redirect to root
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        })
        .catch(console.error);

});
app.post('/messages', (req, res) => {
    res.render('messages')
});

app.get('/messages/new', ensureAuthenticated, (req, res) => {
    // res.render('messages-new')
    const userData = req.session.passport.user;
    const github_id = userData.id;

    // check if user exists in database
    db.checkUserExistence(github_id)
        .then((data) => {

            if (data && data.length) {

                const isRegistered = data[0].user_exists;
    
                // render new messages page if user exists
                if (isRegistered) {
                    const internalId = data[0].user_id;
                    res.render('messages-new', {
                        user_id: internalId
                    })

                // otherwise, redirect to root
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        })
        .catch(console.error);
});

app.post('/messages/new', (req, res) => {
    const postedObject = req.body;
    // console.log(postedObject);
    const recipients = postedObject.recipients;
    const message = postedObject.message;
    const author_id = Number(postedObject.user_id);
    // console.log(author_id);
    let recipientIds = [];

    // make sure recipients and message have both been entered before attempting to send
    if (recipients && message) {
        let recipientsArray = recipients.split(' ');
        let cleanedArray = recipientsArray.map((recipient) => {
            return recipient.replace(',','');
        });

        db.getUserIdsByGitHubAliasArray(cleanedArray)
            .then((userIds) => {
                userIds.forEach((item) => {
                    recipientIds.push(item.user_id);
                });
                // console.log(recipientIds);
                db.sendMessage(author_id, recipientIds, message)
                    .then((sentSuccessfully) => {
                        if (sentSuccessfully) {
                            res.render('messages-new', {
                                justSentMessage: true,
                                user_id: author_id
                            });
                        } else {
                            res.render('messages-new', {
                                messageFailed: true,
                                user_id: author_id
                            });
                        }
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    } else {
        res.redirect('/messages');
    }

});
    
app.get('/profile', ensureAuthenticated, (req, res) => {
    db.getUserByGithubId(req.session.passport.user.id)
        .then(data => {
            displayProfile(data, req, res)
        })
        .catch(console.log);
});

app.post('/profile', (req, res) => {
    // console.log(req.body);
    let newBody = generateConvertedObject(req.body);
    // console.log(newBody);
    let userSession = req.session.passport.user;
    let editUserPromise = db.editUser(newBody.name, newBody.employer, newBody.city, newBody.state, newBody.zip, newBody.tabs_preference, newBody.same_line_curlies_preference, newBody.single_quotes_preference, newBody.bio, userSession.id)
    let editLanguagesPromise = db.editUserLanguages(newBody.user_id, newBody.languages);
    let editEditorsPromise = db.editUserEditors(newBody.user_id, newBody.editors);
    Promise.all([editUserPromise, editLanguagesPromise, editEditorsPromise])
        .then((data) => {
                // console.log()
                res.redirect('/profile');
            })
            .catch(console.log);
});

app.get('/profile/:user_id', (req, res) => {
    db.getUserByUserId(req.params.user_id)
        .then(data => {
            displayProfile(data, req, res)
        })
        .catch(console.log)
});

app.listen(port, () => {
    console.log(`Application running at http://localhost:${port}`);
});


function isProfile(session, dbUser){
    // console.log(session.id)
    // console.log(dbUser.github_id)
    // console.log(dbUser)
    if (Number(session.id) === Number(dbUser.github_id)) {
        // console.log('they are the same')
        return true
    } else {
        return null;
    }
};

function formatDateTime(dateTime) {
    let stringDate = dateTime.toString();
    let idx = stringDate.indexOf('GMT');
    let formattedDate = stringDate.slice(0, idx - 1);
    return formattedDate;
}

function arrayIsProfile(session, dbUser){
    var fixedArr = [];
    // console.log('LINE 171!!!!!!!!!!!!!')
    // console.log(dbUser);
    dbUser.forEach(function(data){
        // console.log(session.id);
        // console.log(data.github_id);
        if (Number(session.id) !== Number(data.github_id)) {
            fixedArr.push(data);
        }
    })
    return fixedArr;
};

function generateConvertedObject(body) {
    let propertiesToConvertToNumber = ['zip', 'tabs_preference', 'same_line_curlies_preference', 'single_quotes_preference']
    let queryObject = {};
    for (let item in body) {
        let itemId = getId(item)[0];
        let itemTable = getId(item)[1];
        if(parseInt(itemId)){
            if(!queryObject[itemTable]) {
                queryObject[itemTable] = []
            }
            queryObject[itemTable].push(parseInt(itemId));
        } else {
            if(item != 'searchType' && body[item] != 'State' && body[item] != '') {
                if (propertiesToConvertToNumber.includes(item)) {
                    queryObject[item] = Number(body[item]);
                } else {
                    queryObject[item] = body[item];
                }
            }
        }
    }
    return queryObject;
    // Internal helper function for generateConvertedObject
    function getId(itemName) {
        itemName = itemName.split('_');
        let id = itemName.pop();
        return [id, itemName.join('_')];
    }
}

function displayProfile(data, req, res) {
    // if user is authenticated, render the profile page
    if(data) {
        let curlyPrefs = db.getUserCurlyPrefs(data.user_id);
        let quotesPrefs = db.getUserQuotesPrefs(data.user_id);
        let tabsPrefs = db.getUserTabPrefs(data.user_id);
        let languages = db.getUserLanguages(data.user_id);
        let editors = db.getUserEditors(data.user_id);
        Promise.all([curlyPrefs, quotesPrefs, tabsPrefs, languages, editors])
            .then(moreData => {
                // console.log(data);
                // console.log(moreData[0]);
                // console.log(moreData[4]);
                let userStateArray = [];
                stateArray.forEach(state => {
                    let stateEntry = {}
                    if(state == data.state) {
                        stateEntry = {
                            name: state,
                            userPref: true
                        };
                    } else {
                        stateEntry = {
                            name: state,
                            userPref: false
                        };
                    }
                    userStateArray.push(stateEntry);
                });
                // console.log('logging tabsprefs');
                // console.log(moreData[2]);
                // console.log(data);
                res.render('profile', {
                    data: data,
                    state: userStateArray,
                    isProfile: isProfile(req.session.passport.user, data),
                    curlyPrefs: moreData[0],
                    quotesPrefs: moreData[1],
                    tabsPrefs: moreData[2],
                    language: moreData[3],
                    editor: moreData[4]
                })
            })
            .catch(console.log);
    // otherwise, redirect to login page
    } else {
        res.redirect('/login');
    }
}