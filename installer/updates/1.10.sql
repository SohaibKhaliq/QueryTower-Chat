ALTER TABLE `cn_private_chat_meta` ADD `in_call` TINYINT NULL DEFAULT '0' AFTER `last_chat_id`;

ALTER TABLE `cn_private_chat_meta` ADD `last_call_id` INT NULL AFTER `in_call`;

ALTER TABLE `cn_private_chat_meta` ADD `im_calling` TINYINT NOT NULL DEFAULT '0' AFTER `last_chat_id`;

CREATE TABLE cn_private_calls (
  id int(11) NOT NULL,
  meta_id int(11) DEFAULT NULL,
  initiated_on datetime DEFAULT NULL,
  answered_on datetime DEFAULT NULL,
  ended_on datetime DEFAULT NULL,
  status tinyint(4) NOT NULL DEFAULT '1' COMMENT 'initiated= 1, answered = 2, ended= 3, declined=4, missed=5'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `cn_private_calls` ADD PRIMARY KEY (`id`);

ALTER TABLE `cn_private_calls` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

UPDATE `cn_settings` SET `value` = '1.10' WHERE `cn_settings`.`name` = 'current_version';