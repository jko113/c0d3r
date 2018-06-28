CREATE TABLE users (
    user_id serial primary key,
    alias varchar(30) NOT NULL,
    github_id integer NOT NULL,
    github_avatar_url varchar(100) NOT NULL,
    name varchar(50),
    github_url varchar(100) NOT NULL,
    employer varchar(30),
    city varchar(30),
    state varchar(30),
    zip integer,
    join_date timestamp NOT NULL,
    tabs_preference varchar(30),
    same_line_curlies_preference varchar(30),
    single_quotes_preference varchar(30),
    bio varchar(2000)
);

CREATE TABLE languages (
    lang_id serial primary key,
    name varchar(30)
);

CREATE TABLE user_languages (
    lang_id integer REFERENCES languages (lang_id),
    user_id integer REFERENCES users (user_id),
    PRIMARY KEY (lang_id, user_id)
);

CREATE TABLE editors (
    editor_id serial primary key,
    name varchar(30)
);

CREATE TABLE user_editors (
    editor_id integer REFERENCES editors (editor_id),
    user_id integer REFERENCES users (user_id),
    PRIMARY KEY (editor_id, user_id)
);

CREATE TABLE messages (
    message_id serial primary key,
    author_id integer REFERENCES users (user_id),
    date_time timestamp,
    message_text varchar(3000)
);

CREATE TABLE message_recipients (
    message_id integer REFERENCES messages (message_id),
    recipient_id integer REFERENCES users (user_id),
    is_read boolean,
    PRIMARY KEY (message_id, recipient_id)
);