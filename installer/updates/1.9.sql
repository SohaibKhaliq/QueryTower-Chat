INSERT INTO `cn_settings` (`name`, `value`) VALUES
('react_name_1', 'Like'),
('react_name_2', 'Love'),
('react_name_3', 'Care'),
('react_name_4', 'Haha'),
('react_name_5', 'Wow'),
('react_name_6', 'Sad'),
('react_name_7', 'Angry'),
('react_enable_1', '1'),
('react_enable_2', '1'),
('react_enable_3', '1'),
('react_enable_4', '1'),
('react_enable_5', '1'),
('react_enable_6', '1'),
('react_enable_7', '1'),
('react_css_1', 'animate__rubberBand'),
('react_css_2', 'animate__heartBeat'),
('react_css_3', 'animate__headShake'),
('react_css_4', 'animate__swing'),
('react_css_5', 'animate__tada'),
('react_css_6', 'animate__swing'),
('react_css_7', 'animate__headShake'),
('enable_badges', '0'),
('enable_videos', '1'),
('custom_menus', '0'),
('room_auto_join', '0');

UPDATE `cn_settings` SET `value` = 'http://ip-api.com/json/' WHERE `cn_settings`.`name` = 'geoip_api_endpoint';

DROP TABLE IF EXISTS `cn_pages`;
CREATE TABLE IF NOT EXISTS `cn_pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `show_banner` tinyint(1) NOT NULL DEFAULT '1',
  `members_only` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB ;


DROP TABLE IF EXISTS `cn_menus`;
CREATE TABLE IF NOT EXISTS `cn_menus` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permalink` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target` varchar(50) DEFAULT NULL,
  `icon_class` varchar(50) DEFAULT NULL,
  `css_class` varchar(50) DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  `menu_order` int DEFAULT NULL,
  `members_only` tinyint(1) NOT NULL DEFAULT '0',
  `status` smallint NOT NULL,
  `parent_menu_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;


DROP TABLE IF EXISTS `cn_badges`;
CREATE TABLE `cn_badges` (
  `id` INT NOT NULL AUTO_INCREMENT , 
  `name` VARCHAR(50) NULL , 
  `icon` VARCHAR(200) NULL , 
  `status` BOOLEAN NOT NULL DEFAULT TRUE , 
  `is_editable` BOOLEAN NOT NULL DEFAULT TRUE , 
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

ALTER TABLE `cn_users` ADD `badges` VARCHAR(200) NULL DEFAULT NULL AFTER `auth_key`;

ALTER TABLE `cn_chat_rooms` ADD `room_auto_join` BOOLEAN  NULL DEFAULT NULL AFTER `user_list_auth_roles`;

ALTER TABLE `cn_group_chats` ADD `reactions` VARCHAR(50) NULL DEFAULT NULL AFTER `status`;
ALTER TABLE `cn_private_chats` ADD `reactions` VARCHAR(50) NULL DEFAULT NULL AFTER `status`;
ALTER TABLE `cn_chat_interactions` ADD `reaction` TINYINT NOT NULL DEFAULT '0' COMMENT '0=Null, 1=react_1, 2=react_2, 3=react_3, 4=react_4, 5=react_5, 6=react_6, 7=react_7' AFTER `is_deleted`;
ALTER TABLE `cn_chat_interactions` ADD `reacted_at` DATETIME NULL AFTER `deleted_at`;

UPDATE `cn_settings` SET `value` = '1.9' WHERE `cn_settings`.`name` = 'current_version';