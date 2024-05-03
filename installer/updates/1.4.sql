CREATE TABLE IF NOT EXISTS `cn_push_devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` text NOT NULL,
  `device` varchar(300) DEFAULT NULL,
  `perm_group` tinyint(1) NOT NULL DEFAULT '0',
  `perm_private` tinyint(1) NOT NULL DEFAULT '1',
  `perm_mentions` tinyint(1) NOT NULL DEFAULT '1',
  `perm_notice` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `cn_social_logins` (
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_key` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `secret_key` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `cn_radio_stations` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


ALTER TABLE `cn_group_users` ADD `is_mod` BOOLEAN NOT NULL DEFAULT FALSE AFTER `unread_count`;

ALTER TABLE `cn_chat_rooms` CHANGE `slug` `slug` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

UPDATE `cn_settings` SET `value` = '1.4' WHERE `cn_settings`.`name` = 'current_version';

ALTER TABLE  `cn_group_users` ADD INDEX `cn_group_users_idx_chat_group`(`chat_group`);

ALTER TABLE `cn_private_chat_meta` ADD INDEX `cn_private_chat_me_idx_to_user_room_id_from_user`(`to_user`, `room_id`, `from_user`);

ALTER TABLE `cn_private_chats` ADD INDEX `cn_private_chats_idx_id`(`id`);

ALTER TABLE `cn_users` ADD INDEX `cn_users_idx_id`(`id`);

ALTER TABLE `cn_private_chats` ADD INDEX `cn_private_chats_idx_user_1_user_2_room_id_sender_id`(`user_1`, `user_2`, `room_id`, `sender_id`);

ALTER TABLE `cn_group_chats` ADD INDEX `cn_group_chats_idx_id_group_id_sender_id`(`id`, `group_id`, `sender_id`);

ALTER TABLE `cn_group_chats` ADD INDEX `cn_group_chats_idx_group_id_room_id`(`group_id`, `room_id`);

ALTER TABLE `cn_group_chats` ADD INDEX `cn_group_chats_idx_id_group_id_room_id`(`id`, `group_id`, `room_id`);

ALTER TABLE `cn_private_chats` ADD INDEX `cn_private_chats_idx_user_1_user_2_room_id`(`user_1`, `user_2`, `room_id`);

ALTER TABLE `cn_private_chats` ADD INDEX `cn_private_chats_idx_id_user_1_user_2_room_id`(`id`, `user_1`, `user_2`, `room_id`);

ALTER TABLE `cn_private_chat_meta` ADD INDEX `cn_private_chat_me_idx_from_user_to_user` (`from_user`,`to_user`);

ALTER TABLE `cn_group_users` ADD INDEX `cn_group_users_idx_user` (`user`);

ALTER TABLE `cn_chat_groups` ADD INDEX `cn_chat_groups_idx_id` (`id`);

ALTER TABLE `cn_users` ADD INDEX `cn_users_idx_user_type` (`user_type`);

ALTER TABLE `cn_chat_groups` ADD INDEX `cn_chat_groups_idx_chat_room_slug` (`chat_room`, `slug`);

ALTER TABLE `cn_chat_rooms` ADD INDEX `cn_chat_rooms_idx_created_by` (`created_by`);

ALTER TABLE `cn_chat_rooms` ADD INDEX `cn_chat_rooms_idx_status_is_visible` (`status`, `is_visible`);

ALTER TABLE `cn_chat_rooms` ADD INDEX `cn_chat_rooms_idx_slug` (`slug`);

ALTER TABLE `cn_chat_rooms` ADD INDEX `cn_chat_rooms_idx_id` (`id`);

ALTER TABLE `cn_translations` ADD INDEX `cn_translations_idx_term_id_lang_code` (`term_id`, `lang_code`);

ALTER TABLE `cn_group_users` ADD INDEX `cn_group_users_idx_user_chat_group` (`user`, `chat_group`);

ALTER TABLE `cn_private_chats` ADD INDEX `cn_private_chats_idx_updated_at_user_1_user_2_room_id` (`updated_at`, `user_1`, `user_2`, `room_id`);

ALTER TABLE `cn_group_chats` ADD INDEX `cn_group_chats_idx_updated_at_group_id` (`updated_at`, `group_id`);

ALTER TABLE `cn_chat_groups` ADD INDEX `cn_chat_groups_idx_slug` (`slug`);
