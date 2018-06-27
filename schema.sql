CREATE TABLE users (
    user_id serial primary key,
    alias varchar(30) NOT NULL,
    github_id integer NOT NULL,
    github_alias varchar(30) NOT NULL,
    first_name varchar(30) NOT NULL,
    last_name varchar(30) NOT NULL,
    github_url varchar(100) NOT NULL,
    employer varchar(30),
    city varchar(30),
    state varchar(30),
    zip integer,
    join_date timestamp NOT NULL,
    likes_tabs boolean,
    likes_same_line_curlies boolean,
    likes_single_quotes boolean,
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