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

function addUser(alias,github_id,github_alias,first_name,last_name,
    github_url,employer,city,state,zip,join_date,likes_tabs,likes_same_line_curlies,likes_single_quotes,bio) {
    return db.one('INSERT INTO users (alias, github_id, github_alias, first_name, last_name, github_url, employer, city, state, \
    zip, join_date, likes_tabs, likes_same_line_curlies, likes_single_quotes, bio \
) VALUES (\'$1#\', $2, \'$3#\', \'$4#\', \'$5#\', \'$6#\', $7, $8, $9, \
$10, \'$11#\', \
$12, $13, $14, $15) RETURNING user_id', [alias,github_id,github_alias,first_name,last_name,
    github_url,employer,city,state,zip,join_date,likes_tabs,likes_same_line_curlies,likes_single_quotes,bio]);
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
    return db.any('SELECT mess.* FROM messages AS mess JOIN \ message_recipients AS ma ON mess.message_id = ma.message_id \
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

module.exports = {
    getUserByUserId: getUserByUserId,
    getUsersByCity: getUsersByCity,
    getUsersByState: getUsersByState,
    getUsersByZip: getUsersByZip,
    addUser: addUser,
    getUserByAlias: getUserByAlias,
    getUserByGithubId: getUserByGithubId,
    getUsersByLanguage: getUsersByLanguage,
    getUsersByEditor: getUsersByEditor,
    getUsersByEmployer: getUsersByEmployer,
    getMessagesBySender: getMessagesBySender,
    getMessagesByRecipient: getMessagesByRecipient,
    sendMessage: sendMessage,
    getAllUsers: getAllUsers
};