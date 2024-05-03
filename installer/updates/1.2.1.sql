ALTER TABLE `cn_languages` ADD `direction` VARCHAR(3) NOT NULL DEFAULT 'ltr' AFTER `country`;

UPDATE `cn_settings` SET `value` = '1.2.1' WHERE `cn_settings`.`name` = 'current_version';
