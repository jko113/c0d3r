const pgp = require('pg-promise')();
const cn = {
    host: 'localhost',
    port: 5432,
    database: 'c0d3r',
    user: 'postgres',
    password: ''
}
const db = pgp(cn);

function getUserByUserId(id) {
    return db.oneOrNone('SELECT * FROM users WHERE user_id = $1;', [id]);
}

function getAllUsers() {
    return db.any('SELECT * FROM users;');
}

function getUserByGithubId(id) {
    return db.oneOrNone('SELECT * FROM users WHERE github_id = $1;', [id]);
}

function getUsersByCity(city) {
    return db.any('SELECT * FROM users WHERE city ILIKE \'$1#\'', [city]);
}

function getUsersByState(state) {
    return db.any('SELECT * FROM users WHERE state ILIKE \'$1#\'', [state]);
}

function getUsersByZip(zip) {
    return db.any('SELECT * FROM users WHERE zip = $1', [zip]);
}

function addUser(alias,github_id,github_avatar_url,name,github_url,employer,city,state,zip,join_date,tabs_preference,same_line_curlies_preference,single_quotes_preference,bio) {
    return db.one('INSERT INTO users (alias, github_id, github_avatar_url, name, github_url, employer, city, state, \
        zip, join_date, tabs_preference, same_line_curlies_preference, single_quotes_preference, bio \
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING user_id',
        [alias,github_id,github_avatar_url,name,github_url,employer,city,state,zip,join_date,tabs_preference,same_line_curlies_preference,single_quotes_preference,bio]);
}

function editUser(name,employer,city,state,zip,tabs_preference,same_line_curlies_preference,single_quotes_preference,bio,user_id) {
    return db.query('UPDATE users SET name = $1, employer = $2, city = $3, state = $4, zip = $5, \
        tabs_preference = $6, same_line_curlies_preference = $7, single_quotes_preference = $8, bio = $9 \
        WHERE user_id = $10',
        [name,employer,city,state,zip,tabs_preference,same_line_curlies_preference,
            single_quotes_preference,bio,user_id]);
}

function getUserByAlias(searchString) {
    return db.oneOrNone('SELECT * FROM users WHERE alias ILIKE $1;', [searchString]);
}

function getUsersByLanguage(lang_id) {
    return db.any('SELECT users.* FROM languages AS lang JOIN user_languages \
    AS ul ON ul.lang_id = lang.lang_id \
    JOIN users ON ul.user_id = users.user_id \
    WHERE lang.lang_id = $1;', [lang_id]);
}

function getUsersByEditor(editor_id) {
    return db.any('SELECT users.* FROM editors JOIN user_editors AS ue \
    ON ue.editor_id = editors.editor_id \
    JOIN users ON ue.user_id = users.user_id \
    WHERE editors.editor_id = $1;', [editor_id]);
}

function getUsersByEmployer(employer) {
    return db.any('SELECT * FROM users WHERE employer ILIKE \'$1#\'', [employer]);
}

function getMessagesBySender (author_id) {
    return db.any('SELECT * FROM messages WHERE author_id = $1;', [author_id]);
}

function getMessagesByRecipient (recipient_id) {
    return db.any('SELECT mess.* FROM messages AS mess JOIN \
    message_recipients AS ma ON mess.message_id = ma.message_id \
    WHERE ma.recipient_id = $1;', [recipient_id]);
}

function createMessage(author_id, now, message_text) {
    return db.one('INSERT INTO messages (author_id, date_time, message_text) \
    VALUES ($1, $2, $3) RETURNING message_id', [author_id, now, message_text]);
}

function sendMessage(author_id, recipient_id_array, message_text) {
    return createMessage(author_id, new Date(), message_text)
        .then((message) => {
            // console.log('about to print message id')
            // console.log(message);
            recipient_id_array.forEach((recipient) => {
                db.query('INSERT INTO message_recipients \
                    (message_id, recipient_id, is_read) VALUES \
                    ($1, $2, $3)', [message.message_id, recipient, false]).catch(console.error)
            });
            return true;
        })
        .catch(console.error);
}

function getLanguages() {
    return db.any('SELECT * FROM languages;');
}

function getEditors() {
    return db.any('SELECT * FROM editors;');
}

function hasUnreadMessages(user_id) {
    return db.one('SELECT COUNT(*) > 0 AS has_unread FROM message_recipients AS ma \
    JOIN messages m ON m.message_id = ma.message_id \
    WHERE ma.is_read = false AND ma.recipient_id = $1;', [user_id]);
}

