ALTER TABLE `cn_users` ADD `last_login` DATETIME NULL AFTER `last_seen`;

ALTER TABLE `cn_private_chat_meta` CHANGE `room_id` `room_id` INT NULL DEFAULT NULL;

UPDATE `cn_settings` SET `value` = '1.6.1' WHERE `cn_settings`.`name` = 'current_version';
