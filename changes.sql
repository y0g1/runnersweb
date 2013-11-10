
ALTER TABLE  `workout` ADD  `location_id` INT NOT NULL;
ALTER TABLE  `workout` CHANGE  `location_id`  `location_id` INT( 11 ) NULL DEFAULT NULL;
ALTER TABLE  `post` ADD  `location_id` INT NULL DEFAULT NULL;

-- 10/11/2013
ALTER TABLE  `comment` ADD  `when` DATETIME NOT NULL
ALTER TABLE  `comment` ADD  `deleted_date` DATETIME NULL DEFAULT NULL
ALTER TABLE  `comment` CHANGE  `message`  `message` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL
