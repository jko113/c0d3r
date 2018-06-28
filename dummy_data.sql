INSERT INTO users (
    alias,
    github_id,
    name,
    github_url,
    employer,
    city,
    state,
    zip,
    join_date,
    tabs_preference,
    same_line_curlies_preference,
    single_quotes_preference,
    bio
) VALUES (
    'test',
    12345,
    'Tom Jones',
    'www.github.com/test',
    null,
    'Atlanta',
    'GA',
    30055,
    '2018-06-25 12:31:56',
    'tabs',
    'sameLine',
    'single',
    'I am a coder who enjoys coding.'
),
(
    'funName',
    54321,
    'Martha Washington',
    'www.github.com/funUser',
    'El presidente',
    'Washington, D.C.',
    null,
    73678,
    '2018-06-24 11:02:13',
    'tabs',
    'sameLine',
    'single',
    'This is for testing purposes only. No more, no less.'
),
(
    'sillyAlias',
    10101,
    'Timothy Farflignugen',
    'www.github.com/farflig',
    'Microsoft',
    'Seattle',
    'Washington',
    48765,
    '2018-06-23 11:12:46',
    'spaces',
    'differentLine',
    'double',
    'If you were a coder, would you code as excellently as me?'
);

INSERT INTO languages (name) VALUES
('Java'),
('JavaScript'),
('SQL'),
('Rust'),
('Go');

INSERT INTO user_languages (user_id, lang_id) VALUES
(1,1),
(1,2),
(3,3),
(2,3),
(2,4),
(3,5),
(1,5);

INSERT INTO editors (name) VALUES
('VS Code'),
('Atom'),
('Text Wrangler'),
('Sublime');

INSERT INTO user_editors (user_id, editor_id) VALUES
(1,1),
(3,2),
(1,3),
(2,2),
(3,3),
(2,4);

INSERT INTO messages (author_id, date_time, message_text) VALUES
(1, '2018-05-05 00:00:00', 'This is a test message'),
(2, '2018-05-05 00:00:00', 'This is a second message'),
(3, '2018-05-05 00:00:00', 'This is a third message'),
(2, '2018-05-05 00:00:00', 'This is a fourth message'),
(1, '2018-05-05 00:00:00', 'This is a fifth message'),
(3, '2018-05-05 00:00:00', 'This is a sixth message');

INSERT INTO message_recipients (message_id, recipient_id, is_read) VALUES
(1, 3, false),
(1, 2, false),
(2, 1, false),
(2, 3, false),
(3, 1, false),
(3, 2, false),
(4, 1, true),
(4, 3, false),
(5, 2, true),
(5, 3, true),
(6, 1, false);
