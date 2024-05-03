<?php
session_start();
define('DS', DIRECTORY_SEPARATOR);
define('BASE_PATH', __DIR__ . DS);

require BASE_PATH.'vendor/autoload.php';
require BASE_PATH.'config/init.php';

if (file_exists(BASE_PATH.'config/settings.php')) {

    // Include shortcut functions used in template htmls.
    require BASE_PATH.'config/template_functions.php';

    // URLs
    $route->any('/', 'App\homeController@index')->as('index');
    $route->any('/login', 'App\homeController@login')->as('login');
    $route->any('/guest-login', 'App\homeController@guest_login')->as('guest-login');
    $route->any('/logout', 'App\homeController@logout')->as('logout');
    $route->any('/register', 'App\homeController@register')->as('register');
    $route->any('/forgot-password', 'App\homeController@forgot_password')->as('forgot-password');
    $route->any('/reset-password', 'App\homeController@reset_password')->as('reset-password');
    $route->any('/activate', 'App\homeController@activate')->as('activate');
    $route->any('/resend-activation', 'App\homeController@resend_activation')->as('resend-activation');
    $route->any('/privacy', 'App\homeController@privacy')->as('privacy');
    $route->any('/terms', 'App\homeController@terms')->as('terms');
    $route->any('/about', 'App\homeController@about')->as('about');
    $route->any('/contact', 'App\homeController@contact')->as('contact');
    $route->get('/css/color_css', 'App\homeController@color_css')->as('color_css');
    $route->any('/dashboard', 'App\adminController@index')->as('dashboard');
    $route->any('/install', 'App\installController@installed')->as('installed');
    $route->any('/update', 'App\installController@update')->as('update');
    $route->any('/manifest', 'App\homeController@manifest')->as('manifest');
    $route->any('/offline', 'App\homeController@offline')->as('offline');
    $route->any('/pwabuilder-sw.js', 'App\homeController@pwabuilder_sw')->as('pwabuilder-sw');
    $route->any('/service-worker.js', 'App\homeController@pushy_sw')->as('pushy-sw');
    $route->any('/{chatroomslug}', 'App\homeController@chat_room')->as('chat-room');
    $route->any('/{chatroomslug}/pwabuilder-sw.js', 'App\homeController@pwabuilder_sw')->as('chat-room-pwabuilder-sw');
    $route->get('/js/chatnet_js', 'App\homeController@chatnet_js')->as('chatnet_js');
    $route->get('/js/index_js', 'App\homeController@index_js')->as('index_js');
    $route->get('/js/scripts_js', 'App\homeController@scripts_js')->as('scripts_js');
    $route->get('/js/firebase-messaging-sw', 'App\homeController@firebase_messaging_sw')->as('firebase-messaging-sw');
    $route->any('/setlang/{reqlang}', 'App\homeController@setlang')->as('setlang');
    $route->any('/settheme/{reqtheme}', 'App\homeController@settheme')->as('settheme');
    $route->any('/login/callback', 'App\homeController@hybridauth_callback')->as('sociallogin-callback');
    $route->any('/page/{slug}', 'App\homeController@page')->as('page');

    $route->any('/sso/login', 'App\ssoController@login')->as('sso-login');
    $route->any('/sso/js', 'App\ssoController@js')->as('sso-js');

    $route->any('/widget/room-list', 'App\widgetController@room_list')->as('widget-room-list');

    

    // Dashboard URLs
    $route->any('/dashboard/general', 'App\adminController@general')->as('dashboard-general');
    $route->any('/dashboard/email', 'App\adminController@email')->as('dashboard-email');
    $route->any('/dashboard/timing', 'App\adminController@timing')->as('dashboard-timing');
    $route->any('/dashboard/image', 'App\adminController@image')->as('dashboard-image');
    $route->any('/dashboard/color', 'App\adminController@color')->as('dashboard-color');
    $route->any('/dashboard/chatpage', 'App\adminController@chatpage')->as('dashboard-chatpage');
    $route->any('/dashboard/homepage', 'App\adminController@homepage')->as('dashboard-homepage');
    $route->any('/dashboard/header', 'App\adminController@header')->as('dashboard-header');
    $route->any('/dashboard/footer', 'App\adminController@footer')->as('dashboard-footer');
    $route->any('/dashboard/gif', 'App\adminController@gif')->as('dashboard-gif');
    $route->any('/dashboard/policy', 'App\adminController@policy')->as('dashboard-policy');
    $route->any('/dashboard/about', 'App\adminController@about')->as('dashboard-about');
    $route->any('/dashboard/contact', 'App\adminController@contact')->as('dashboard-contact');
    $route->any('/dashboard/chatroom_edit', 'App\adminController@chatroom_edit')->as('dashboard-chatroom-edit');
    $route->any('/dashboard/chatroom_list', 'App\adminController@chatroom_list')->as('dashboard-chatroom-list');
    $route->any('/dashboard/chatroom_users', 'App\adminController@chatroom_users')->as('dashboard-chatroom-users');
    $route->any('/dashboard/user_list', 'App\adminController@user_list')->as('dashboard-user-list');
    $route->any('/dashboard/user_list-data', 'App\adminController@user_list_data')->as('dashboard-user-list-data');
    $route->any('/dashboard/user_view', 'App\adminController@user_view')->as('dashboard-user-view');
    $route->any('/dashboard/user_add', 'App\adminController@user_add')->as('dashboard-user-add');
    $route->any('/dashboard/user_chats', 'App\adminController@user_chats')->as('dashboard-user-chats');
    $route->any('/dashboard/load-chats', 'App\adminController@load_chats')->as('dashboard-load-chats');
    $route->any('/dashboard/load-more-chats', 'App\adminController@load_more_chats')->as('dashboard-load-more-chats');
    $route->any('/dashboard/languages', 'App\adminController@languages')->as('dashboard-languages');
    $route->any('/dashboard/language-edit', 'App\adminController@language_edit')->as('dashboard-language-edit');
    $route->any('/dashboard/language-translation', 'App\adminController@language_translation')->as('dashboard-language-translation');
    $route->any('/dashboard/profanity', 'App\adminController@profanity')->as('dashboard-profanity');
    $route->any('/dashboard/guest_list', 'App\adminController@guest_list')->as('dashboard-guest-list');
    $route->any('/dashboard/guest_list-data', 'App\adminController@guest_list_data')->as('dashboard-guest-list-data');
    $route->get('/dashboard/js/admin_js', 'App\adminController@admin_js')->as('dashboard-admin_js');
    $route->any('/dashboard/rebuild-translate', 'App\adminController@rebuild_translate')->as('dashboard-rebuild-translate');
    $route->any('/dashboard/pwa', 'App\adminController@pwa')->as('dashboard-pwa');
    $route->any('/dashboard/registration-settings', 'App\adminController@registration_settings')->as('dashboard-registration-settings');
    $route->any('/dashboard/advertisements', 'App\adminController@advertisements')->as('dashboard-advertisements');
    $route->any('/dashboard/notification', 'App\adminController@notification')->as('dashboard-notification');
    $route->any('/dashboard/social-login', 'App\adminController@social_login')->as('dashboard-social-login');
    $route->any('/dashboard/radio', 'App\adminController@radio')->as('dashboard-radio');
    $route->any('/dashboard/set-view-as', 'App\adminController@set_view_as')->as('dashboard-set-view-as');
    $route->any('/dashboard/maintenance', 'App\adminController@maintenance')->as('dashboard-maintenance');
    $route->any('/dashboard/recaptcha', 'App\adminController@recaptcha')->as('dashboard-recaptcha');
    $route->any('/dashboard/ip-access', 'App\adminController@ip_access')->as('dashboard-ip-access');
    $route->any('/dashboard/fonts', 'App\adminController@fonts')->as('dashboard-font');
    $route->any('/dashboard/ip-logs', 'App\adminController@ip_logs')->as('dashboard-ip-logs');
    $route->any('/dashboard/ip-logs-data', 'App\adminController@ip_logs_data')->as('dashboard-ip-logs-data');
    $route->any('/dashboard/flaged-content', 'App\adminController@flaged_content')->as('dashboard-flaged-content');
    $route->any('/dashboard/flaged-content-data', 'App\adminController@flaged_content_data')->as('dashboard-flaged-content-data');
    $route->any('/dashboard/flaged-view', 'App\adminController@flaged_view')->as('dashboard-flaged-view');
    $route->any('/dashboard/flaged-resolve', 'App\adminController@flaged_resolve')->as('dashboard-flaged-resolve');
    $route->any('/dashboard/domain-filter', 'App\adminController@domain_filter')->as('dashboard-domain-filter');
    $route->any('/dashboard/flood-control', 'App\adminController@flood_control')->as('dashboard-flood-control');
    $route->any('/dashboard/sso', 'App\adminController@sso')->as('dashboard-sso');
    $route->any('/dashboard/cloud-storage', 'App\adminController@cloud_storage')->as('dashboard-cloud-storage');
    $route->any('/dashboard/check-user-type', 'App\adminController@check_user_type')->as('dashboard-check-user-type');
    $route->any('/dashboard/reactions', 'App\adminController@reactions')->as('dashboard-reactions');
    $route->any('/dashboard/pages', 'App\adminController@pages')->as('dashboard-pages');
    $route->any('/dashboard/pages/add', 'App\adminController@add_page')->as('dashboard-add-page');
    $route->any('/dashboard/menus', 'App\adminController@menus')->as('dashboard-menus');
    $route->any('/dashboard/badges', 'App\adminController@badges')->as('dashboard-badges');
    $route->any('/dashboard/video-calling', 'App\adminController@video_calling')->as('dashboard-video-calling');

    //Dashboard Ajax
    $route->any('/dashboard/ajax/pages/save', 'App\adminAjaxController@save_page')->as('dashboard-ajax-save-page');
    $route->any('/dashboard/ajax/pages/delete', 'App\adminAjaxController@delete_page')->as('dashboard-ajax-delete-page');
    $route->any('/dashboard/ajax/menu/update', 'App\adminAjaxController@menu_update')->as('dashboard-ajax-menu-update');
    $route->any('/dashboard/ajax/badges/update', 'App\adminAjaxController@badges_update')->as('dashboard-ajax-badges-update');
    $route->any('/dashboard/ajax/badges/assign', 'App\adminAjaxController@badges_assign')->as('dashboard-ajax-assign-badges');
    
    // Ajax
    $route->any('ajax/heartbeat', 'App\ajaxController@heartbeat')->as('ajax-heartbeat');
    $route->any('ajax/save-message', 'App\ajaxController@save_message')->as('ajax-save-message');
    $route->any('ajax/get-active-info', 'App\ajaxController@get_active_info')->as('ajax-get-active-info');
    $route->any('ajax/load-chats', 'App\ajaxController@load_chats')->as('ajax-load-chats');
    $route->any('ajax/save-profile', 'App\ajaxController@save_profile')->as('ajax-save-profile');
    $route->any('ajax/add-profile', 'App\ajaxController@add_profile')->as('ajax-add-profile');
    $route->any('ajax/online-list', 'App\ajaxController@online_list')->as('ajax-online-list');
    $route->any('ajax/load-more-online-list', 'App\ajaxController@load_more_online_list')->as('ajax-load-more-online-list');
    $route->any('ajax/updated-chats', 'App\ajaxController@updated_chats')->as('ajax-updated-chats');
    $route->any('ajax/send-images', 'App\ajaxController@send_images')->as('ajax-send-images');
    $route->any('ajax/send-files', 'App\ajaxController@send_files')->as('ajax-send-files');
    $route->any('ajax/send-audio', 'App\ajaxController@send_audio')->as('ajax-send-audio');
    $route->any('ajax/get-strickers', 'App\ajaxController@get_stickers')->as('ajax-get-stickers');
    $route->any('ajax/active-user-restriction', 'App\ajaxController@active_user_restriction')->as('ajax-active-user-restriction');
    $route->any('ajax/active-group-restriction', 'App\ajaxController@active_group_restriction')->as('ajax-active-group-restriction');
    $route->any('ajax/change-user-status', 'App\ajaxController@change_user_status')->as('ajax-change-user-status');
    $route->any('ajax/update-settings', 'App\ajaxController@update_settings')->as('ajax-update-settings');
    $route->any('ajax/update-chatroom', 'App\ajaxController@update_chatroom')->as('ajax-update-chatroom');
    $route->any('ajax/get-chatroom', 'App\ajaxController@get_chatroom')->as('ajax-get-chatroom');
    $route->any('ajax/get-chatroom-basic', 'App\ajaxController@get_chatroom_basic')->as('ajax-get-chatroom-basic');
    $route->any('ajax/chatroom-user-restriction', 'App\ajaxController@chatroom_user_restriction')->as('ajax-chatroom-user-restriction');
    $route->any('ajax/chatroom-user-mod', 'App\ajaxController@chatroom_user_mod')->as('ajax-chatroom-user-mod');
    $route->any('ajax/chatroom-remove-bg', 'App\ajaxController@chatroom_remove_bg')->as('ajax-chatroom-remove-bg');
    $route->any('ajax/load-more-chats', 'App\ajaxController@load_more_chats')->as('ajax-load-more-chats');
    $route->any('ajax/ajax-chatroom-search', 'App\ajaxController@chatroom_search')->as('ajax-chatroom-search');
    $route->any('ajax/ajax-chatroom-load-more', 'App\ajaxController@chatroom_load_more')->as('ajax-chatroom-load-more');
    $route->any('ajax/ajax-delete-message', 'App\ajaxController@delete_message')->as('ajax-delete-message');
    $route->any('ajax/ajax-launch-call', 'App\ajaxController@launch_call')->as('ajax-launch-call');
    $route->any('ajax/language-update', 'App\ajaxController@language_update')->as('ajax-language-update');
    $route->any('ajax/language-delete', 'App\ajaxController@language_delete')->as('ajax-language-delete');
    $route->any('ajax/update_translation', 'App\ajaxController@update_translation')->as('ajax-update-translation');
    $route->any('ajax/delete_guests', 'App\ajaxController@delete_guests')->as('ajax-delete-guests');
    $route->any('ajax/ajax-update-push-device', 'App\ajaxController@update_push_device')->as('ajax-update-push-device');
    $route->any('ajax/delete_users', 'App\ajaxController@delete_users')->as('ajax-delete-users');
    $route->any('ajax/chat-search', 'App\ajaxController@chat_search')->as('ajax-chat-search');
    $route->any('ajax/room-user-search', 'App\ajaxController@room_user_search')->as('ajax-room-user-search');
    $route->any('/install/ajax', 'App\installController@ajax')->as('ajax');
    $route->any('ajax/get-message', 'App\ajaxController@get_message')->as('ajax-get-message');
    $route->any('ajax/delete-chatroom', 'App\ajaxController@delete_chatroom')->as('ajax-delete-chatroom');
    $route->any('ajax/delete-chats', 'App\ajaxController@delete_chats')->as('ajax-delete-chats');
    $route->any('ajax/forward-message', 'App\ajaxController@forward_message')->as('ajax-forward-message');
    $route->any('ajax/room-list-unread', 'App\ajaxController@room_list_unread')->as('ajax-room-list-unread');
    $route->any('ajax/social-login-update', 'App\ajaxController@social_login_update')->as('ajax-social-login-update');
    $route->any('ajax/radio-update', 'App\ajaxController@radio_update')->as('ajax-radio-update');
    $route->any('ajax/get-recent', 'App\ajaxController@get_recent')->as('ajax-get-recent');
    $route->any('ajax/login', 'App\ajaxController@login')->as('ajax-login');
    $route->any('ajax/get-report-reasons', 'App\ajaxController@get_report_reasons')->as('ajax-get-report-reasons');
    $route->any('ajax/submit-report', 'App\ajaxController@submit_report')->as('ajax-submit-report');
    $route->any('ajax/deactivate-user', 'App\ajaxController@deactivate_user')->as('ajax-deactivate-user');
    $route->any('ajax/deactivate-room', 'App\ajaxController@deactivate_room')->as('ajax-deactivate-room');
    $route->any('ajax/leave-room', 'App\ajaxController@leave_room')->as('ajax-leave-room');
    $route->any('ajax/clear-chats', 'App\ajaxController@clear_chats')->as('ajax-clear-chats');
    $route->any('ajax/remove-setting', 'App\ajaxController@remove_setting')->as('ajax-remove-setting');
    $route->any('ajax/room-list', 'App\ajaxController@room_list')->as('ajax-room-list');
    $route->any('ajax/users-by-name', 'App\ajaxController@users_by_name')->as('ajax-users-by-name');
    $route->any('ajax/notification-list', 'App\ajaxController@notification_list')->as('ajax-notification-list');
    $route->any('ajax/notification-read', 'App\ajaxController@notification_read')->as('ajax-update-noti-read');
    $route->any('ajax/notification-delete', 'App\ajaxController@notification_delete')->as('ajax-delete-noti');
    $route->any('ajax/notification-unread-count', 'App\ajaxController@notification_unread_count')->as('ajax-noti-unread-count');
    $route->any('ajax/get-recent-active-media', 'App\ajaxController@get_recent_active_media')->as('ajax-get-active-recent-media');
    $route->any('ajax/message-reaction', 'App\ajaxController@message_reaction')->as('ajax-message-reaction');
    $route->any('ajax/message-reaction-list', 'App\ajaxController@message_reaction_list')->as('ajax-message-reaction-list');
    $route->any('ajax/message-reaction-remove', 'App\ajaxController@message_reaction_remove')->as('ajax-remove-message-reaction');

    $route->any('ajax/ajax-launch-private-call', 'App\ajaxController@launch_private_call')->as('ajax-launch-private-call');
    $route->any('ajax/ajax-answer-private-call', 'App\ajaxController@answer_private_call')->as('ajax-answer-private-call');
    $route->any('ajax/ajax-hangup-private-call', 'App\ajaxController@hangup_private_call')->as('ajax-hangup-private-call');
    $route->any('ajax/ajax-connect-private-call', 'App\ajaxController@connect_private_call')->as('ajax-connect-private-call');
    $route->any('ajax/ajax-check-call-status', 'App\ajaxController@check_call_status')->as('ajax-check-call-status');

    // cron jobs
    $route->any('cron/delete-guests', 'App\cronController@delete_guests')->as('cron-delete-guests');
    $route->any('cron/delete-group-chats', 'App\cronController@delete_group_chats')->as('cron-delete-group-chats');
    $route->any('cron/delete-private-chats', 'App\cronController@delete_private_chats')->as('cron-delete-private-chats');

    // chat rooms
    $route->any('/{chatroomslug}/{activechat}?', 'App\homeController@chat_room')->as('chat-room-active');

}else{
    $route->any('/', 'App\installController@index')->as('index');
    $route->any('/install', 'App\installController@install')->as('install');
    $route->any('/install/ajax', 'App\installController@ajax')->as('ajax');
}

$route->end();

?>
