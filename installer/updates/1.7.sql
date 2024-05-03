INSERT INTO `cn_settings` (`id`, `name`, `value`) VALUES
(NULL, 'hide_chat_list', '0'),
(NULL, 'disable_private_chats', '0'),
(NULL, 'domain_filter', '0'),
(NULL, 'domains_list', ''),
(NULL, 'sso_enabled', '0'),
(NULL, 'sso_home_url', ''),
(NULL, 'sso_allowed_orgins', ''),
(NULL, 'sso_login_url', ''),
(NULL, 'sso_logout_url', ''),
(NULL, 'sso_allow_profile_edit', '0'),
(NULL, 'flood_control_message_limit', '1'),
(NULL, 'flood_control_time_limit', '1'),
(NULL, 'enable_codes', '1'),
(NULL, 'user_list_auth_roles', '[]'),
(NULL, 'boxed_bg', '0'),
(NULL, 'disable_group_chats', '0'),
(NULL, 'user_list_type', '1'),
(NULL, 'chatpage_layout', 'full');

UPDATE `cn_settings` SET `value` = '1.7' WHERE `cn_settings`.`name` = 'current_version';

ALTER TABLE `cn_chat_rooms` ADD `allow_guest_view` BOOLEAN NULL DEFAULT NULL AFTER `allowed_users`;

CREATE TABLE IF NOT EXISTS `cn_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_type` smallint NOT NULL DEFAULT '1' COMMENT 'chat=1, user=2, room=3, group=4',
  `report_for` int NOT NULL,
  `chat_type` int DEFAULT NULL COMMENT 'private=1, group=2',
  `report_reason` int DEFAULT NULL,
  `report_comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `reported_by` int DEFAULT NULL,
  `reported_at` datetime DEFAULT NULL,
  `status` smallint NOT NULL COMMENT 'reported=1, read=2',
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `cn_report_reasons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `reason_for` smallint NOT NULL DEFAULT '0' COMMENT 'all=0, chat=1, user=2, room=3, group=4',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `cn_report_reasons` (`id`, `title`, `description`, `reason_for`) VALUES
(1, 'report_reason_1', 'report_reason_1_description', 0),
(2, 'report_reason_2', 'report_reason_2_description', 0),
(3, 'report_reason_3', 'report_reason_3_description', 0),
(4, 'report_reason_4', 'report_reason_4_description', 0),
(5, 'report_reason_5', 'report_reason_5_description', 0),
(6, 'report_reason_6', 'report_reason_6_description', 0),
(7, 'report_reason_7', 'report_reason_7_description', 0),
(8, 'report_reason_8', 'report_reason_8_description', 0),
(9, 'report_reason_9', 'report_reason_9_description', 0),
(10, 'report_reason_10', 'report_reason_10_description', 0);


ALTER TABLE `cn_lang_terms` ADD `section` INT NULL DEFAULT NULL AFTER `term`;


DROP TABLE IF EXISTS `cn_chat_interactions`;
CREATE TABLE IF NOT EXISTS `cn_chat_interactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chat_id` int NOT NULL,
  `user_id` int NOT NULL,
  `chat_type` smallint NOT NULL DEFAULT '1' COMMENT 'Private Chat = 1, Group Chat = 2 ',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `is_notified` tinyint(1) NOT NULL DEFAULT '0',
  `is_starred` tinyint(1) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `notified_at` datetime DEFAULT NULL,
  `starred_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


ALTER TABLE `cn_private_chat_meta` ADD `load_chats_from` DATETIME NULL DEFAULT NULL AFTER `last_chat_id`;

ALTER TABLE `cn_group_users` ADD `load_chats_from` DATETIME NULL DEFAULT NULL AFTER `is_mod`;

ALTER TABLE `cn_chat_rooms` ADD `room_notice_message` TEXT NULL DEFAULT NULL AFTER `cover_image`;

ALTER TABLE `cn_chat_rooms` ADD `room_notice_class` VARCHAR(20) NULL DEFAULT NULL AFTER `room_notice_message`;

ALTER TABLE `cn_chat_rooms` ADD `ad_chat_right_bar` TEXT NULL DEFAULT NULL AFTER `allow_guest_view`, ADD `ad_chat_left_bar` TEXT NULL DEFAULT NULL AFTER `ad_chat_right_bar`, ADD `show_background` TINYINT(1) NULL DEFAULT NULL AFTER `ad_chat_left_bar`, ADD `background_image` VARCHAR(200) NULL DEFAULT NULL AFTER `show_background`;

ALTER TABLE `cn_chat_rooms` ADD `hide_chat_list` TINYINT NULL DEFAULT NULL AFTER `created_by`, ADD `disable_private_chats` TINYINT NULL DEFAULT NULL AFTER `hide_chat_list`, ADD `disable_group_chats` TINYINT NULL DEFAULT NULL AFTER `disable_private_chats`, ADD `user_list_type` TINYINT NULL DEFAULT NULL AFTER `disable_group_chats`, ADD `user_list_auth_roles` VARCHAR(100) NULL DEFAULT '[]' AFTER `user_list_type`;