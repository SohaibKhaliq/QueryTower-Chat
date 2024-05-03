ALTER TABLE `cn_users` ADD `country` VARCHAR(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL AFTER `timezone`;

INSERT INTO `cn_settings` (`id`, `name`, `value`) VALUES
(NULL, 'show_snow', '1'),
(NULL, 'sent_animation', 'animate__fadeIn animate__slow'),
(NULL, 'replies_animation', 'animate__fadeInLeft');

UPDATE `cn_settings` SET `value` = '1.3' WHERE `cn_settings`.`name` = 'current_version';
