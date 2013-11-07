
ALTER TABLE  `workout` ADD  `location_id` INT NOT NULL;
ALTER TABLE  `workout` CHANGE  `location_id`  `location_id` INT( 11 ) NULL DEFAULT NULL;

ALTER TABLE  `post` ADD  `location_id` INT NULL DEFAULT NULL;