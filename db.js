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
) VALUES (\'$1#\', $2, \'$3#\', \'$4#\', \'$5#\', \'$6#\', $7, $8, $9, $10, \'$11#\', \
$12, $13, $14, $15) RETURNING user_id', [alias,github_id,github_alias,first_name,last_name,
    github_url,employer,city,state,zip,join_date,likes_tabs,likes_same_line_curlies,likes_single_quotes,bio]);
}

function getUserByAlias(searchString) {
    return db.oneOrNone('SELECT * FROM users WHERE alias ILIKE $1;', [searchString]);
}

// function getUsersByLanguage(lang_id) {
//     return db.any('SELECT * FROM', [lang_id]);
// }

// addUser('joshbrown', 3, 'joshthebrownster', 'josh', 'brizown', 'www.webpage.com', 'workplace', 'Atlanta', 'GA', 30088,
// '2014-09-10', true, true, true, 'I like fun things!')
//     .then(console.log)
//     .catch(console.error);

// getUserByAlias('test')
//     .then(console.log)
//     .catch(console.error);

module.exports = {
    getUserByUserId: getUserByUserId,
    getUsersByCity: getUsersByCity,
    getUsersByState: getUsersByState,
    getUsersByZip: getUsersByZip,
    addUser: addUser,
    getUserByAlias: getUserByAlias
};