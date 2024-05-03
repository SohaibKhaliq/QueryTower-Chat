INSERT INTO `cn_settings` (`id`, `name`, `value`) VALUES
(NULL, 'current_version', '1.2'),
(NULL, 'enable_gif', '1'),
(NULL, 'enable_stickers', '1'),
(NULL, 'enable_images', '1'),
(NULL, 'member_registration', '1');

DROP TABLE IF EXISTS `cn_languages`;
CREATE TABLE IF NOT EXISTS `cn_languages` (
  `code` varchar(5) NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  `country` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cn_languages` (`code`, `name`, `country`) VALUES
('en', 'English', 'us');

DROP TABLE IF EXISTS `cn_lang_terms`;
CREATE TABLE IF NOT EXISTS `cn_lang_terms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `term` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cn_translations`;
CREATE TABLE IF NOT EXISTS `cn_translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lang_code` varchar(5) DEFAULT NULL,
  `term_id` int(11) DEFAULT NULL,
  `translation` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `cn_chat_rooms` ADD `created_by` INT NULL DEFAULT NULL AFTER `status`;

ALTER TABLE `cn_users` CHANGE `first_name` `first_name` VARCHAR(100) NULL, CHANGE `last_name` `last_name` VARCHAR(100) NULL, CHANGE `email` `email` VARCHAR(100) NULL, CHANGE `password` `password` VARCHAR(300) NULL;

ALTER TABLE `cn_chat_rooms` ADD `allowed_users` VARCHAR(100) NULL DEFAULT NULL AFTER `slug`;

ALTER TABLE `cn_group_chats` CHANGE `message` `message` TEXT NULL DEFAULT NULL;

ALTER TABLE `cn_private_chats` CHANGE `message` `message` TEXT NULL DEFAULT NULL;

ALTER TABLE `cn_settings` CHANGE `name` `name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

ALTER TABLE `cn_settings` CHANGE `value` `value` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

ALTER TABLE `cn_users` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `cn_settings` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `cn_private_chat_meta` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `cn_private_chats` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `cn_group_users` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `cn_group_chats` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `cn_chat_rooms` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `cn_chat_groups` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
