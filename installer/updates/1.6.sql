
INSERT INTO `cn_settings` (`id`, `name`, `value`) VALUES
(NULL, 'delete_group_chat_hours', '0'),
(NULL, 'delete_private_chat_hours', '0'),
(NULL, 'only_online_users', '0');

UPDATE `cn_settings` SET `value` = '1.6' WHERE `cn_settings`.`name` = 'current_version';
