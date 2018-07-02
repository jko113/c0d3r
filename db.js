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

function getUserTabPrefs(id) {
    return db.any('SELECT DISTINCT t.description, t.preference_id, \
        CASE WHEN t.preference_id = (SELECT tabs_preference FROM users WHERE user_id = $1) \
            THEN true \
            ELSE false END AS userPref \
        FROM tabs_preferences t \
        ORDER BY t.preference_id', [id]);
}

function getUserCurlyPrefs(id) {
    return db.any('SELECT DISTINCT c.description, c.preference_id, \
        CASE WHEN c.preference_id = (SELECT same_line_curlies_preference FROM users WHERE user_id = $1) \
            THEN true \
            ELSE false END AS userPref \
        FROM same_line_curlies_preferences c \
        ORDER BY c.preference_id', [id]);
}

function getUserQuotesPrefs(id) {
    return db.any('SELECT DISTINCT q.description, q.preference_id, \
        CASE WHEN q.preference_id = (SELECT single_quotes_preference FROM users WHERE user_id = $1) \
            THEN true \
            ELSE false END AS userPref \
        FROM single_quotes_preferences q \
        ORDER BY q.preference_id', [id]);
}

function getUserLanguages(id) {
    return db.any('SELECT DISTINCT l.name, l.lang_id, \
	    CASE WHEN l.lang_id IN (SELECT lang_id FROM user_languages WHERE user_id = $1) \
		     THEN true \
		     ELSE false END AS userpref \
        FROM languages l \
        ORDER BY l.name', [id]);
}

