DROP TABLE IF EXISTS `cn_ip_logs`;
CREATE TABLE IF NOT EXISTS `cn_ip_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  `type` int(11) NOT NULL DEFAULT '1' COMMENT '1 login, 2, register, 3 pass reset',
  `message` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `cn_users` ADD `activation_key` VARCHAR(50) NULL DEFAULT NULL AFTER `country`;

ALTER TABLE `cn_users` ADD `auth_key` VARCHAR(100) NULL DEFAULT NULL AFTER `activation_key`;

ALTER TABLE `cn_languages` ADD `google_font_family` VARCHAR(30) NULL DEFAULT NULL AFTER `direction`;

ALTER TABLE `cn_push_devices` CHANGE `created_at` `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

INSERT INTO `cn_settings` (`id`, `name`, `value`) VALUES
(NULL, 'allow_multiple_sessions', '1'),
(NULL, 'push_provider', 'firebase'),
(NULL, 'guest_inactive_hours', '48'),
(NULL, 'enable_recaptcha', '0'),
(NULL, 'enable_ip_logging', '0'),
(NULL, 'enable_ip_blacklist', '0'),
(NULL, 'autodetect_country', '0'),
(NULL, 'geoip_api_endpoint', 'https://freegeoip.app/json/'),
(NULL, 'enable_email_verification', '0'),
(NULL, 'disable_join_confirmation', '0'),
(NULL, 'email_smtp', '1'),
(NULL, 'enable_multiple_languages', '0');

UPDATE `cn_settings` SET `value` = '1.5' WHERE `cn_settings`.`name` = 'current_version';
