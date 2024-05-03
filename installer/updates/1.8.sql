INSERT INTO `cn_settings` (`id`, `name`, `value`) VALUES
(NULL, 'cloud_storage', '0'),
(NULL, 'cloud_storage_type', 'aws'),
(NULL, 'cloud_storage_endpoint', ''),
(NULL, 'cloud_storage_region', ''),
(NULL, 'cloud_storage_key', ''),
(NULL, 'cloud_storage_secret', ''),
(NULL, 'cloud_storage_bucket', ''),
(NULL, 'cloud_storage_url', ''),
(NULL, 'cloud_storage_ssl_verify', '');

UPDATE `cn_settings` SET `value` = '1.8' WHERE `cn_settings`.`name` = 'current_version';

ALTER TABLE `cn_chat_interactions` ADD INDEX `cn_chat_interactio_idx_is_noti_chat_ty_user_id_chat_id` (`is_notified`,`chat_type`,`user_id`,`chat_id`);
ALTER TABLE `cn_group_chats` ADD INDEX `cn_group_chats_idx_sender_id` (`sender_id`);
ALTER TABLE `cn_group_users` ADD INDEX `cn_group_users_idx_is_muted_user_chat_group` (`is_muted`,`USER`,`chat_group`);
ALTER TABLE `cn_private_chat_meta` ADD INDEX `cn_private_chat_me_idx_is_muted_from_user_to_user` (`is_muted`,`from_user`,`to_user`);
ALTER TABLE `cn_private_chat_meta` ADD INDEX `cn_private_chat_me_idx_from_user_to_user_id` (`from_user`,`to_user`,`id`);
ALTER TABLE `cn_private_chats` ADD INDEX `cn_private_chats_idx_user_2_sender_id` (`user_2`,`sender_id`);
ALTER TABLE `cn_private_chats` ADD INDEX `cn_private_chats_idx_user_1_sender_id` (`user_1`,`sender_id`);