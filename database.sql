CREATE DATABASE LinkTree_DB;
USE LinkTree_DB;

-- Link tree application DataBase
CREATE TABLE Users(
	user_id VARCHAR(140) PRIMARY KEY,
    email VARCHAR(130) unique not null,
    u_password VARCHAR(130) NOT NULL,
    CHECK(length(u_password) > 9) -- check password length is greater than 9
);

CREATE TABLE UserBio(
	user_id VARCHAR(140),
	profile_id VARCHAR(140) PRIMARY KEY,          -- user profile_id
    username VARCHAR(60) NOT NULL,       -- users username
    profile_picture LONGBLOB NOT NULL,   -- users profile picture
    user_bio VARCHAR(1200) NOT NULL,
    FOREIGN KEY(user_id) references Users(user_id)
);

CREATE TABLE Links(
   link_tree_id VARCHAR(140) PRIMARY KEY,
   profile_id VARCHAR(140),
   link_title VARCHAR(100) NOT NULL,
   link_url VARCHAR(600) NOT NULL,
   FOREIGN KEY(profile_id) references UserBio(profile_id)
);

CREATE TABLE Link_tree_analytic(
	link_tree_id VARCHAR(140),
    view_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    FOREIGN KEY(link_tree_id) references Links(link_tree_id)
);

CREATE TABLE LinkTreePageSettings(
	link_tree_id VARCHAR(140),
    background_color VARCHAR(100) DEFAULT '#d4f3ff',
    text_color VARCHAR(100) DEFAULT '#ff670f',
    foreign key(link_tree_id) references Links(link_tree_id)
);