let parameters = {
    // editors: [1,2],
    // languages: [3,4],
    likes_tabs: "tabs"
};

function selectiveSearch(searchObject) {


    let chunks = {
        editors: 'JOIN user_editors ue ON ue.user_id = users.user_id JOIN editors ON editors.editor_id = ue.editor_id ',
        languages: 'JOIN user_languages ul ON ul.user_id = users.user_id JOIN languages ON languages.lang_id = ul.lang_id ',
        editorsWhere: 'editors.editor_id IN ',
        languagesWhere: 'languages.lang_id IN '
    }

    let result = '';
    let select = 'SELECT DISTINCT users.* FROM users ';
    let where = ' WHERE ';
    Object.keys(searchObject).forEach((key, outerIndex) => {
        objString = '';

        if (typeof searchObject[key] === 'object') {
            
            searchObject[key].forEach( (datum, innerIndex) => {
                if (innerIndex === searchObject[key].length - 1) {
                    objString += datum;
                } else {
                    objString += datum + ', '
                }
            });
            select += (chunks[key]);
            if (outerIndex === Object.keys(searchObject).length - 1) {
                where += chunks[key + 'Where'] + '(' + objString + ');';
            } else {
                where += chunks[key + 'Where'] + '(' + objString + ') AND ';      
            }

        } else if (typeof searchObject[key] === 'string') {

            console.log('got a string');

        }
    });
    result = select + where;
    console.log(result);
}

selectiveSearch(parameters);

module.exports = {
    getUserByUserId: getUserByUserId,
    getUsersByCity: getUsersByCity,
    getUsersByState: getUsersByState,
    getUsersByZip: getUsersByZip,
    addUser: addUser,
    editUser: editUser,
    getUserByAlias: getUserByAlias,
    getUserByGithubId: getUserByGithubId,
    getUsersByLanguage: getUsersByLanguage,
    getUsersByEditor: getUsersByEditor,
    getUsersByEmployer: getUsersByEmployer,
    getMessagesBySender: getMessagesBySender,
    getMessagesByRecipient: getMessagesByRecipient,
    sendMessage: sendMessage,
    getAllUsers: getAllUsers,
    getLanguages: getLanguages,
    getEditors: getEditors,
    hasUnreadMessages: hasUnreadMessages
};

// TESTS
// getUserByUserId(1)
//     .then(console.log)
//     .catch(console.error);
// getUsersByCity('Atlanta')
//     .then(console.log)
//     .catch(console.error);
// getUsersByState('Washington')
//     .then(console.log)
//     .catch(console.error);
// getUsersByZip(30055)
//     .then(console.log)
//     .catch(console.error);
// addUser('testAlias', 12321, 'testImageUrl.com', 'A Cool Name', 'http://github.com/url', null, null, null, 30893, '2018-04-04', 'tabs', 'sameLine', 'single', 'I\'m a coder who codes things!')
//     .then(console.log)
//     .catch(console.error);
// getUserByAlias('testAlias')
//     .then(console.log)
//     .catch(console.error);
// getUserByGithubId(12321)
//     .then(console.log)
//     .catch(console.error);
// getUsersByLanguage(1)
//     .then(console.log)
//     .catch(console.error);
// getUsersByEditor(1)
//     .then(console.log)
//     .catch(console.error);
// getUsersByEmployer('Microsoft')
//     .then(console.log)
//     .catch(console.error);
// getMessagesBySender(1)
//     .then(console.log)
//     .catch(console.error);
// getMessagesByRecipient(1)
//     .then(console.log)
//     .catch(console.error);
// sendMessage(1, [2,3,4], 'This is a testy message.')
//     .then(console.log)
//     .catch(console.error);
// getAllUsers()
//     .then(console.log)
//     .catch(console.error);
// getLanguages()
//     .then(console.log)
//     .catch(console.error);
// getEditors()
//     .then(console.log)
//     .catch(console.error);
// hasUnreadMessages(3)
//     .then(console.log)
//     .catch(console.error);

// editUser('Tommy Bumpkin', 'NASA', 'Washington, D.C.', null, 58474, 'Tabs', 'sameLine', 'single', 'I changed my profile', 1)
    // .then(console.log)
    // .catch(console.error);
/**** FIELDS NEEDED TO EDIT USER:
user_id,name,employer,city,state,zip,tabs_preference,same_line_curlies_preference,single_quotes_preference,bio */

/**** SEARCH FIELDS
tabs, curlies, quotes, languages, editors, city, state, zip, company
*/