function getUserEditors(id) {
    return db.any('SELECT DISTINCT e.name, e.editor_id, \
        CASE WHEN e.editor_id IN (SELECT editor_id FROM user_editors WHERE user_id = $1) \
              THEN true ELSE false END AS userpref \
        FROM editors e \
        ORDER BY e.name', [id]);
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

function editUser(name,employer,city,state,zip,tabs_preference,same_line_curlies_preference,single_quotes_preference,bio,github_id) {
    return db.query('UPDATE users SET name = $1, employer = $2, city = $3, state = $4, zip = $5, \
        tabs_preference = $6, same_line_curlies_preference = $7, single_quotes_preference = $8, bio = $9 \
        WHERE github_id = $10',
        [name,employer,city,state,zip,tabs_preference,same_line_curlies_preference,
            single_quotes_preference,bio,github_id]);
}

function editUserLanguages(id, languageArray) {
    if(languageArray && languageArray.length > 0) {
        let queryString = 'DELETE FROM user_languages WHERE user_id = $1;';
        let values = [id];
        for (let index = 0; index < languageArray.length; index++) {
            queryString += `INSERT INTO user_languages (lang_id, user_id) VALUES ($${index+2},$1);`
            values.push(languageArray[index]);
        }
        return db.multi(queryString, values);
    } else {
        return;
    }
}

function editUserEditors(id, editorArray) {
    if(editorArray && editorArray.length > 0) {
        let queryString = 'DELETE FROM user_editors WHERE user_id = $1;';
        let values = [id];
        for (let index = 0; index < editorArray.length; index++) {
            queryString += `INSERT INTO user_editors (editor_id, user_id) VALUES ($${index+2},$1);`
            values.push(editorArray[index]);
        }
        return db.multi(queryString, values);
    } else {
        return;
    }
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
    return db.any('SELECT mess.*, users.alias FROM messages AS mess \
    JOIN users ON users.user_id = mess.author_id \
    WHERE author_id = $1 ORDER BY date_time DESC;', [author_id]);
}

function getMessagesByRecipient (recipient_id) {
    return db.any('SELECT mess.*, users.alias AS sender_alias FROM messages AS mess JOIN \
    message_recipients AS ma ON mess.message_id = ma.message_id \
    JOIN users ON mess.author_id = users.user_id \
    WHERE ma.recipient_id = $1 ORDER BY date_time DESC;', [recipient_id]);
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

function getTabsPrefsList(){
    return db.any('SELECT * FROM tabs_preferences;');
}

function getQuotesPrefsList() {
    return db.any('SELECT * FROM single_quotes_preferences;');
}

function getCurlyPrefsList() {
    return db.any('SELECT * FROM same_line_curlies_preferences;');
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

// let parameters = {
//     editors: [1,2],
//     languages: [3,4],
//     tabs_preference: [1,2],
//     same_line_curlies_preference: [1],
//     single_quotes_preference: [1],
//     city: 'Seattle',
//     state: 'WA',
//     zip: 48765
// };

function andSearch(searchObject) {
    // console.log('andSearch searchObject: ' + searchObject);
    let chunks = {
        editors: 'JOIN user_editors ue ON ue.user_id = users.user_id JOIN editors ON editors.editor_id = ue.editor_id ',
        languages: 'JOIN user_languages ul ON ul.user_id = users.user_id JOIN languages ON languages.lang_id = ul.lang_id ',
        tabs_preference: 'JOIN tabs_preferences tp ON tp.preference_id = users.tabs_preference ',
        same_line_curlies_preference: 'JOIN same_line_curlies_preferences sl ON sl.preference_id = users.same_line_curlies_preference ',
        single_quotes_preference: 'JOIN single_quotes_preferences sq ON sq.preference_id = users.single_quotes_preference ',
        editorsWhere: 'editors.editor_id IN ',
        languagesWhere: 'languages.lang_id IN ',
        tabs_preferenceWhere: 'tp.preference_id IN ',
        same_line_curlies_preferenceWhere: 'sl.preference_id IN ',
        single_quotes_preferenceWhere: 'sq.preference_id IN ',
        cityWhere: 'users.city ILIKE ',
        stateWhere: 'users.state ILIKE ',
        zipWhere: 'users.zip = '
    }

    let result = '';
    let select = 'SELECT DISTINCT users.* FROM users ';
    let where = ' WHERE ';
    Object.keys(searchObject).forEach((key, outerIndex) => {
        // console.log('key: ' + key);
        // console.log('value: ' + searchObject[key]);
        // console.log(typeof searchObject[key]);
        objString = '';

        if (typeof searchObject[key] === 'object' && searchObject[key]) {
            
            searchObject[key].forEach( (datum, innerIndex) => {
                if (innerIndex === searchObject[key].length - 1) {
                    objString += datum;
                } else {
                    objString += datum + ', '
                }
            });
            if (chunks[key]) {
                select += (chunks[key]);
            }
            
            if (outerIndex === Object.keys(searchObject).length - 1) {
                where += chunks[key + 'Where'] + '(' + objString + ') ';
            } else {
                where += chunks[key + 'Where'] + '(' + objString + ') AND ';      
            }

        } else if (typeof searchObject[key] === 'number') {
            // console.log('got number')
            objString += searchObject[key];
            if (chunks[key]) {
                select += (chunks[key]);
            }
            if (outerIndex === Object.keys(searchObject).length - 1) {
                where += chunks[key + 'Where'] + objString;
            } else {
                where += chunks[key + 'Where'] + objString + ' AND ';      
            }

        } else if (typeof searchObject[key] === 'string') {
            // console.log('got string')
            objString += '\'' + searchObject[key] + '\'';

            if (outerIndex === Object.keys(searchObject).length - 1) {
                where += chunks[key + 'Where'] + objString;
            } else {
                where += chunks[key + 'Where'] + objString + ' AND ';      
            }

        } else {
            // console.log(typeof searchObject[key]);
        }
    });
    result = select + where + ';';
    // console.log(result);
    return db.any(result);
}

function orSearch(searchObject) {

    let chunks = {
        editors: 'JOIN user_editors ue ON ue.user_id = users.user_id JOIN editors ON editors.editor_id = ue.editor_id ',
        languages: 'JOIN user_languages ul ON ul.user_id = users.user_id JOIN languages ON languages.lang_id = ul.lang_id ',
        tabs_preference: 'JOIN tabs_preferences tp ON tp.preference_id = users.tabs_preference ',
        same_line_curlies_preference: 'JOIN same_line_curlies_preferences sl ON sl.preference_id = users.same_line_curlies_preference ',
        single_quotes_preference: 'JOIN single_quotes_preferences sq ON sq.preference_id = users.single_quotes_preference ',
        editorsWhere: 'editors.editor_id IN ',
        languagesWhere: 'languages.lang_id IN ',
        tabs_preferenceWhere: 'tp.preference_id IN ',
        same_line_curlies_preferenceWhere: 'sl.preference_id IN ',
        single_quotes_preferenceWhere: 'sq.preference_id IN ',
        cityWhere: 'users.city ILIKE ',
        stateWhere: 'users.state ILIKE ',
        zipWhere: 'users.zip = '
    }

    let result = '';
    let select = 'SELECT DISTINCT users.* FROM users ';
    let where = ' WHERE ';
    Object.keys(searchObject).forEach((key, outerIndex) => {
        // console.log(searchObject[key]);
        // console.log(typeof searchObject[key]);
        objString = '';

        if (typeof searchObject[key] === 'object' && searchObject[key]) {
            
            searchObject[key].forEach( (datum, innerIndex) => {
                if (innerIndex === searchObject[key].length - 1) {
                    objString += datum;
                } else {
                    objString += datum + ', '
                }
            });
            if (chunks[key]) {
                select += (chunks[key]);
            }
            
            if (outerIndex === Object.keys(searchObject).length - 1) {
                where += '(' + chunks[key + 'Where'] + '(' + objString + ')) ';
            } else {
                where += '(' + chunks[key + 'Where'] + '(' + objString + ')) OR ';      
            }

        } else if (typeof searchObject[key] === 'number') {
            // console.log('got number')
            objString += searchObject[key];
            if (chunks[key]) {
                select += (chunks[key]);
            }
            if (outerIndex === Object.keys(searchObject).length - 1) {
                where += '(' + chunks[key + 'Where'] + objString + ')';
            } else {
                where += '(' + chunks[key + 'Where'] + objString + ') OR ';      
            }

        } else if (typeof searchObject[key] === 'string') {
            // console.log('got string')
            objString += '\'' + searchObject[key] + '\'';

            if (outerIndex === Object.keys(searchObject).length - 1) {
                where += '(' + chunks[key + 'Where'] + objString + ')';
            } else {
                where += '(' + chunks[key + 'Where'] + objString + ') OR ';      
            }

        } else {
            // console.log(typeof searchObject[key]);
        }
    });
    result = select + where + ';';
    // console.log(result);
    return db.any(result);
}

function checkUserExistence(github_id) {
    return db.any('SELECT COUNT(*) = 1 AS user_exists, user_id FROM users WHERE github_id = $1 GROUP BY user_id;', [github_id]);
}

function addUserLanguage(lang_id, user_id) {
    return db.one('INSERT INTO user_languages (lang_id, user_id) VALUES ($1, $2) RETURNING true', [lang_id, user_id]);
}

function addUserEditor(editor_id, user_id) {
    return db.one('INSERT INTO user_editors (editor_id, user_id) VALUES ($1, $2) RETURNING true', [editor_id, user_id]);
}

function getAllUserIds() {
    return db.any('SELECT DISTINCT user_id FROM users;');
}

function getAllGithubIds() {
    return db.any('SELECT DISTINCT github_id FROM users;');
}
function getCurlyPrefs() {
    return db.any('SELECT * from same_line_curlies_preferences');
}
function getQuotePrefs() {
    return db.any('SELECT * from single_quotes_preferences');
}
function getTabsPrefs() {
    return db.any('SELECT * from tabs_preferences');
}

function getRandomUsers(current_user_id, num_users) {

    return getAllUserIds()
        .then((arrayOfAllUserIds) => {

            let intIds = [];
            arrayOfAllUserIds.forEach((obj) => {
                intIds.push(obj.user_id);
            });
            
            if (num_users > arrayOfAllUserIds.length) {
                throw new Error('number of users specified must be <= the dataset');
            }

            let randomIds = [];
            for (let i = 0; i < num_users; i++) {
                let randomIndex = Math.floor(Math.random() * intIds.length);
                let randomValue = intIds[randomIndex];
                randomIds.push(randomValue);
                intIds.splice(randomIndex, 1);
            }
            //console.log(randomIds);
            
            let initial = 'SELECT * FROM users WHERE user_id != $1 AND user_id IN (';
            let userIds = '';
            let final = ');';

            randomIds.forEach((item, index) => {
                index === randomIds.length - 1 ? userIds += item: userIds += item + ', '; 
            });

            results = initial + userIds + final;
            //console.log(results);
            return db.any(results, [current_user_id]);
        })
        .catch(console.error);
}

function getUserIdsByGitHubAliasArray(aliasArray) {
    let values = '';
    aliasArray.forEach((alias, index) => {
        index === aliasArray.length - 1 ? values += '\'' + alias + '\'': values += '\'' + alias + '\', ';       
    });
    return db.any('SELECT DISTINCT user_id FROM users WHERE alias IN (' + values + ');');
}

module.exports = {
    getUserByUserId: getUserByUserId,
    getUsersByCity: getUsersByCity,
    getUsersByState: getUsersByState,
    getUsersByZip: getUsersByZip,
    addUser: addUser,
    editUser: editUser,
    editUserLanguages: editUserLanguages,
    editUserEditors: editUserEditors,
    getUserByAlias: getUserByAlias,
    getUserByGithubId: getUserByGithubId,
    getUserTabPrefs: getUserTabPrefs,
    getUserCurlyPrefs: getUserCurlyPrefs,
    getUserQuotesPrefs: getUserQuotesPrefs,
    getUserLanguages: getUserLanguages,
    getUserEditors: getUserEditors,
    getUsersByLanguage: getUsersByLanguage,
    getUsersByEditor: getUsersByEditor,
    getUsersByEmployer: getUsersByEmployer,
    getMessagesBySender: getMessagesBySender,
    getMessagesByRecipient: getMessagesByRecipient,
    sendMessage: sendMessage,
    getAllUsers: getAllUsers,
    getTabsPrefsList: getTabsPrefsList,
    getQuotesPrefsList: getQuotesPrefsList,
    getCurlyPrefsList: getCurlyPrefsList,
    getLanguages: getLanguages,
    getEditors: getEditors,
    hasUnreadMessages: hasUnreadMessages,
    andSearch: andSearch,
    orSearch: orSearch,
    checkUserExistence: checkUserExistence,
    addUserLanguage: addUserLanguage,
    addUserEditor: addUserEditor,
    getRandomUsers: getRandomUsers,
    getAllGithubIds: getAllGithubIds,
    getUserIdsByGitHubAliasArray: getUserIdsByGitHubAliasArray,
    getCurlyPrefs: getCurlyPrefs,
    getQuotePrefs: getQuotePrefs,
    getTabsPrefs: getTabsPrefs
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
// addUser('testAlias', 12321, 'testImageUrl.com', 'A Cool Name', 'http://github.com/url', null, null, null, 30893, '2018-04-04', 1, 1, 1, 'I\'m a coder who codes things!')
//     .then(console.log)
//     .catch(console.error);
// getUserByAlias('testAlias')
//     .then(console.log)
//     .catch(console.error);
// getUserByGithubId(12321)
//     .then(console.log)
//     .catch(console.error);
// getUserTabPrefs(1)
//     .then(console.log)
//     .catch(console.error);
// getUserCurlyPrefs(4)
//     .then(console.log)
//     .catch(console.error);
// getUserQuotesPrefs(1)
//     .then(console.log)
//     .catch(console.error);
// getUserLanguages(1)
//     .then(console.log)
//     .catch(console.log)
// getUserEditors(1)
//     .then(console.log)
//     .catch(console.log)
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
    // .then(console.log)
    // .catch(console.error);
// getTabsPrefsList()
//     .then(console.log)
//     .catch(console.error);
// getQuotesPrefsList()
//     .then(console.log)
//     .catch(console.error);
// getCurlyPrefsList()
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
// andSearch(parameters)
//     .then(console.log)
//     .catch(console.error);
// orSearch(parameters)
//     .then(console.log)
//     .catch(console.error);
// checkUserExistence(10101)
//     .then(console.log)
//     .catch(console.error);
// addUserLanguage(1, 202)
//     .then(console.log)
//     .catch(console.error);
// addUserEditor(1, 202)
//     .then(console.log)
//     .catch(console.error);
// getRandomUsers(1, 2)
//     .then(console.log)
//     .catch(console.error);
// getUserIdsByGitHubAliasArray(['funName', 'sillyAlias'])
//     .then(console.log)
//     .catch(console.error);

// editUser('Tommy Bumpkin', 'NASA', 'Washington, D.C.', null, 58474, 2, 2, 3, 'I changed my profile', 1)
//     .then(console.log)
//     .catch(console.error);
/**** FIELDS NEEDED TO EDIT USER:
user_id,name,employer,city,state,zip,tabs_preference,same_line_curlies_preference,single_quotes_preference,bio */
// editUserLanguages(4, [1, 2, 3, 4]);
//     .then(console.log)
//     .catch(console.error);
// editUserEditors(4, [1,2])
//     .then(console.log)
//     .catch(console.error);
/**** SEARCH FIELDS
tabs, curlies, quotes, languages, editors, city, state, zip, company
*/