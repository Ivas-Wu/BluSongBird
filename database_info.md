# Setup Database
CREATE DATABASE test_db;

# Enter Database
\c test_db

# Create Post and Reply Tables

CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE replies (
    reply_id SERIAL PRIMARY KEY,
    reply_parent INTEGER,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    body TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id)
);

