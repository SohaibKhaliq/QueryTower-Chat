CREATE TABLE IF NOT EXISTS `cn_notifications`(
    `id` INT NOT NULL AUTO_INCREMENT,
    `type` TINYINT NULL DEFAULT '1' COMMENT '1=general, 2=mention, 3=reminder',
    `content` VARCHAR(300) NULL DEFAULT NULL,
    `user_id` INT NULL DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `is_read` BOOLEAN NULL DEFAULT FALSE,
    `read_at` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY(`id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

UPDATE `cn_settings` SET `value` = '1.8.1' WHERE `cn_settings`.`name` = 'current_version';

ALTER TABLE `cn_users` ADD FULLTEXT `name` (`first_name`, `last_name`);

ALTER TABLE `cn_notifications` ADD INDEX `cn_notifications_idx_user_id_is_read`(`user_id`, `is_read`);
ALTER TABLE `cn_chat_interactions` ADD INDEX `cn_chat_interactio_idx_chat_ty_user_id_chat_id`(`chat_type`, `user_id`, `chat_id`);
ALTER TABLE `cn_private_chats` ADD INDEX `cn_private_chats_idx_sender_id_time_status`(`sender_id`, `status`, `time`);
ALTER TABLE `cn_group_chats` ADD INDEX `cn_group_chats_idx_sender_id_time_status`(`sender_id`, `status`, `time`);