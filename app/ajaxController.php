<?php
namespace App;

/* This class is handling all the ajax requests */

class ajaxController{

    function __construct() {
        // Verify CSFR
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // if(! app('csfr')->verifyToken(SECRET_KEY) ){
            //     //header('HTTP/1.0 403 Forbidden');
            //     //exit();
            // }
        }

        if(isset($_GET['view-as'])){
            $_SESSION['view-as'] = app('auth')->get_user_by_id($_GET['view-as']);
        }
    }

    // Saving received messages
    public function save_message(){
        $save_msg = true;
        $post_data = app('request')->body;
        $profanity_found = false;
        if (in_array($post_data['message_type'], array(2,6,7))) {
            $message_content = app('purify')->xss_clean($post_data['message_content']);
        }else if ($post_data['message_type'] == 8) {
            $content = json_decode($post_data['message_content'], true);
            if (in_array($content['new_message']['new_type'], array(2,6,7,10))) {
                $content['new_message']['new_content'] = app('purify')->xss_clean($content['new_message']['new_content']);
                $message_content = json_encode($content);
            }else if ($content['new_message']['new_type'] == 1) {
                preg_match('/\b(?:(?:https?):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]/i', $content['new_message']['new_content'], $message_links);
                if (!empty($message_links[0])) {
                   
                    $url_data = get_url_data_v2($message_links[0]);
                    $url_data['url'] = $message_links[0];
                    $link_message_content = array();
                    $link_message_content['message'] = app('purify')->xss_clean($content['new_message']['new_content']);
                    $content['new_message']['new_content'] = array_merge($link_message_content,$url_data);
                    $content['new_message']['new_type'] = 5;
                    $message_content = json_encode($content,JSON_UNESCAPED_UNICODE);

                }else{
                    // Check profanity
                    if (isset(SETTINGS['profanity_filter']) && SETTINGS['profanity_filter'] == true) {
                        $message_content_filtered = profanity_filter($content['new_message']['new_content']);
                        if ($message_content_filtered != $content['new_message']['new_content']) {
                            $content['new_message']['new_content'] = $message_content_filtered;
                            $profanity_found = true;
                        }
                    }

                    $content['new_message']['new_content'] = clean($content['new_message']['new_content']);
                    $message_content = json_encode($content);
                }

            }else{
                $content['new_message']['new_content'] = app('purify')->xss_clean(clean($content['new_message']['new_content']));
                $message_content = json_encode($content);
            }

        }else if(($post_data['message_type'] == 1)){
            $message_content = clean($post_data['message_content']);
        }else if(($post_data['message_type'] == 10)){
            $message_content = json_decode($post_data['message_content'], true);
            $message_content['code'] = ($message_content['code']);
            $message_content = json_encode($message_content);
        }else if(($post_data['message_type'] == 11)){
            $message_content = json_decode($post_data['message_content'], true);
            $message_content['content'] = ($message_content['content']);
            $message_content = json_encode($message_content);
        }
        else{
            $message_content = app('purify')->xss_clean(clean($post_data['message_content']));
        }

        // Check profanity
        if(!in_array($post_data['message_type'], array(2,3,4,6,7,8,9,10))){
            if (isset(SETTINGS['profanity_filter']) && SETTINGS['profanity_filter'] == true) {
                $message_content_filtered = profanity_filter($message_content);
                if ($message_content_filtered != $message_content) {
                    $message_content = $message_content_filtered;
                    $profanity_found = true;
                }
            }
        }

        // get links inside message
        if ($post_data['message_type'] == 1) {
            preg_match('/\b(?:(?:https?):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]/i', $message_content, $message_links);
            if (!empty($message_links[0])) {
                $allowed_link =  true;
                if (isset(SETTINGS['domain_filter']) && SETTINGS['domain_filter'] == true) {
                    if (checkLinkValidity($message_links[0])==false) {
                        $allowed_link =  false;
                    }
                }
                if ($allowed_link) {
                    $url_data = get_url_data_v2($message_links[0]);
                    $url_data['url'] = $message_links[0];
                    $link_message_content = array();
                    $link_message_content['message'] = $message_content;
                    $link_message_content = array_merge($link_message_content,$url_data);
                    $message_content = json_encode($link_message_content,JSON_UNESCAPED_UNICODE);
                    $post_data['message_type'] = 5; // message with links
                }else{
                    $message_content = __('Blocked Domain, Message Not Sent.');
                    $profanity_found = true;
                    $save_msg = false;
                }
                
            }
        }
        if ($save_msg) {
            $chat_save = app('chat')->saveNewMessage(
                app('auth')->user()['id'],
                $message_content,
                app('purify')->xss_clean(clean($post_data['active_user'])),
                app('purify')->xss_clean(clean($post_data['active_group'])),
                app('purify')->xss_clean(clean($post_data['active_room'])),
                app('purify')->xss_clean(clean($post_data['message_type'])),
                app('purify')->xss_clean(clean($post_data['chat_meta_id']))
            );
            $chat_save['random_id'] = $post_data['random_id'];
            if ($profanity_found) {
                if ($post_data['message_type'] == 8){
                    $chat_save['profanity_filtered'] = json_decode($message_content, true)['new_message']['new_content'];
                }else if ($post_data['message_type'] == 5){
                    $chat_save['profanity_filtered'] = json_decode($message_content, true)['message'];
                }else{
                    $chat_save['profanity_filtered'] = $message_content;
                }
            }else{
                $chat_save['profanity_filtered'] = null;
            }

            // trigger @mention notification /@(\W*\w+( \W*\w+)*)-(\d*)/im
            if(!$post_data['active_user']){
                preg_match_all('/@(\W*\w+( \W*\w+)*)-(\d*)/im', $post_data['message_content'], $message_metions);
                if (isset($message_metions[3])) {
                    foreach ($message_metions[3] as $this_metions) {
                        app('db')->where('id', $post_data['active_room']);
                        $room = app('db')->getOne('chat_rooms');
                        if ($room) {
                            $room_name = $room['name'];
                        }else{
                            $room_name = 'a room';
                        }
                        $mentioned_by = app('auth')->user(app('auth')->user()['id']);
                        $noti_txt = $mentioned_by['first_name'] . " " .$mentioned_by['last_name']. " has mentioned you in " . $room_name;
                        $noti_content = array(
                            'chat_id' => $chat_save['id'],
                            'room_id' => $post_data['active_room'],
                            'group_id' => $post_data['active_group'],
                            'content' => $noti_txt,
                            'avatar' => $mentioned_by['avatar'],
                            'mentioned_by' => $mentioned_by['first_name'] . " " .$mentioned_by['last_name']
                        );
                        $noti_save = app('chat')->add_notification(
                            2, json_encode($noti_content), $this_metions
                        );

                    }
                }
            }
    
            // sending push notification to users
            send_notification($post_data['active_user'], $post_data['active_room'], $message_content, $post_data['message_type']);

            return json_response($chat_save);

        }else{
            $return_data = array();
            if ($profanity_found) {
                $return_data['profanity_filtered'] = $message_content;
            }else{
                $return_data['profanity_filtered'] = null;
            }    
            $return_data['status'] = true;
            $return_data['message'] = 'null';
            $return_data['id'] = null;
            $return_data['time'] = date("Y-m-d H:i:s");
            $return_data['preview'] = null;
            $return_data['random_id'] = $post_data['random_id'];
            json_response($return_data);
        }

    }

    // main heartbeat function to keep the chat alive.
    public function heartbeat(){
        $last_seen_data = Array ( 'last_seen' => app('db')->now());
        app('db')->where ('id', app('auth')->user()['id']);
        app('db')->update ('users', $last_seen_data);

        $post_data = app('request')->body;
        $data = array();
        if($post_data['active_user']) {
            $data['chat_access'] = app('chat')->chatUserAccessCheck($post_data['active_user'], $post_data['active_room']);
            if($post_data['active_user'] > app('auth')->user()['id']) {
                $user_1 = app('auth')->user()['id'];
                $user_2 = $post_data['active_user'];
            }else{
                $user_1 = $post_data['active_user'];
                $user_2 = app('auth')->user()['id'];
            }

            $data['chat_type'] = "user";
            // get new messages
            $chat_meta_data = app('chat')->getChatMetaData(app('auth')->user()['id'], $post_data['active_user'], $post_data['active_room']);

            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.id', $post_data['last_chat_id'], ">");
            app('db')->where ('c.user_1', $user_1);
            app('db')->where ('c.user_2', $user_2);
            if($chat_meta_data['load_chats_from']){
                app('db')->where ('c.time >= "' . $chat_meta_data['load_chats_from'] .'"');
            }
            app('db')->where ("c.sender_id != " . app('auth')->user()['id']);
            $chats = app('db')->get('private_chats c', null, 'c.*, u.user_name, u.first_name, u.last_name, u.avatar, u.user_type, \'private\' as chat_type');
            $update_meta = array();
            $update_meta['chat_meta_id'] = $post_data['chat_meta_id'];
            $update_meta['is_typing'] = $post_data['is_typing'];
            app('chat')->updateChatMetaData($update_meta);

            $active_user = app('auth')->user($post_data['active_user']);
            $last_seen = strtotime($active_user['last_seen']);
            $seconds10 = strtotime("-10 seconds");

            //active user chat meta
            $active_user_chat_meta_data = app('chat')->getChatMetaData($post_data['active_user'], app('auth')->user()['id'], $post_data['active_room']);
            $data['last_seen'] = date('Y-m-d H:i:s', $last_seen);
            $data['seconds10'] = date('Y-m-d H:i:s', $seconds10);

            if($active_user_chat_meta_data['is_typing']){
                $active_user = app('auth')->user($post_data['active_user']);

                if($last_seen > $seconds10){
                    $data['typing_user'] = "typing...";
                }else{
                    $data['typing_user'] = 0;
                }
            }else{
                $data['typing_user'] = 0;
            }
            if (app('auth')->isAuthenticated() == true){
                $from_user_chat_meta_data = app('chat')->getChatMetaData(app('auth')->user()['id'], $post_data['active_user'], $post_data['active_room']);
                $data['is_muted'] = $from_user_chat_meta_data['is_muted'];
            }
        }else{
            $data['chat_type'] = "group";
            $data['chat_access'] = app('chat')->chatRoomAccessCheck($post_data['active_group']);
            $typing_users = app('chat')->getGroupChatTypingUsers(app('auth')->user()['id'], $post_data['active_group'], $post_data['active_room']);
            $typing_user_count = count($typing_users);
            if($typing_user_count > 0){
                if (SETTINGS['display_name_format']=='username') {
                    $typing_msg = $typing_users[0]['user_name'];
                }else{
                    $typing_msg = $typing_users[0]['first_name'];
                }
                if($typing_user_count == 1){
                    $typing_msg .= " is ";
                }elseif($typing_user_count == 2){
                    if (SETTINGS['display_name_format']=='username') {
                        $typing_msg .= " & ".$typing_users[1]['user_name']. " are ";
                    }else{
                        $typing_msg .= " & ".$typing_users[1]['first_name']. " are ";
                    }

                }elseif ($typing_user_count > 2) {
                    $typing_msg .= " & ".($typing_user_count-1). " others are";
                }
                $typing_msg .= " typing...";
                $data['typing_user'] = $typing_msg;
            }else{
                $data['typing_user'] = 0;
            }

            // get new messages
            app('db')->where ('chat_group', $post_data['active_group']);
            app('db')->where ('user', app('auth')->user()['id']);
            $group_user_data = app('db')->getOne('group_users');

            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.id', $post_data['last_chat_id'], ">");
            app('db')->where ('c.group_id', $post_data['active_group']);
            if (app('auth')->isAuthenticated() == true){
                if (isset(SETTINGS['chat_load_type']) && SETTINGS['chat_load_type'] == 2){
                    if(isset($group_user_data) && $group_user_data['load_chats_from']){
                        $chat_from = $group_user_data['load_chats_from'];
                    }else if(isset($group_user_data) && $group_user_data['created_at']){
                        $chat_from = $group_user_data['created_at'];
                    }else{
                        $chat_from = date("Y-m-d H:i:s");
                    }
                    app('db')->where ('c.time >= "' . $chat_from .'"');
                }else if(isset(SETTINGS['chat_load_type']) && SETTINGS['chat_load_type'] == 3){
                    if(isset($group_user_data) && $group_user_data['load_chats_from']){
                        $chat_from = $group_user_data['load_chats_from'];
                    }else if(app('auth')->user()['last_login']){
                        $chat_from = app('auth')->user()['last_login'];
                    }else{
                        $chat_from = date("Y-m-d H:i:s");
                    }
                    app('db')->where ('c.time >= "' . $chat_from .'"');
                }else{
                    if(isset($group_user_data) && $group_user_data['load_chats_from']){
                        $chat_from = $group_user_data['load_chats_from'];
                        app('db')->where ('c.time >= "' . $chat_from .'"');
                    }
                }
                app('db')->where ("c.sender_id != " . app('auth')->user()['id']);
            }

            $chats = app('db')->get('group_chats c', null, 'c.*, u.user_name, u.first_name, u.last_name, u.avatar, u.user_type, \'group\' as chat_type');

            $update_meta = array();
            $update_meta['chat_meta_id'] = $post_data['chat_meta_id'];
            $update_meta['is_typing'] = $post_data['is_typing'];
            app('chat')->updateGroupChatMetaData($update_meta);
            
            if (app('auth')->isAuthenticated() == true){
                $group_chat_meta_data = app('chat')->getGroupChatMetaData(app('auth')->user()['id'], $post_data['active_group']);
                if(isset($group_chat_meta_data['is_muted'])){
                    $data['is_muted'] = $group_chat_meta_data['is_muted'];
                }
            }
           
        }

        if (app('auth')->isAuthenticated() == true){
            // update chat read status
            app('chat')->updateChatReadStatus(
                app('auth')->user()['id'],
                $post_data['active_user'],
                $post_data['active_group'],
                $post_data['active_room'],
                $post_data['last_chat_id']
            );
            
            $data['call'] = app('chat')->checkMyCall();
        }

        $data['chats'] = $chats;
        $data['unnotified_chats'] = app('chat')->getUnnotifiedChats();

        return json_response($data);
    }

    // get user selected chat details panel (right side panel)
    public function get_active_info(){
        $post_data = app('request')->body;
        $data = array();
        if($post_data['active_user']){
            // If selected chat is a user
            $private_min_pc_Q = '(
                SELECT MIN(cms.id)
                FROM cn_private_chat_meta cms
                WHERE cms.to_user = u.id AND cms.from_user = '.app('auth')->user()['id'].'
            )';

            $private_min_pcr_Q = '(
                SELECT MIN(cms.id)
                FROM cn_private_chat_meta cms
                WHERE cms.from_user = u.id AND cms.to_user = '.app('auth')->user()['id'].'
            )';

            app('db')->join("private_chat_meta pc", "pc.to_user=u.id AND pc.id = $private_min_pc_Q AND pc.from_user=".app('auth')->user()['id'], "LEFT");
            app('db')->join("private_chat_meta pcr", "pcr.from_user=u.id AND pcr.id = $private_min_pcr_Q AND pcr.to_user=".app('auth')->user()['id'], "LEFT");
            app('db')->where('u.id', $post_data['active_user']);
            $cols = Array("u.id, u.first_name, u.last_name, u.user_name, u.sex, u.user_type, u.country, u.avatar, u.dob, u.about, u.available_status, 
                pc.is_favourite, pc.is_muted, pc.is_blocked as blocked_by_you, pcr.is_blocked as blocked_by_him, u.badges");
            $user_data = app('db')->getOne('users u', $cols);
            $user_data['avatar_url'] = getUserAvatarURL($user_data);
            $data['info_type'] = "user";
            $data['info'] = $user_data;

        }elseif ($post_data['active_group']) {
            // If selected chat is a group
            if (app('auth')->isAuthenticated() == true){
                app('db')->join("group_users gu", "gu.chat_group=cg.id", "LEFT");
                app('db')->where("gu.user", app('auth')->user()['id']);
                app('db')->where ('cg.id', $post_data['active_group']);
                $group_data = app('db')->getOne("chat_groups cg", null, "cg.*, gu.unread_count, gu.is_muted");
                if(!$group_data){
                    app('db')->where ('cg.id', $post_data['active_group']);
                    $group_data = app('db')->getOne("chat_groups cg", null, "cg.*");
                }
            }else{
                app('db')->where ('cg.id', $post_data['active_group']);
                $group_data = app('db')->getOne("chat_groups cg", null, "cg.*");
            }

            app('db')->where ('id', $group_data['chat_room']);
            $room_data = app('db')->getOne('chat_rooms');
            if ($room_data['cover_image']) {
                $room_data['cover_url'] = MEDIA_URL."/chatrooms/".$room_data['cover_image'];
            }else {
                $room_data['cover_url'] = URL."static/img/group.png";
            }
            if ($group_data['cover_image']) {
                $group_data['cover_url'] = MEDIA_URL."/chatgroups/".$group_data['cover_image'];
            } else {
                $group_data['cover_url'] = $room_data['cover_url'];

            }
            $group_data['room_data'] = $room_data;
            $data['info_type'] = "group";
            $data['info'] = $group_data;

            app('db')->join("users u", "g.user=u.id", "LEFT");
            app('db')->where ('g.chat_group', $post_data['active_group']);
            app('db')->where ('u.user_type', Array(1, 4, 2), 'IN');
            app('db')->where ('u.available_status', 1);

            app('db')->orderBy('u.id', 'DESC', array($group_data['created_by']));
            app('db')->orderBy('u.user_type', 'ASC', array(1, 4, 2));
            app('db')->orderBy("u.last_seen","DESC");
            $group_users = app('db')->get('group_users g', array(0,20), 'g.*, u.id, u.first_name, u.last_name, u.user_name, u.sex, u.user_type, u.country, u.avatar');
            $data['group_users'] = $group_users;
        }
        $data['shared_photos'] = app('chat')->getSharedData(app('auth')->user()['id'], 2, 8, $post_data['active_user'], $post_data['active_group'], $post_data['active_room']);
        $data['shared_files'] = app('chat')->getSharedData(app('auth')->user()['id'], 6, 5, $post_data['active_user'], $post_data['active_group'], $post_data['active_room']);
        $data['shared_links'] = app('chat')->getSharedData(app('auth')->user()['id'], 5, 5, $post_data['active_user'], $post_data['active_group'], $post_data['active_room']);

        return json_response($data);
    }


    function get_recent(){
        $data = array();
        $post_data = app('request')->body;
        $limit = 50;
        if ($post_data['is_load_more']=='false') {
            $_SESSION['last_loaded_media_count'] = 0;
        }else{
            $_SESSION['last_loaded_media_count'] += $limit;
        }
        $post_data = app('request')->body;
        $data = array();
        $data['shared_media'] = app('chat')->getSharedData(app('auth')->user()['id'], $post_data['selected_media_type'], Array($_SESSION['last_loaded_media_count'],$limit), $post_data['active_user'], $post_data['active_group'], $post_data['active_room']);
        return json_response($data);
    }


    // get chats for selected user or group
    public function load_chats(){
        unset($_SESSION['last_loaded_up']);
        unset($_SESSION['last_loaded_down']);
        $data = array();
        $post_data = app('request')->body;
        $_SESSION['last_loaded_count'] = 0;
        $_SESSION['last_loaded_up'] = false;
        if ($post_data['chat_id'] == 'false') {
            $post_data['chat_id'] = false;
        }

        if ($post_data['active_user']) {

            if (!is_numeric($post_data['active_user'])) {
                app('db')->where('user_name',  app('purify')->xss_clean(clean($post_data['active_user'])));
                $auto_user = app('db')->getOne('users');
                if ($auto_user) {
                    $post_data['active_user'] = $auto_user['id'];
                }
            }
            if($post_data['active_user'] > app('auth')->user()['id']) {
                $user_1 = app('auth')->user()['id'];
                $user_2 = $post_data['active_user'];
            }else{
                $user_1 = $post_data['active_user'];
                $user_2 = app('auth')->user()['id'];
            }
            $chat_meta_data = app('chat')->getChatMetaData(app('auth')->user()['id'], $post_data['active_user'], $post_data['active_room']);
            $data['chat_meta_id'] = $chat_meta_data['id'];

            // get new messages
            $chats = app('chat')->getPrivateChats($user_1, $user_2, $post_data['active_room'], $post_data['chat_id'], 'up', $chat_meta_data['load_chats_from']);

        }else{
            $group_chat_meta_data = app('chat')->getGroupChatMetaData(app('auth')->user()['id'], $post_data['active_group'], $post_data['active_room']);
            if($group_chat_meta_data){
                $data['chat_meta_id'] = $group_chat_meta_data['id'];
                $data['is_mod'] = $group_chat_meta_data['is_mod'];
            }else{
                $data['chat_meta_id'] = "";
                $data['is_mod'] = 0;
            }

            // get new messages
            $chats = app('chat')->getGroupChats($post_data['active_group'], $post_data['active_room'], $post_data['chat_id']);
        }
        // update chat read status
        if (app('auth')->isAuthenticated() == true){
            app('chat')->updateChatReadStatus(
                app('auth')->user()['id'],
                $post_data['active_user'],
                $post_data['active_group'],
                $post_data['active_room']
            );
        }

        $data['last_updated_chat_time'] = app('chat')->getLastUpdatedTime(app('auth')->user()['id'], $post_data['active_user'], $post_data['active_group'], $post_data['active_room']);
        $data['chats'] = $chats;
        $data['active_user'] = $post_data['active_user'];
        return json_response($data);
    }

    // insert newly updated profile data to database
    public function save_profile(){
        $post_data = app('request')->body;
        $image_status = true;
        $image_message = "";
        if(array_key_exists("user_id", $post_data)){
            $user_id = $post_data['user_id'];
            $user_data = app('auth')->user($post_data['user_id']);
            $user_avatar = $user_data['avatar'];
            $admin_update = true;
        }else{
            $user_id = app('auth')->user()['id'];
            $user_data = app('auth')->user();
            $user_avatar = app('auth')->user()['avatar'];
            $admin_update = false;
        }

        if(array_key_exists("avatar", $_FILES)){
            if($_FILES['avatar']['size'] > 0){
                $image = image($_FILES['avatar'], false, 'avatars', 150, 150);
                if($image[0]){
                    $old_image = BASE_PATH . 'media/avatars/'.$user_avatar;
                    if(file_exists($old_image)) {
                        unlink($old_image);
                    }
                }else{
                    $image_status = false;
                    $image_message = $image[1];
                }
            }
        }

        $data = Array ("first_name" => $post_data['first_name'],
                       "last_name" => $post_data['last_name'],
                       "email" => $post_data['email'],
                       "user_name" => $post_data['user_name'],
                       "about" => $post_data['about'],
                       "dob" => $post_data['dob'],
                       "sex" => $post_data['sex'],
                       "timezone" => $post_data['timezone'],
                       "country" => $post_data['country'],
                    );

        if(array_key_exists("available_status", $post_data)){
            $data['available_status'] = $post_data['available_status'];
        }

        if(array_key_exists("user_type", $post_data)){
            $data['user_type'] = $post_data['user_type'];
        }

        $status = true;
        $message = array();
        foreach ($data as $key => $value) {
            $validate_data = clean_and_validate($key, $value);
            $value = $validate_data[0];
            $data[$key] = $value;
            if(!$validate_data[1][0]){
                $status = false;
                array_push($message, $validate_data[1][1]);
            }
        }

        if ($admin_update) {
            if(!empty($post_data['password']) && !empty($post_data['password_again'])){
                if ($post_data['password'] == $post_data['password_again']) {
                    $data['password'] = password_hash(trim($post_data['password']), PASSWORD_DEFAULT);
                }else{
                    $status = false;
                    array_push($message, array('password_again' => ['New password missmatch']));
                } 
            }
        }else{
            if(!empty($post_data['password']) && !empty($post_data['current_password']) && !empty($post_data['password_again'])){
                if ($post_data['password'] == $post_data['password_again']) {
                    $passwprd_verify = password_verify($post_data['current_password'], $user_data['password']);
                    if ($passwprd_verify) {
                        $data['password'] = password_hash(trim($post_data['password']), PASSWORD_DEFAULT);
                    }else{
                        $status = false;
                        array_push($message, array('current_password' => ['Wrong current password']));
                    }
                }else{
                    $status = false;
                    array_push($message, array('password_again' => ['New password missmatch']));
                }
            }
        }

        if($status){
            app('db')->where('email', $data['email']);
            app('db')->where("id != " . $user_id);
            $user_email_exist = app('db')->getOne('users');

            app('db')->where('user_name', $data['user_name']);
            app('db')->where("id != " . $user_id);
            $user_name_exist = app('db')->getOne('users');

            if ($user_email_exist || $user_name_exist) {
                $status = false;
                if($user_email_exist){
                    array_push($message, array('email' => [__("Email already exists!")]));
                }
                if($user_name_exist){
                    array_push($message, array('user_name' => [__("Username already exists!")]));
                }
            } else {
                $data['id'] = $user_id;
                if($_FILES['avatar']['size'] > 0 && $image[0]){
                    $data['avatar'] = $image[1];
                }
                if($data['dob'] == "" or $data['dob'] == "1970-01-01"){
                    $data['dob'] = Null;
                }
                $save_profile = app('auth')->saveProfile($data, $admin_update);
                if($save_profile[0]){
                    if (isset(SETTINGS['push_notifications']) && SETTINGS['push_notifications']==true) {
                        app('auth')->updatePushDevices($post_data, $user_id);
                    }
                }
                $status = $save_profile[0];
                $message = $save_profile[1];
            }
        }

        if($image_status){
            $profile_return = array($status, $message);
        }else{
            $profile_return = array($image_status, array(array('avatar' => [$image_message])));
        }

        return json_response(["success" => $profile_return[0], "message" => $profile_return[1]]);

    }

    // insert newly added profile data to database
    public function add_profile(){
        $post_data = app('request')->body;
        $image_status = true;
        $image_message = "";
        if(array_key_exists("avatar", $_FILES)){
            if($_FILES['avatar']['size'] > 0){
                $image = image($_FILES['avatar'], false, 'avatars', 150, 150);
                if($image[0]){
                    $old_image = BASE_PATH . 'media/avatars/'.app('auth')->user()['avatar'];
                    if(file_exists($old_image)) {
                        unlink($old_image);
                    }
                }else{
                    $image_status = false;
                    $image_message = $image[1];
                }
            }
        }

        $data = Array ("first_name" => $post_data['first_name'],
                       "last_name" => $post_data['last_name'],
                       "user_name" => $post_data['user_name'],
                       "email" => $post_data['email'],
                       "about" => $post_data['about'],
                       "dob" => $post_data['dob'],
                       "sex" => $post_data['sex'],
                       "timezone" => $post_data['timezone'],
                       "country" => $post_data['country'],
                       "user_type" => $post_data['user_type'],
                       "available_status" => $post_data['available_status'],
                    );

        $status = true;
        $message = array();
        foreach ($data as $key => $value) {
            $validate_data = clean_and_validate($key, $value);
            $value = $validate_data[0];
            $data[$key] = $value;
            if(!$validate_data[1][0]){
                $status = false;
                array_push($message, $validate_data[1][1]);
            }
        }

        if($status){
            app('db')->where('email', $data['email']);
            $user_email_exist = app('db')->getOne('users');

            app('db')->where('user_name', $data['user_name']);
            $user_name_exist = app('db')->getOne('users');

            if ($user_email_exist) {
                $status = false;
                array_push($message, array('email' => ['Email already exists!']));
            }elseif ($user_name_exist) {
                $status = false;
                array_push($message, array('user_name' => ['Username already exists!']));
            } else {
                if($_FILES['avatar']['size'] > 0 && $image[0]){
                    $data['avatar'] = $image[1];
                }
                if($data['dob'] == "" or $data['dob'] == "0000-00-00"){
                    $data['dob'] = Null;
                }

                $data['password'] = password_hash(trim($post_data['password']), PASSWORD_DEFAULT);
                $data['user_status'] = 1;
                $data['created_at'] = app('db')->now();
                $add_profile = app('auth')->addProfile($data);
                $status = $add_profile[0];
                $message = $add_profile[1];
            }
        }

        if($image_status){
            $profile_return = array($status, $message);
        }else{
            $profile_return = array($image_status, array(array('avatar' => [$image_message])));
        }

        return json_response(["success" => $profile_return[0], "message" => $profile_return[1]]);

    }

    // get active user list
    public function online_list(){

        $post_data = app('request')->body;
        $data = array();
        if (app('auth')->isAuthenticated() == true){
            $allow_guest_view = false;
        }else{
            $allow_guest_view = true;
        }
        if ($allow_guest_view == false) {
            if(in_array($post_data['user_list_section'], ['room', 'fav', 'forward'])){
                $_SESSION['last_loaded_users_count'] = 0;
                $data = app('chat')->get_active_list($post_data['active_room']);
            }else if($post_data['user_list_section'] == "dm"){
                $_SESSION['last_loaded_dm_users_count'] = 0;
                $data = app('chat')->get_dm_users();
            }
        }else{
            $_SESSION['last_loaded_users_count'] = 0;
            $data = app('chat')->get_active_list_guest_view($post_data['active_room']);
        }
        $data['unread_dm_total'] = app('chat')->get_unread_dm_total();
        return json_response($data);
    }

    // get active user list
    public function load_more_online_list(){

        $post_data = app('request')->body;
        $data = array();
        $q = app('purify')->xss_clean($post_data['q']);

        if (app('auth')->isAuthenticated() == true) {
            if(in_array($post_data['user_list_section'], ['room', 'fav'])){
                $_SESSION['last_loaded_users_count'] += 20;
                $data = app('chat')->get_active_list($post_data['active_room'], false, $q);
            }else if($post_data['user_list_section'] == "dm"){
                $_SESSION['last_loaded_dm_users_count'] += 20;
                $data = app('chat')->get_dm_users(false, $q);
            }
        }

        return json_response($data);
    }

    // get read status, seen status and chat times
    public function updated_chats(){

        $post_data = app('request')->body;
        $data = array();
        if($post_data['active_user']) {
            if($post_data['active_user'] > app('auth')->user()['id']) {
                $user_1 = app('auth')->user()['id'];
                $user_2 = $post_data['active_user'];
            }else{
                $user_1 = $post_data['active_user'];
                $user_2 = app('auth')->user()['id'];
            }

            // get newly updated chats
            app('db')->where ('updated_at', $post_data['last_updated_chat_time'], ">");
            app('db')->where ('user_1', $user_1);
            app('db')->where ('user_2', $user_2);
            app('db')->orderBy("updated_at","desc");
            $updated_chats = app('db')->get('private_chats');
        }else{
            // get newly updated chats
            app('db')->where ('updated_at', $post_data['last_updated_chat_time'], ">");
            app('db')->where ('group_id', $post_data['active_group']);
            app('db')->orderBy("updated_at","asc");
            $updated_chats = app('db')->get('group_chats');

        }

        $data['updated_chats'] = $updated_chats;

        return json_response($data);
    }

    // upload images to server
    public function send_images(){
        $uploaded_iamges = array();
        foreach ($_FILES['file']['tmp_name'] as $k => $v) {
            $file_array = array();
            $file_array['name'] = $_FILES['file']['name'][$k];
            $file_array['type'] = $_FILES['file']['type'][$k];
            $file_array['tmp_name'] = $_FILES['file']['tmp_name'][$k];
            $file_array['size'] = $_FILES['file']['size'][$k];

            $uploaded_image = chat_image_upload($file_array);
            array_push($uploaded_iamges, $uploaded_image);
        }

        echo json_encode($uploaded_iamges);
    }

    // upload files to server V2
    public function send_files(){
        $post_data = app('request')->body;
        include(BASE_PATH.'utils'.DS.'mime_types.php');
        if($post_data['upload_type'] == 'media') {
            $uploaded_images = array();
            $uploaded_videos = array();
            $uploaded_files = array();
            
            foreach ($_FILES['files']['tmp_name'] as $k => $v) {
                if ($_FILES['files']['error'][$k] == 0) {
                    $file_type = $_FILES['files']['type'][$k];
                    if(in_array($file_type, array('image/jpeg', 'image/gif', 'image/png', 'image/jpg'))){
                        $extension = pathinfo($_FILES['files']['name'][$k], PATHINFO_EXTENSION);
                        $file_name = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyz'),1,32);
                        $full_file_name = $file_name.'.'.time().'.'.$extension;
        
                        $file_array = array();
                        $file_array['name'] = $full_file_name;
                        $file_array['type'] = $_FILES['files']['type'][$k];
                        $file_array['tmp_name'] = $_FILES['files']['tmp_name'][$k];
                        $file_array['size'] = $_FILES['files']['size'][$k];
        
                        $uploaded_image = chat_image_upload($file_array);
                        array_push($uploaded_images, $uploaded_image);
                        
                    }else{
                        try {
                            $return_array = array();
                            $extension = pathinfo($_FILES['files']['name'][$k], PATHINFO_EXTENSION);
                            $file_name = pathinfo($_FILES['files']['name'][$k], PATHINFO_FILENAME);
                            $tmp_name = $_FILES['files']['tmp_name'][$k];
                            $size = $_FILES['files']['size'][$k];
                            $file_name = $file_name.'.'.time();

                            if (isset($_POST['video_duration'])) {
                                $video_duration = $_POST['video_duration'];
                            }else{
                                $video_duration = null;
                            }

                            $thumb_file_name = $file_name.'.png';
                            if (isset($_POST['video_thumbnail'])) {
                                $video_thumbnail = $_POST['video_thumbnail'];
                                if($video_thumbnail){
                                    video_thumb_upload($thumb_file_name, $video_thumbnail);
                                }
                            }
                            
                            $full_file_name = $file_name.'.'.$extension;
                            if (isset(SETTINGS['cloud_storage']) && SETTINGS['cloud_storage'] == true) {
                                $result = app('s3')->putObject([
                                    'Bucket' => SETTINGS['cloud_storage_bucket'],
                                    'Key'    => 'chats/videos/'.$full_file_name,
                                    'SourceFile' => $tmp_name
                                ]);
                            }else{
                                move_uploaded_file($tmp_name, "media/chats/videos/".$full_file_name);
                            }
                            
                            $return_array['name'] = $full_file_name;
                            $return_array['extension'] = $extension;
                            $return_array['size'] = app('chat')->humanFileSize($size);
                            $return_array['thumbnail'] = $thumb_file_name;
                            $return_array['duration'] = $video_duration;
                            array_push($uploaded_videos, $return_array);
                        } catch (\Exception $th) {
                            //echo $th;
                            //pass
                        }
                        
                    }
                }else{
                    // file size error
                }

            }
            $upload_data = array(
                            'images' => $uploaded_images,
                            'videos' => $uploaded_videos,
                            'files' => $uploaded_files,
                        );
        }else if($post_data['upload_type'] == 'file'){
            $uploaded_file_and_image = array();

            foreach ($_FILES['files']['tmp_name'] as $k => $v) {
                if ($_FILES['files']['error'][$k] == 0) {
                    $file_path = $_FILES['files']['tmp_name'][$k];
                    $file_type_info = finfo_open(FILEINFO_MIME_TYPE);
                    $file_type = finfo_file($file_type_info, $file_path);
                    
                    $ext_list = array();
                    foreach ($mime_types as $key => $value) {
                        if(in_array($file_type, $value)){
                            array_push($ext_list, $key);
                        }
                    }
                    // var_dump($ext_list);
                    $enable_files = str_replace('.', '', array_map('trim', explode(",",SETTINGS['enable_file_list'])));
                    if(!empty(array_intersect($ext_list, $enable_files))){
                        
                        $extension = pathinfo($_FILES['files']['name'][$k], PATHINFO_EXTENSION);
                        $file_name = trim(substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyz'),1,32));
                        $original_file_name = pathinfo($_FILES['files']['name'][$k], PATHINFO_FILENAME);
                        $original_file_name = preg_replace( '/[\W]/', '', $original_file_name);
                        if (empty($original_file_name)) {
                            $original_file_name = 'file';
                        }
                        $tmp_name = $_FILES['files']['tmp_name'][$k];
                        $size = $_FILES['files']['size'][$k];
                        $full_file_name = $original_file_name.'.'.$file_name.'.'.$extension;

                        $return_array = array();
                        $return_array['name'] = $full_file_name;
                        $return_array['extenstion'] = $extension;
                        $return_array['size'] = app('chat')->humanFileSize($size);

                        if (isset(SETTINGS['cloud_storage']) && SETTINGS['cloud_storage'] == true) {
                            $result = app('s3')->putObject([
                                'Bucket' => SETTINGS['cloud_storage_bucket'],
                                'Key'    => 'chats/files/'.$full_file_name,
                                'SourceFile' => $tmp_name
                            ]);
                        }else{
                            move_uploaded_file($tmp_name, "media/chats/files/".$full_file_name);
                        }

                        
                    }

                    array_push($uploaded_file_and_image, $return_array);
                }else{
                    // file size error
                }
            }
            $upload_data = array(
                            'images' => [],
                            'videos' => [],
                            'files' => $uploaded_file_and_image
                        );
        }else{
            $all_image = True;
            $uploaded_files = array();
            $uploaded_images = array();
            $uploaded_videos = array();
            foreach ($_FILES['files']['tmp_name'] as $k => $v) {
                if ($_FILES['files']['error'][$k] == 0) {
                    $file_type = $_FILES['files']['type'][$k];
                    if(!in_array($file_type, array('image/jpeg', 'image/gif', 'image/png', 'image/jpg'))){
                        $all_image = False;
                    }
                }else{
                    // file size error
                }
            }

            foreach ($_FILES['files']['tmp_name'] as $k => $v) {
                if ($_FILES['files']['error'][$k] == 0) {
                    if($all_image){
                        $extension = pathinfo($_FILES['files']['name'][$k], PATHINFO_EXTENSION);
                        $file_name = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyz'),1,32);
                        $full_file_name = $file_name.'.'.time().'.'.$extension;

                        $file_array = array();
                        $file_array['name'] = $full_file_name;
                        $file_array['type'] = $_FILES['files']['type'][$k];
                        $file_array['tmp_name'] = $_FILES['files']['tmp_name'][$k];
                        $file_array['size'] = $_FILES['files']['size'][$k];

                        $uploaded_image = chat_image_upload($file_array);
                        array_push($uploaded_images, $uploaded_image);
                    }else{
                        $file_path = $_FILES['files']['tmp_name'][$k];
                        $file_type_info = finfo_open(FILEINFO_MIME_TYPE);
                        $file_type = finfo_file($file_type_info, $file_path);
                        
                        $ext_list = array();
                        foreach ($mime_types as $key => $value) {
                            if(in_array($file_type, $value)){
                                array_push($ext_list, $key);
                            }
                        }
                        // var_dump($ext_list);
                        $enable_files = str_replace('.', '', array_map('trim', explode(",",SETTINGS['enable_file_list'])));
                        if(!empty(array_intersect($ext_list, $enable_files))){
                            
                            $extension = pathinfo($_FILES['files']['name'][$k], PATHINFO_EXTENSION);
                            $file_name = trim(substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyz'),1,32));
                            $original_file_name = pathinfo($_FILES['files']['name'][$k], PATHINFO_FILENAME);
                            $original_file_name = preg_replace( '/[\W]/', '', $original_file_name);
                            if (empty($original_file_name)) {
                                $original_file_name = 'file';
                            }
                            $tmp_name = $_FILES['files']['tmp_name'][$k];
                            $size = $_FILES['files']['size'][$k];
                            $full_file_name = $original_file_name.'.'.$file_name.'.'.$extension;

                            $return_array = array();
                            $return_array['name'] = $full_file_name;
                            $return_array['extenstion'] = $extension;
                            $return_array['size'] = app('chat')->humanFileSize($size);

                            if (isset(SETTINGS['cloud_storage']) && SETTINGS['cloud_storage'] == true) {
                                $result = app('s3')->putObject([
                                    'Bucket' => SETTINGS['cloud_storage_bucket'],
                                    'Key'    => 'chats/files/'.$full_file_name,
                                    'SourceFile' => $tmp_name
                                ]);
                            }else{
                                move_uploaded_file($tmp_name, "media/chats/files/".$full_file_name);
                            }

                            array_push($uploaded_files, $return_array);
                        }
                    }
                }else{
                    // file size error
                }
            }
            $upload_data = array(
                'images' => $uploaded_images,
                'videos' => $uploaded_videos,
                'files' => $uploaded_files
            );
        }

        return json_response($upload_data);
    }

    // upload files to server
    public function send_files_old(){
        $all_image = True;
        $uploaded_file_and_image = array();
        $uploaded_as = 'image';
        include(BASE_PATH.'utils'.DS.'mime_types.php');

        foreach ($_FILES['files']['tmp_name'] as $k => $v) {
            // $file_type = $_FILES['files']['type'][$k];

            $filepath = $_FILES['files']['tmp_name'][$k];
            $fileinfo = finfo_open(FILEINFO_MIME_TYPE);
            $file_type = finfo_file($fileinfo, $filepath);

            if(!in_array($file_type, array('image/jpeg', 'image/gif', 'image/png', 'image/jpg'))){
                $all_image = False;
                $uploaded_as = 'file';
            }
        }

        foreach ($_FILES['files']['tmp_name'] as $k => $v) {
            if($all_image){
                $extension = pathinfo($_FILES['files']['name'][$k], PATHINFO_EXTENSION);
                $file_name = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyz'),1,32);
                $full_file_name = $file_name.'.'.time().'.'.$extension;

                $file_array = array();
                $file_array['name'] = $full_file_name;
                $file_array['type'] = $_FILES['files']['type'][$k];
                $file_array['tmp_name'] = $_FILES['files']['tmp_name'][$k];
                $file_array['size'] = $_FILES['files']['size'][$k];

                $uploaded_image = chat_image_upload($file_array);
                array_push($uploaded_file_and_image, $uploaded_image);
            }else{
                $file_path = $_FILES['files']['tmp_name'][$k];
                $file_type_info = finfo_open(FILEINFO_MIME_TYPE);
                $file_type = finfo_file($file_type_info, $file_path);
                
                $ext_list = array();
                foreach ($mime_types as $key => $value) {
                    if(in_array($file_type, $value)){
                        array_push($ext_list, $key);
                    }
                }
                // var_dump($ext_list);
                $enable_files = str_replace('.', '', array_map('trim', explode(",",SETTINGS['enable_file_list'])));
                if(!empty(array_intersect($ext_list, $enable_files))){
                    
                    $extension = pathinfo($_FILES['files']['name'][$k], PATHINFO_EXTENSION);
                    $file_name = trim(substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyz'),1,32));
                    $original_file_name = pathinfo($_FILES['files']['name'][$k], PATHINFO_FILENAME);
                    $original_file_name = preg_replace( '/[\W]/', '', $original_file_name);
                    if (empty($original_file_name)) {
                        $original_file_name = 'file';
                    }
                    $tmp_name = $_FILES['files']['tmp_name'][$k];
                    $size = $_FILES['files']['size'][$k];
                    $full_file_name = $original_file_name.'.'.$file_name.'.'.$extension;

                    $return_array = array();
                    $return_array['name'] = $full_file_name;
                    $return_array['extenstion'] = $extension;
                    $return_array['size'] = app('chat')->humanFileSize($size);

                    if (isset(SETTINGS['cloud_storage']) && SETTINGS['cloud_storage'] == true) {
                        $result = app('s3')->putObject([
                            'Bucket' => SETTINGS['cloud_storage_bucket'],
                            'Key'    => 'chats/files/'.$full_file_name,
                            'SourceFile' => $tmp_name
                        ]);
                    }else{
                        move_uploaded_file($tmp_name, "media/chats/files/".$full_file_name);
                    }

                    array_push($uploaded_file_and_image, $return_array);
                }
            }
        }

        echo json_encode(array('upload_as' => $uploaded_as, 'upload_data' => $uploaded_file_and_image));
    }
    

    // construct stickers packages to show
    public function get_stickers(){
        $data = array();
        $directory = BASE_PATH . 'media' . DIRECTORY_SEPARATOR . 'stickers' . DIRECTORY_SEPARATOR;
        $escapedFiles = ['.','..',];
        $allowedFiles = ['jpg','jpeg','png','gif','webp'];
        $stickerDirs = [];
        $stickerDirList = scandir($directory);
        foreach ($stickerDirList as $stickerDir) {
            $stickerList = [];
            if (in_array($stickerDir, $escapedFiles)){
                continue;
            }
            if(is_dir($directory . $stickerDir)){
                $stickerListArray = scandir($directory . $stickerDir);
                foreach ($stickerListArray as $sticker) {
                    if (in_array($sticker, $escapedFiles)){
                        continue;
                    }
                    $file_ext = substr($sticker, strrpos($sticker, '.') + 1);
                    if (!in_array($file_ext, $allowedFiles)){
                        continue;
                    }

                    $stickerList[] =  $stickerDir . '/' . $sticker;
                }
                if($stickerList){
                    $stickerDirs[$stickerDir] = $stickerList;
                }
            }
        }
        arsort($stickerDirs);
        $data['stickers'] = $stickerDirs;
        echo json_encode($data);
    }


    // process active user restriction
    public function active_user_restriction(){
        $post_data = app('request')->body;
        if($post_data['current_status'] == 1){
            $new_status = 0;
        }else{
            $new_status = 1;
        }
        $update_meta = array();
        $update_meta['chat_meta_id'] = $post_data['chat_meta_id'];
        $update_meta[$post_data['restriction_type']] = $new_status;
        app('chat')->updateChatMetaData($update_meta);
        return json_response(["success" => 'true', "type" => $post_data['restriction_type'], "status" => $new_status]);
    }

    // process active group restriction
    public function active_group_restriction(){
        $post_data = app('request')->body;
        if($post_data['current_status'] == 1){
            $new_status = 0;
        }else{
            $new_status = 1;
        }
        $update_meta = array();
        $update_meta['chat_meta_id'] = $post_data['chat_meta_id'];
        $update_meta[$post_data['restriction_type']] = $new_status;
        app('chat')->updateGroupChatMetaData($update_meta);
        return json_response(["success" => 'true', "type" => $post_data['restriction_type'], "status" => $new_status]);
    }

    // change user status to online offline, busy and away
    public function change_user_status(){
        $post_data = app('request')->body;
        if($post_data['new_status']){
            $update_data = array('user_status' => $post_data['new_status'] );
            app('db')->where ('id', app('auth')->user()['id']);
            app('db')->update('users', $update_data);
            $_SESSION['user'] = app('auth')->user(app('auth')->user()['id']);
        }
    }

    // update admin settings
    public function update_settings(){
        $post_data = app('request')->body;
        $image_status = true;
        if($post_data['update_type'] == "image-settings"){
            $update_data = array();
            $image_message = array();
            foreach ($_FILES as $key => $each_file) {
                $current_image = "";
                $new_image = "";
                if(array_key_exists($key, SETTINGS)){ // check current image
                    $current_image = SETTINGS[$key]; // get current image
                }

                if($_FILES[$key]['size'] > 0){
                    $width = false;
                    $height = false;
                    if(array_key_exists($key, IMAGE_SIZE)){
                        if(array_key_exists('width', IMAGE_SIZE[$key])){
                            $width = IMAGE_SIZE[$key]['width'];
                        }
                        if(array_key_exists('height', IMAGE_SIZE[$key])){
                            $height = IMAGE_SIZE[$key]['height'];
                        }
                    }
                    $new_image = image($_FILES[$key], false, 'settings', $height, $width); // upload new image
                    if($new_image[0]){
                        $update_data[$key] = $new_image[1]; // assign to update_data array

                        if($current_image){ // delete current image
                            $current_image_path = BASE_PATH . 'media/settings/'.$current_image;
                            if(file_exists($current_image_path)) {
                                unlink($current_image_path);
                            }
                        }
                    }else{
                        $image_status = false;
                        array_push($image_message, array($key=>array($new_image[1])));
                    }
                }
            }

        }else if($post_data['update_type'] == "pwa-settings"){
            $update_data = $post_data;
            if(array_key_exists("pwa_icon", $_FILES)){
                if($_FILES['pwa_icon']['name']){
                    $image = image($_FILES['pwa_icon'], false, 'settings', 192, 192);
                    if($image[0]){
                        $current_image = "";
                        if(array_key_exists('pwa_icon', SETTINGS)){ // check current image
                            $current_image = SETTINGS['pwa_icon']; // get current image
                        }
                        $update_data['pwa_icon'] = $image[1]; // assign to update_data array
                        if($current_image){
                            $old_image = BASE_PATH . 'media/settings/'.$current_image;
                            if(file_exists($old_image)) {
                                unlink($old_image);
                            }
                        }

                    }else{
                        $image_status = false;
                        $image_message = $image[1];
                    }
                }
            }
        }else if($post_data['update_type'] == "reaction-settings"){
            $update_data = $post_data;
            $image_message = array();
            foreach ($_FILES as $key => $each_file) {
                $current_gif = $key.'.gif';
                $current_static_png = 'static_'.$key.'.gif';
                $new_image = "";

                if($_FILES[$key]['size'] > 0){
                    if($current_gif){ // delete current image
                        $current_gif_path = BASE_PATH . 'media/reactions/'.$current_gif;
                        if(file_exists($current_gif_path)) {
                            unlink($current_gif_path);
                        }
                    }

                    if($current_static_png){ // delete current image
                        $current_static_path = BASE_PATH . 'media/reactions/'.$current_static_png;
                        if(file_exists($current_static_path)) {
                            unlink($current_static_path);
                        }
                    }

                    $width = false;
                    $height = false;
                    $new_image = reaction_icon($_FILES[$key], $key, 'reactions', $height, $width); // upload new image
                }
            }
        }else {
            $update_data = $post_data;
        }

        unset($update_data['update_type']);
        $update_settings = app('admin')->updateSettings($update_data);
        if ($image_status == false) {
            return json_response(["success" => $image_status, "message" => $image_message]);
        }else{
            return json_response(["success" => $update_settings[0], "message" => $update_settings[1]]);
        }
    }

    // save chatroom details
    public function update_chatroom(){
        $post_data = app('request')->body;
        $update_chatroom = app('admin')->updateChatroom($post_data, $_FILES);

        return $update_chatroom;

    }

    // get chatroom details to admin
    public function get_chatroom(){
        $post_data = app('request')->body;
        $data = array();
        if (array_key_exists("edit_room", $post_data)) {
            if($post_data['edit_room']){
                $privilege_room_user = app('admin')->checkUserRoomPrivilege(app('auth')->user()['id'], $post_data['edit_room']);
                if($privilege_room_user){
                    app('db')->where('id', $post_data['edit_room']);
                    $room_data = app('db')->getOne('chat_rooms');
                    $data['created_by'] = $room_data['created_by'];
                    $data['room_id'] = $room_data['id'];
                    if(app('auth')->user()['user_type'] == 1 or app('auth')->user()['user_type'] == 4 or $room_data['created_by'] == app('auth')->user()['id']){
                        $data['chat_room'] = $room_data;
                        $data['room_mod'] = false;
                    }else{
                        $data['room_mod'] = true;
                    }

                    app('db')->where ('slug', 'general');
                    app('db')->where ('chat_room', $post_data['edit_room']);
                    $chat_group = app('db')->getOne('chat_groups');

                    app('db')->join("users u", "g.user=u.id", "LEFT");
                    app('db')->where ('g.chat_group', $chat_group['id']);
                    $group_users = app('db')->get('group_users g', null, 'g.*, u.*');
                    $data['room_users'] = $group_users;
                    echo app('twig')->render('chat_room_update.html', $data);
                }else{
                    return json_response(["success" => 'false', "message" => __('Access revoked')], '400');
                }
            }
        }else{
            echo app('twig')->render('chat_room_add.html', $data);
        }

        

            
        
    }

    // get chatroom data
    public function get_chatroom_basic(){
        $post_data = app('request')->body;
        app('db')->where('id', $post_data['room_id']);
        $room_data = app('db')->getOne('chat_rooms', 'name, slug');
        return json_response(["success" => 'false', "data" => $room_data]);
    }

    // user ban for chat rooms
    public function chatroom_user_restriction(){
        $post_data = app('request')->body;
        $privilege_room_user = app('admin')->checkUserRoomPrivilege(app('auth')->user()['id'], $post_data['room_id']);
        if($privilege_room_user){
            app('db')->where ('chat_room', $post_data['room_id']);
            $chat_groups = app('db')->get('chat_groups');

            foreach ($chat_groups as $chat_group) {
                app('db')->where ('user', $post_data['selected_user']);
                app('db')->where ('chat_group', $chat_group['id']);
                app('db')->update('group_users', array('status' => $post_data['restriction_type']));
            }

            if($post_data['restriction_type'] == "1"){
                return json_response(["success" => 'true', "message" => __("User unkicked from this room")]);
            }elseif($post_data['restriction_type'] == "3"){
                return json_response(["success" => 'true', "message" => __("User kicked from this room")]);
            }
        }else{
            return json_response(["success" => 'false', "message" => __('Access revoked')]);
        }

    }

    // make user mod on chat rooms
    public function chatroom_user_mod(){
        $post_data = app('request')->body;
        $privilege_room_user = app('admin')->checkUserRoomPrivilege(app('auth')->user()['id'], $post_data['room_id']);
        if($privilege_room_user){
            app('db')->where ('chat_room', $post_data['room_id']);
            $chat_groups = app('db')->get('chat_groups');

            foreach ($chat_groups as $chat_group) {
                app('db')->where ('user', $post_data['selected_user']);
                app('db')->where ('chat_group', $chat_group['id']);
                app('db')->update('group_users', array('is_mod' => $post_data['mod_type']));
            }

            if($post_data['mod_type'] == "1"){
                return json_response(["success" => 'true', "message" => __("User is now a room moderator")]);
            }elseif($post_data['mod_type'] == "0"){
                return json_response(["success" => 'true', "message" => __("User moderator previladge is removed")]);
            }
        }else{
            return json_response(["success" => 'false', "message" => __('Access revoked')]);
        }

    }

    // remove room bg
    public function chatroom_remove_bg(){
        $post_data = app('request')->body;
        $privilege_room_user = app('admin')->checkUserRoomPrivilege(app('auth')->user()['id'], $post_data['room_id']);
        if($privilege_room_user){
            app('db')->where ('id', $post_data['room_id']);
            app('db')->update('chat_rooms', array('background_image' => null));
            return json_response(["success" => 'true', "message" => __("Background image updated to default.")]);
        }else{
            return json_response(["success" => 'false', "message" => __('Access revoked')]);
        }
    }

    // load more chats when scrolling up
    public function load_more_chats(){
        $data = array();
        $post_data = app('request')->body;
        $_SESSION['last_loaded_count'] += 20;
        if ($post_data['active_user']) {
            if($post_data['active_user'] > app('auth')->user()['id']) {
                $user_1 = app('auth')->user()['id'];
                $user_2 = $post_data['active_user'];
            }else{
                $user_1 = $post_data['active_user'];
                $user_2 = app('auth')->user()['id'];
            }
            $chat_meta_data = app('chat')->getChatMetaData(app('auth')->user()['id'], $post_data['active_user'], $post_data['active_room']);
            $data['chats'] = app('chat')->getPrivateChats($user_1, $user_2, $post_data['active_room'], false, $post_data['direction'], $chat_meta_data['load_chats_from']);
        }else{
            $data['chats'] = app('chat')->getGroupChats($post_data['active_group'], $post_data['active_room'], false, $post_data['direction']);
        }
        $data['chats'] = array_reverse($data['chats']);
        return json_response($data);
    }

    public function chatroom_search(){
        $post_data = app('request')->body;
        $q = app('purify')->xss_clean(clean($post_data['q']));
        $order_by = app('purify')->xss_clean(clean($post_data['order_by']));
        $data = array();


        if(array_key_exists("homepage_chat_room_limit", SETTINGS)){
            if (SETTINGS['homepage_chat_room_limit']) {
                $default_limit = SETTINGS['homepage_chat_room_limit'];
            }else{
                $default_limit = 6;
            }
        }else{
            $default_limit = 6;
        }

        if($post_data['created_by'] != 0){
            app('db')->where ('cr.created_by', $post_data['created_by']);
        }
        if($q != ""){
            app('db')->where ("cr.name", '%'.$q.'%', 'like');
        }
        app('db')->join("chat_rooms cr", "cr.id=cg.chat_room", "LEFT");
        app('db')->join("group_users gu", "gu.chat_group=cg.id", "LEFT");
        app('db')->where ('cg.slug', 'general');
        app('db')->where ('cr.status', 1);
        app('db')->where ('cr.is_visible', 1);
        app('db')->groupBy ('gu.chat_group, cr.id');
        if (isset($order_by)) {
            if ($order_by == 'newest_first') {
                app('db')->orderBy ('cr.id', 'DESC');
            }else if($order_by == 'oldest_first'){
                app('db')->orderBy ('cr.id', 'ASC');
            }else if($order_by == 'most_users_first'){
                app('db')->orderBy ('users_count', 'DESC');
            }else if($order_by == 'least_users_first'){
                app('db')->orderBy ('users_count', 'ASC');
            }
        }else{
            app('db')->orderBy ('users_count', 'DESC');
        }

        $chat_rooms = app('db')->get('chat_groups cg', array(0,$default_limit), 'cr.id, cr.name, cr.description, cr.cover_image, cr.is_protected, cr.password, cr.is_visible, cr.slug, cr.allowed_users, cr.status, cr.created_by, COUNT(gu.id) as users_count');

        $data['chat_rooms'] = $chat_rooms;

        $chat_room_view = "small";
        if(array_key_exists("homepage_chat_room_view", SETTINGS)){
            if (SETTINGS['homepage_chat_room_view'] == 'large') {
                $chat_room_view = "large";
            }
        }

        if($chat_room_view == "small"){
            $html = app('twig')->render('chat_room_loop_small.html', $data);
        }else{
            $html = app('twig')->render('chat_room_loop_large.html', $data);
        }

        $retun_data = array();
        $retun_data['html'] = $html;
        return json_response($retun_data);
    }


    public function chatroom_load_more(){
        $post_data = app('request')->body;
        $chat_room_cont = app('purify')->xss_clean(clean($post_data['chat_room_cont']));
        $order_by = app('purify')->xss_clean(clean($post_data['order_by']));
        $q = app('purify')->xss_clean(clean($post_data['q']));
        $data = array();

        if(array_key_exists("homepage_chat_room_limit", SETTINGS)){
            if (SETTINGS['homepage_chat_room_limit']) {
                $default_limit = SETTINGS['homepage_chat_room_limit'];
            }else{
                $default_limit = 6;
            }
        }else{
            $default_limit = 6;
        }

        if($post_data['created_by'] != 0){
            app('db')->where ('cr.created_by', $post_data['created_by']);
        }
        if($q != ""){
            app('db')->where ("cr.name", '%'.$q.'%', 'like');
        }
        app('db')->join("chat_rooms cr", "cr.id=cg.chat_room", "LEFT");
        app('db')->join("group_users gu", "gu.chat_group=cg.id", "LEFT");
        app('db')->where ('cg.slug', 'general');
        app('db')->where ('cr.status', 1);
        app('db')->where ('cr.is_visible', 1);
        app('db')->groupBy ('gu.chat_group, cr.id');
        if (isset($order_by)) {
            if ($order_by == 'newest_first') {
                app('db')->orderBy ('cr.id', 'DESC');
            }else if($order_by == 'oldest_first'){
                app('db')->orderBy ('cr.id', 'ASC');
            }else if($order_by == 'most_users_first'){
                app('db')->orderBy ('users_count', 'DESC');
                app('db')->orderBy ('cr.id', 'ASC');
            }else if($order_by == 'least_users_first'){
                app('db')->orderBy ('users_count', 'ASC');
                app('db')->orderBy ('cr.id', 'ASC');
            }
        }else{
            app('db')->orderBy ('users_count', 'DESC');
            app('db')->orderBy ('cr.id', 'ASC');
        }
        
        $chat_rooms = app('db')->get('chat_groups cg', array($chat_room_cont,$default_limit), 'cr.id, cr.name, cr.description, cr.cover_image, cr.is_protected, cr.password, cr.is_visible, cr.slug, cr.allowed_users, cr.status, cr.created_by, COUNT(gu.id) as users_count');
        $data['chat_rooms'] = $chat_rooms;

        $chat_room_view = "small";
        if(array_key_exists("homepage_chat_room_view", SETTINGS)){
            if (SETTINGS['homepage_chat_room_view'] == 'large') {
                $chat_room_view = "large";
            }
        }

        if($chat_room_view == "small"){
            $html = app('twig')->render('chat_room_loop_small.html', $data);
        }else{
            $html = app('twig')->render('chat_room_loop_large.html', $data);
        }

        $retun_data = array();
        $retun_data['html'] = $html;
        return json_response($retun_data);
    }


    // user ban for chat rooms
    public function delete_message(){
        $post_data = app('request')->body;
        $delete_access = false;
        if($post_data['chat_type'] == "group"){
            app('db')->where('id', $post_data['message_id']);
            $chat = app('db')->getOne('group_chats');
            $privilege_user = app('admin')->checkUserRoomPrivilege(app('auth')->user()['id'], $chat['room_id']);
            if($privilege_user or $chat['sender_id'] == app('auth')->user()['id']){

                if (isset(SETTINGS['unlink_with_delete']) && SETTINGS['unlink_with_delete'] == true) {
                    app('db')->where('id', $post_data['message_id']);
                    app('db')->where('type', Array(2, 6, 7, 8), 'IN');
                    $chat = app('db')->getOne('group_chats');
                    if($chat){
                        app('chat')->unlink_files($chat['message'], $chat['type']);
                    }
                }
                app('db')->where ('id', $post_data['message_id']);
                app('db')->update('group_chats', array('status' => 3, "updated_at" => app('db')->now()));
                $delete_access = true;
            }
        }else{
            app('db')->where('id', $post_data['message_id']);
            $chat = app('db')->getOne('private_chats');
            $privilege_user = app('admin')->checkUserRoomPrivilege(app('auth')->user()['id'], $chat['room_id']);
            if($privilege_user or $chat['sender_id'] == app('auth')->user()['id']){

                if (isset(SETTINGS['unlink_with_delete']) && SETTINGS['unlink_with_delete'] == true) {
                    app('db')->where('id', $post_data['message_id']);
                    app('db')->where('type', Array(2, 6, 7, 8), 'IN');
                    $chat = app('db')->getOne('private_chats');
                    if($chat){
                        app('chat')->unlink_files($chat['message'], $chat['type']);
                    }
                }
                app('db')->where ('id', $post_data['message_id']);
                app('db')->update('private_chats', array('status' => 3, "updated_at" => app('db')->now()));
                $delete_access = true;
            }
        }

        if($delete_access){
            return json_response(["success" => 'true', "message" => __('massage deleted')]);
        }else{
            return json_response(["success" => false, "message" => __('You no longer have acccess to this feature')]);
        }

    }


    // language add or update
    public function language_update(){
        $post_data = app('request')->body;
        $return = app('admin')->language_update($post_data);
        return json_response(["success" => $return[0], "message" => $return[1]]);
    }

    // delete language
    public function language_delete(){
        $post_data = app('request')->body;
        app('db')->where ('code', $post_data['lang']);
        app('db')->delete('languages');
        return json_response(["success" => true, "message" => ""]);
    }

    // update language translation
    public function update_translation(){
        $post_data = $_POST;
        $return = app('admin')->update_translation($post_data);
        return json_response(["success" => $return[0], "message" => $return[1]]);
    }

    // delete selected guest users
    public function delete_users(){
        $post_data = $_POST;
        $return = app('admin')->delete_users($post_data);
        return json_response(["success" => $return[0], "message" => $return[1]]);
    }

    // Chat Search
    public function chat_search(){
        $data = array();
        $post_data = app('request')->body;
        $q = app('purify')->xss_clean($post_data['q']);
        if ($q) {
            if ($post_data['active_user']) {
                if($post_data['active_user'] > app('auth')->user()['id']) {
                    $user_1 = app('auth')->user()['id'];
                    $user_2 = $post_data['active_user'];
                }else{
                    $user_1 = $post_data['active_user'];
                    $user_2 = app('auth')->user()['id'];
                }
                $chat_meta_data = app('chat')->getChatMetaData(app('auth')->user()['id'], $post_data['active_user'], $post_data['active_room']);
                $data['chats'] = app('chat')->searchPrivateChats($user_1, $user_2, $post_data['active_room'], $q, $chat_meta_data['load_chats_from']);
            }else{
                $data['chats'] = app('chat')->searchGroupChats($post_data['active_group'], $post_data['active_room'], $q);
            }
            $data['chats'] = array_reverse($data['chats']);
            return json_response($data);
        }
    }
    // update push devices
    public function update_push_device(){
        $post_data = app('request')->body;
        app('db')->where ('token', $post_data['token']);
        $has_token = app('db')->getOne('push_devices');
        if(!$has_token){

            // unsubscribe old tokens
            app('db')->where ('user_id',  app('auth')->user()['id']);
            $currentTokens = app('db')->get('push_devices');
            if ($currentTokens) {
                foreach ($currentTokens as $currentToken) {
                    push_unsubscribe($currentToken['token']);
                }
            }

            app('db')->where ('user_id',  app('auth')->user()['id']);
            app('db')->delete('push_devices');

            $data = Array ("user_id" => app('auth')->user()['id'],
                           "token" => $post_data['token'],
                           "device" => '',
                           "created_at" => app('db')->now()
                        );
            $id = app('db')->insert ('push_devices', $data);
        }
    }

    // Search Room Users
    public function room_user_search(){
        $post_data = app('request')->body;
        $data = array();
        $q = app('purify')->xss_clean($post_data['q']);
        if($q){
            if (app('auth')->isAuthenticated() == true) {
                if(in_array($post_data['search_from'], ['room', 'fav', 'forward'])){
                    $data = app('chat')->get_active_list($post_data['active_room'], false, $q, $post_data['search_from']);
                }else if($post_data['search_from'] == "dm"){
                    $data = app('chat')->get_dm_users(false, $q);
                }

            }
            return json_response($data);
        }
    }


    // upload audio files to server
    public function send_audio(){
        $post_data = app('request')->body;
        $decodedData = base64_decode($post_data['data']);
        $file_name = uniqid(rand(), true) . '.mp3';
        $fp = fopen("media/chats/audio/".$file_name, 'wb');
        if ($fp) {
            fwrite($fp, $decodedData);
            $return_array = array();
            $return_array['name'] = $file_name;
            $return_array['extenstion'] = 'mp3';
            $stat = fstat($fp);
            $return_array['size'] = app('chat')->humanFileSize($stat['size']);
            $return_array['duration'] = gmdate("i:s", $post_data['recordingTime']);
            fclose($fp);

            if (isset(SETTINGS['cloud_storage']) && SETTINGS['cloud_storage'] == true) {
                $result = app('s3')->putObject([
                    'Bucket' => SETTINGS['cloud_storage_bucket'],
                    'Key'    => 'chats/audio/'.$file_name,
                    'SourceFile' => "media/chats/audio/".$file_name
                ]);
                unlink("media/chats/audio/".$file_name);
            }

            return json_response($return_array);
        }

    }

    public function get_message(){
        $post_data = app('request')->body;
        if($post_data['chat_type'] == 'group'){
            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.id', $post_data['chat_id']);
            $chat_data = app('db')->getOne('group_chats c', 'c.*, u.user_name, u.first_name, u.last_name');
        }else{
            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.id', $post_data['chat_id']);
            $chat_data = app('db')->getOne('private_chats c', 'c.*,  u.user_name, u.first_name, u.last_name');
        }
        return json_response($chat_data);

    }

    // delete chatroom
    public function delete_chatroom(){
        $post_data = app('request')->body;
        $privilege_room_user = app('admin')->checkUserRoomPrivilege(app('auth')->user()['id'], $post_data['room_id']);
        if($privilege_room_user){
            if (isset(SETTINGS['unlink_with_delete']) && SETTINGS['unlink_with_delete'] == true) {
                //unlink cover image
                app('db')->where ('id', $post_data['room_id']);
                $delete_room = app('db')->getOne('chat_rooms');
                if($delete_room['cover_image']){
                    if (file_exists('media/chatrooms/'.$delete_room['cover_image'])) {
                        unlink('media/chatrooms/'.$delete_room['cover_image']);
                    }
                }
            }

            // delete all chats
            $this->delete_chats($post_data['room_id']);

            app('db')->where ('id', $post_data['room_id']);
            app('db')->delete('chat_rooms');
            return json_response(["success" => true, "message" => ""]);
        }else{
            return json_response(["success" => false, "message" => __('Access revoked')]);
        }
    }

    // delete all chats
    public function delete_chats($delete_room_id=false){
        $post_data = app('request')->body;
        if($delete_room_id){
            $room_id = $delete_room_id;
        }else{
            $room_id = $post_data['room_id'];
        }

        $privilege_room_user = app('admin')->checkUserRoomPrivilege(app('auth')->user()['id'], $room_id);
        if($privilege_room_user){
            if (isset(SETTINGS['unlink_with_delete']) && SETTINGS['unlink_with_delete'] == true) {
                //unlink group chats files
                app('db')->where('room_id', $room_id);
                app('db')->where('type', Array(2, 6, 7, 8), 'IN');
                $group_chats = app('db')->get('group_chats');
                foreach ($group_chats as $chat) {
                    if($chat){
                        app('chat')->unlink_files($chat['message'], $chat['type']);
                    }
                }
            }
            app('db')->where ('room_id', $room_id);
            app('db')->delete('group_chats');
            if($delete_room_id==false){
                return json_response(["success" => true, "message" => ""]);
            }
        }else{
            return json_response(["success" => false, "message" => __('Access revoked')]);
        }
    }

    public function forward_message(){
        $post_data = app('request')->body;

        foreach ($post_data['forward_message'] as $forward_message) {
            if($post_data['active_user']) {
                app('db')->join("users u", "c.sender_id=u.id", "LEFT");
                app('db')->where ('c.id', $forward_message);
                $chat_data = app('db')->getOne('private_chats c', 'c.*,  u.user_name, u.first_name, u.last_name');
            }else{
                app('db')->join("users u", "c.sender_id=u.id", "LEFT");
                app('db')->where ('c.id', $forward_message);
                $chat_data = app('db')->getOne('group_chats c', 'c.*, u.user_name, u.first_name, u.last_name');
            }

            if($chat_data['type'] == 8){
                $old_message = json_decode($chat_data['message'], true);
                $message_content = json_encode(array('id' => $chat_data['id'], 'type' => $old_message['new_message']['new_type'], 'message' => $old_message['new_message']['new_content']));
            }else if($chat_data['type'] == 9){
                $old_message = json_decode($chat_data['message'], true);
                $message_content = json_encode(array('id' => $chat_data['id'], 'type' => $old_message['type'], 'message' => $old_message['message']));
            }else if($chat_data['type'] == 10){
                $old_message = json_decode($chat_data['message'], true);
                $message_content = json_encode(array('id' => $chat_data['id'], 'type' => $chat_data['type'], 'message' => $old_message));
            }else{
                $message_content = json_encode(array('id' => $chat_data['id'], 'type' => $chat_data['type'], 'message' => $chat_data['message']));
            }

            if (array_key_exists("selected_chat_groups", $post_data)){

                foreach ($post_data['selected_chat_groups'] as $forward_to_group) {

                    $chat_meta_data = app('chat')->getGroupChatMetaData(app('auth')->user()['id'], $forward_to_group);
                    $chat_save = app('chat')->saveNewMessage(
                        app('auth')->user()['id'],
                        $message_content,
                        "",
                        $forward_to_group,
                        $post_data['active_room'],
                        9,
                        $chat_meta_data['id']
                    );
                }
            }

            if (array_key_exists("selected_chat_users", $post_data)){
                foreach ($post_data['selected_chat_users'] as $forward_to) {
                    $chat_meta_data = app('chat')->getChatMetaData(app('auth')->user()['id'], $forward_to, $post_data['active_room']);
                    $chat_save = app('chat')->saveNewMessage(
                        app('auth')->user()['id'],
                        $message_content,
                        $forward_to,
                        "",
                        $post_data['active_room'],
                        9,
                        $chat_meta_data['id']
                    );

                    // sending push notification to users
                    send_notification($forward_to, $post_data['active_room'], $message_content, 9);

                }
            }
        }

        return json_response(array("success" => true, "message" => 'Message forwarded'));
    }

    public function room_list_unread(){
        $data['total_unread'] = app('chat')->getChatRoomsUnread();
        return json_response($data);
    }

    public function room_list(){
        $post_data = app('request')->body;
        $q = app('purify')->xss_clean(clean($post_data['q']));
        $data['chat_rooms'] = app('chat')->getChatRooms($q);
        return json_response($data);
    }

    public function social_login_update(){
        $post_data = app('request')->body;
        $update_data = array();
        $update_data['enable_social_login'] = $post_data['enable_social_login'];
        $return_data = app('admin')->updateSettings($update_data);
        if($update_data['enable_social_login']){
            $return_data = app('admin')->update_auth_provider($post_data['update_list'], $post_data['delete_list']);
        }
        return json_response(array("success" => $return_data[0], "message" => $return_data[1]));
    }

    public function radio_update(){
        $post_data = app('request')->body;
        $update_data = array();
        $update_data['radio'] = $post_data['radio'];
        $return_data = app('admin')->updateSettings($update_data);
        if($update_data['radio']){
            $return_data = app('admin')->update_radio($post_data['update_list'], $post_data['delete_list']);
        }

        return json_response(array("success" => $return_data[0], "message" => $return_data[1]));
    }

    
    // load login page
    public function login(){

        $post_data = app('request')->body;

        // reCAPTCHA
        if (isset(SETTINGS['enable_recaptcha']) && SETTINGS['enable_recaptcha'] == true) {
            if (isset($_POST["g-recaptcha-response"])) {
                if (isset(SETTINGS['recaptcha_version']) && SETTINGS['recaptcha_version'] == 3) {
                    $recaptcha_verify = recaptcha_v3_verify($_POST["g-recaptcha-response"]);
                }else{
                    $recaptcha_verify = recaptcha_v2_verify($_POST["g-recaptcha-response"]);
                }
                if($recaptcha_verify){
                    $recaptcha_ok = true;
                }else{
                    $recaptcha_ok = false;
                }
            }else{
                $recaptcha_ok = false;
            }
        }else{
            $recaptcha_ok = true;
        }

        if ($post_data && array_key_exists("email", $post_data) && array_key_exists("password", $post_data)) {
            if ($recaptcha_ok) {
                $login = app('auth')->authenticate($post_data['email'], $post_data['password']);
                if($login){
                    app('auth')->logIP($post_data['email'],1,'Success');
                    app('msg')->success(__('Login success. Redirecting...'));
                    if (isset($_GET['next'])) {
                        if (filter_var($_GET['next'], FILTER_VALIDATE_URL) != false) {
                            return json_response(array("success" => true, "message" => app('msg')->display(null, false),  "next" => $_GET['next']));
                        }else {
                            return json_response(array("success" => true, "message" => app('msg')->display(null, false), "next" => route('index')));
                        }
                    }else{
                        return json_response(array("success" => true, "message" => app('msg')->display(null, false), "next" =>  route('index')));
                    }
                    
                }else{
                   // login failed
                   app('auth')->logIP($post_data['email'],1,'Failed');
                   return json_response(array("success" => false, "message" => app('msg')->display(null, false)));
                }
            }else{
                // recaptcha error
                app('msg')->error(__('reCAPTCHA Error!'));
                app('auth')->logIP($post_data['email'],1,'Recaptcha Error');
                return json_response(array("success" => false, "message" =>  app('msg')->display(null, false)));
            }
        }
    }

    public function get_report_reasons(){
        $post_data = app('request')->body;

        $reason_type = app('purify')->xss_clean($post_data['report_type']);
        app('db')->where ('reason_for', Array($reason_type, 0), 'IN');
        $report_reasons = app('db')->get('report_reasons');
        $translated_reasons = array();
        foreach($report_reasons as $reason){
            $reason['title'] = get_default_term($reason['title']);
            array_push($translated_reasons, $reason);
        }
        
        return json_response($translated_reasons);

    }

    public function submit_report(){
        $post_data = app('request')->body;

        $report_type = app('purify')->xss_clean($post_data['report_type']);
        $report_for = app('purify')->xss_clean($post_data['report_for']);
        $report_reason = app('purify')->xss_clean($post_data['report_reason']);
        $report_comment = app('purify')->xss_clean($post_data['report_comment']);
        $chat_type = app('purify')->xss_clean($post_data['chat_type']);
        if($chat_type == 0){
            $chat_type = Null;
        }
        $data = Array (
                        "report_type" => $report_type,
                        "report_for" => $report_for,
                        "chat_type" => $chat_type,
                        "report_reason" => $report_reason,
                        "report_comment" => $report_comment,
                        "reported_by" => app('auth')->user()['id'],
                        "reported_at" => app('db')->now(),
                        "status" => 1,
                        "updated_at" => app('db')->now(),
                    );
        $id = app('db')->insert ('reports', $data);
        return json_response($id);
    }

    // user deativate
    public function deactivate_user(){
        $post_data = app('request')->body;
        if(app('auth')->user()['user_type']==1 || app('auth')->user()['id'] == $post_data['user_id']){
            app('db')->where ('id', app('purify')->xss_clean($post_data['user_id']));
            app('db')->update('users', array('available_status' => 2));
            return json_response(["success" => 'true', "message" => __('User Deactivated')]);
        }
    }

    // room deativate
    public function deactivate_room(){
        $post_data = app('request')->body;
        app('db')->where ('id', app('purify')->xss_clean($post_data['room_id']));
        app('db')->update('chat_rooms', array('status' => 2));
        return json_response(["success" => 'true', "message" => __('Chat Room Deactivated')]);
    }

    //leave room
    public function leave_room(){
        $post_data = app('request')->body;
        $room_id = app('purify')->xss_clean($post_data['leave_room']);

        app('db')->join("chat_groups cg", "cg.id=gu.chat_group", "LEFT");
        app('db')->join("chat_rooms cr", "cr.id=cg.chat_room", "LEFT");
        app('db')->where("gu.user", app('auth')->user()['id']);
        app('db')->where("cr.id", $room_id);
        app('db')->delete('group_users gu');
        return json_response(["success" => 'true', "message" => '']);
    }

    //Clear Chats
    public function clear_chats(){
        $post_data = app('request')->body;
        $active_user = app('purify')->xss_clean($post_data['active_user']);
        $active_group = app('purify')->xss_clean($post_data['active_group']);
        if($active_user){
            $chat_meta_data = app('chat')->getChatMetaData(app('auth')->user()['id'], $active_user);
            $update_meta = array();
            $update_meta['chat_meta_id'] = $chat_meta_data['id'];
            $update_meta['load_chats_from'] = app('db')->now();
            app('chat')->updateChatMetaData($update_meta);
        }else{
            $group_chat_meta = app('chat')->getGroupChatMetaData(app('auth')->user()['id'], $active_group);
            if($group_chat_meta){
                $update_meta = array();
                $update_meta['chat_meta_id'] = $group_chat_meta['id'];
                $update_meta['load_chats_from'] = app('db')->now();
                app('chat')->updateGroupChatMetaData($update_meta);
            }
        }
        return json_response(["success" => 'true', "message" => __('Chats cleared for you')]);
    } 

    public function remove_setting(){
        $post_data = app('request')->body;
        $setting = app('purify')->xss_clean($post_data['setting']);
        if ($setting != "") {
            $update_settings = app('admin')->removeSettings($setting);
            if ($update_settings) {
                return json_response(["success" => 'true', "message" => __('Deleted')]);
            }else{
                return json_response(["success" => 'false', "message" => __('Error')]);
            }
        }
    }

    public function users_by_name(){
        $post_data = app('request')->body;

        $term = app('purify')->xss_clean(clean($post_data['term']));
        $active_group = app('purify')->xss_clean(clean($post_data['active_group']));
        $limit = 5;
        $data = array();
        if($active_group){
            if (isset(SETTINGS['display_name_format']) && SETTINGS['display_name_format']=='username') {
                $sql = "SELECT CONCAT('@', u.user_name) AS user_name , u.id
                    FROM
                        cn_group_users gu
                        LEFT JOIN cn_users u ON u.id = gu.user
                    WHERE
                        gu.chat_group = $active_group
                        AND u.user_name LIKE '$term%'
                        AND u.available_status = '1' LIMIT 0, $limit";
            }else{
                $sql = "SELECT CONCAT('@', u.first_name, ' ', u.last_name) AS user_name , u.id
                    FROM
                        cn_group_users gu
                        LEFT JOIN cn_users u ON u.id = gu.user
                    WHERE
                        gu.chat_group = $active_group
                        AND MATCH ( u.first_name, u.last_name	) AGAINST ( '$term*' IN BOOLEAN MODE )
                        AND u.available_status = '1' LIMIT 0, $limit";
            }
            
            $users = app('db')->rawQuery($sql);
            return json_response(($users));
        }

    }

    public function notification_list(){
        $post_data = app('request')->body;
        $current_user = app('auth')->user()['id'];
        $data = array();

        app('db')->join("users u", "n.user_id=u.id", "LEFT");
        app('db')->where ('n.user_id', $current_user);
        app('db')->orderBy ('n.id', 'DESC');
        $notifications = app('db')->get('notifications n', null, 'n.*, u.user_name, u.first_name, u.last_name');
        $data['notifications'] = $notifications;

        app('db')->where ('is_read', 0);
        app('db')->where ('user_id', $current_user);
        $data['unread_count'] = app('db')->getValue('notifications', 'count(*)');
        return json_response($data);
    }

    public function notification_read(){
        $post_data = app('request')->body;
        $current_user = app('auth')->user()['id'];
        $data = array();
        if (isset($post_data['all']) && $post_data['all'] == 'true') {
            $all=true;
        }else{
            $all=false;
        }
        $read_data = Array ( 'is_read' => '1', 'read_at' => app('db')->now());
        if ($all===false) {
            app('db')->where ('id', $post_data['noti_id']);
        }
        app('db')->where ('user_id', $current_user);
        app('db')->update ('notifications', $read_data);

        app('db')->where ('is_read', 0);
        app('db')->where ('user_id', $current_user);
        $data['unread_count'] = app('db')->getValue('notifications', 'count(*)');
        return json_response($data);
    }

    public function notification_delete(){
        $post_data = app('request')->body;
        $current_user = app('auth')->user()['id'];
        $data = array();
        if (isset($post_data['all']) && $post_data['all'] == 'true') {
            $all=true;
        }else{
            $all=false;
        }
        if ($all===false) {
            app('db')->where ('id', $post_data['noti_id']);
        }
        app('db')->where ('user_id', $current_user);
        app('db')->delete('notifications');

        app('db')->where ('is_read', 0);
        app('db')->where ('user_id', $current_user);
        $data['unread_count'] = app('db')->getValue('notifications', 'count(*)');
        return json_response($data);
    }

    public function notification_unread_count(){
        $current_user = app('auth')->user()['id'];
        $data = array();
        app('db')->where ('is_read', 0);
        app('db')->where ('user_id', $current_user);
        $data['unread_count'] = app('db')->getValue('notifications', 'count(*)');
        return json_response($data);
    }

    public function get_recent_active_media(){
        $post_data = app('request')->body;
        $data = array();
        $data['shared_photos'] = app('chat')->getSharedData(app('auth')->user()['id'], 2, 8, $post_data['active_user'], $post_data['active_group'], $post_data['active_room']);
        $data['shared_files'] = app('chat')->getSharedData(app('auth')->user()['id'], 6, 5, $post_data['active_user'], $post_data['active_group'], $post_data['active_room']);
        $data['shared_links'] = app('chat')->getSharedData(app('auth')->user()['id'], 5, 5, $post_data['active_user'], $post_data['active_group'], $post_data['active_room']);
        return json_response($data);
    }
    
    public function message_reaction(){
        $chat_interaction = array();
        $post_data = app('request')->body;
        $reaction_added = true;
        if($post_data['chat_type'] == "group"){
            app('db')->where('id', $post_data['message_id']);
            $message_data = app('db')->getOne('group_chats');
            $chat_type = 2;
        }else{
            app('db')->where('id', $post_data['message_id']);
            $message_data = app('db')->getOne('private_chats');
            $chat_type = 1;
        }

        if($message_data){
            if($message_data['reactions']){
                $reaction_array = json_decode($message_data['reactions'], true);
            }else{
                $reaction_array = array();
            }
        }else{
            $reaction_array = array();
        }

        //get exist interaction
        $exist_interactions = app('chat')->getChatInteraction($post_data['message_id'], app('auth')->user()['id'], $chat_type);
        if ($exist_interactions) {
            //if exist reaction in chat reaction array, subtract 1 reaction count
            if (array_key_exists($exist_interactions['reaction'], $reaction_array)){
                $reaction_array[$exist_interactions['reaction']] -= 1;
                if($reaction_array[$exist_interactions['reaction']] <= 0){
                    unset($reaction_array[$exist_interactions['reaction']]);
                }
            }

            //if exist reaction and current reaction is same, set reaction as 0
            if($exist_interactions['reaction'] == $post_data['reaction_type']){
                $chat_interaction['reaction'] = 0;
                $message = "Reaction removed";
                $reaction_added = false;
            }else{
                $chat_interaction['reaction'] = $post_data['reaction_type'];
                $message = "Reaction updated";
            }
            $chat_interaction['id'] = $exist_interactions['id'];

        }else{
            $chat_interaction['chat_id'] = $post_data['message_id'];
            $chat_interaction['user_id'] = app('auth')->user()['id'];
            $chat_interaction['reaction'] = $post_data['reaction_type'];
            $message = "Reaction added";
        }
        $chat_interaction['chat_type'] = $chat_type;
        $chat_interaction['reacted_at'] = app('db')->now();
        app('chat')->updateChatInteraction($chat_interaction);

        if($reaction_added){
            if (array_key_exists($post_data['reaction_type'], $reaction_array)){
                $reaction_array[$post_data['reaction_type']] += 1;
            }else{
                $reaction_array[$post_data['reaction_type']] = 1;
            }
        }

        if (count($reaction_array) === 0) {
            $reaction_array = NULL;
        }else{
            $reaction_array = json_encode($reaction_array);
        }
        
        if($post_data['chat_type'] == "group"){
            app('db')->where ('id', $post_data['message_id']);
            app('db')->update('group_chats', array("reactions" => $reaction_array, "updated_at" => app('db')->now()));
        }else{
            app('db')->where ('id', $post_data['message_id']);
            app('db')->update('private_chats', array("reactions" => $reaction_array, "updated_at" => app('db')->now()));
        }
        //app('chat')->chat_updated_trigger($post_data['chat_type'], $post_data['message_id'], 'message_reacted');
        return json_response(["success" => 'true', "message" => $message]);
    }

    public function message_reaction_list(){
        $post_data = app('request')->body;

        if($post_data['chat_type'] == "group"){
            app('db')->where('id', $post_data['message_id']);
            $message_data = app('db')->getOne('group_chats');
            $chat_type = 2;
        }else{
            app('db')->where('id', $post_data['message_id']);
            $message_data = app('db')->getOne('private_chats');
            $chat_type = 1;
        }

        if($message_data){
            $data['reaction_list'] = $message_data['reactions'];
            $data['reacted_users'] = app('chat')->get_msg_reaction_data($post_data['message_id'], $chat_type);    
        }else{
            $data = array();
        }
        return json_response($data);

    }

    public function message_reaction_remove(){
        $post_data = app('request')->body;
        if($post_data['chat_type'] == "group"){
            app('db')->where('id', $post_data['message_id']);
            $message_data = app('db')->getOne('group_chats');
            $chat_type = 2;
        }else{
            app('db')->where('id', $post_data['message_id']);
            $message_data = app('db')->getOne('private_chats');
            $chat_type = 1;
        }

        if($message_data){
            if($message_data['reactions']){
                $reaction_array = json_decode($message_data['reactions'], true);

                $exist_interactions = app('chat')->getChatInteraction($post_data['message_id'], app('auth')->user()['id'], $chat_type);
                if ($exist_interactions) {
                    //if exist reaction in chat reaction array, subtract 1 reaction count
                    if (array_key_exists($exist_interactions['reaction'], $reaction_array)){
                        $reaction_array[$exist_interactions['reaction']] -= 1;
                        if($reaction_array[$exist_interactions['reaction']] <= 0){
                            unset($reaction_array[$exist_interactions['reaction']]);
                        } 

                        $chat_interaction = array();
                        $chat_interaction['id'] = $exist_interactions['id'];
                        $chat_interaction['reaction'] = 0;
                        $chat_interaction['chat_type'] = $chat_type;
                        app('chat')->updateChatInteraction($chat_interaction);
                       
                    }
                }

                if (count($reaction_array) === 0) {
                    $reaction_array = NULL;
                }else{
                    $reaction_array = json_encode($reaction_array);
                }
                
                if($post_data['chat_type'] == "group"){
                    app('db')->where ('id', $post_data['message_id']);
                    app('db')->update('group_chats', array("reactions" => $reaction_array, "updated_at" => app('db')->now()));
                }else{
                    app('db')->where ('id', $post_data['message_id']);
                    app('db')->update('private_chats', array("reactions" => $reaction_array, "updated_at" => app('db')->now()));
                }
                return json_response(["success" => 'true', "message" => 'Reaction removed']);

            }else{
                return json_response(["success" => 'false', "message" => 'Message current reaction ']);
            }
        }else{
            return json_response(["success" => 'false', "message" => 'Message not found']);
        }

    }

    public function launch_private_call(){
        $post_data = app('request')->body;
        if (isset(SETTINGS['video_calling']) && SETTINGS['video_calling']){
            if($post_data['chat_meta_id'] && $post_data['to_user']){
                //check in_call status for you
                $from_user = app('auth')->user()['id'];
                app('db')->where ('from_user', $from_user);
                app('db')->where ('in_call', 1);
                $in_call = app('db')->get('private_chat_meta');
                if($in_call){
                    $success = "false";
                    $message = __('You are currently on a call with someone');
                }else{

                    //check in_call status through to_user
                    app('db')->where ('to_user', $post_data['to_user']);
                    app('db')->where ('in_call', 1);
                    $in_call = app('db')->get('private_chat_meta');
                    if($in_call){
                        $success = "false";
                        $message = __('User is busy');
                    }else{
                        //check in_call status through from_user
                        app('db')->where ('from_user', $post_data['to_user']);
                        app('db')->where ('in_call', 1);
                        $in_call_from = app('db')->get('private_chat_meta');
                        if($in_call_from){
                            $success = "false";
                            $message = __('User is busy');
                        }else{
                            $call_data = Array ();
                            $call_data['meta_id'] = $post_data['chat_meta_id'];
                            $call_data['initiated_on'] = app('db')->now();
                            $call_data['status'] = 1;
                            $call_id = app('db')->insert('private_calls', $call_data);
                            if($call_id){

                                $update_meta = array();
                                $update_meta['im_calling'] = 1;
                                $update_meta['in_call'] = 1;
                                $update_meta['chat_meta_id'] = $post_data['chat_meta_id'];
                                $update_meta['last_call_id'] = $call_id;
                                $update_meta['updated_at'] = app('db')->now();
                                app('chat')->updateChatMetaData($update_meta);

                                //active user chat meta
                                $to_user_chat_meta_data = app('chat')->getChatMetaData($post_data['to_user'], app('auth')->user()['id'], $post_data['active_room']);
                                $to_user_update_meta = array();
                                $to_user_update_meta['in_call'] = 1;
                                $to_user_update_meta['chat_meta_id'] = $to_user_chat_meta_data['id'];
                                $to_user_update_meta['last_call_id'] = $call_id;
                                $to_user_update_meta['updated_at'] = app('db')->now();
                                app('chat')->updateChatMetaData($to_user_update_meta);

                                $success = "true";
                                $message = array('call_id' => $call_id, 'call_status' => 1);
                            }else{
                                $success = "false";
                                $message = __('Something went wrong!');
                            }
                        }
                    }
                }
            }else{
                $success = "false";
                $message = __('Something went wrong!');
            }
        }else{
            $success = "false";
            $message = __('Video Calling Disabled!');
            
        }
        return json_response(["success" => $success, "response" => $message]);
    }

    public function answer_private_call(){
        $post_data = app('request')->body;
        if($post_data['call_id']){
            $call_data = Array ();
            $call_data['answered_on'] = app('db')->now();
            $call_data['status'] = 2;
            app('db')->where ('id', $post_data['call_id']);
            app('db')->update('private_calls', $call_data);

            $success = "true";
            $message = array('call_id' => $post_data['call_id'], 'call_status' => 2);
        }else{
            $success = "false";
            $message = __('Call ID is missing!');
        }
        return json_response(["success" => $success, "response" => $message]);
    }

    public function hangup_private_call(){
        $post_data = app('request')->body;
        if($post_data['call_id']){
            app('chat')->hang_up_call($post_data['call_id']);

            $success = "true";
            $message = array('call_id' => $post_data['call_id'], 'call_status' => 3);
        }else{
            $success = "false";
            $message = __('Call ID is missing!');
        }
        return json_response(["success" => $success, "response" => $message]);
    }

    public function check_call_status(){
        $post_data = app('request')->body;
        $success = "false";
        $message = array();
        if($post_data['call_id']){
            $call_data = app('chat')->get_call_data($post_data['call_id']);
            if($call_data['status'] == 1 && $call_data['expired_call']){
                $call_data['status'] = 3;
                app('chat')->hang_up_call($post_data['call_id']);
            }else if($call_data['status'] == 2 && $call_data['call_length_exceeded']){
                $call_data['status'] = 3;
                app('chat')->hang_up_call($post_data['call_id']);
            }

            app('db')->where ('id', $call_data['meta_id']);
            $call_meta = app('db')->getOne('private_chat_meta');

            $call_type = " ".__('Calling')." ";
            if($call_data['status'] == 1){
                $call_type = " ".__('Calling')." ";
            }elseif ($call_data['status'] == 2) {
                $call_type = " ".__('Connecting')." ";
            }elseif ($call_data['status'] == 3) {
                $call_type = " ".__('Ending')." ";
            }

            if($call_meta['from_user'] == app('auth')->user()['id']){
                $calling_user = app('auth')->user($call_meta['to_user']);
                $calling_user_name = $calling_user['first_name'] . ' ' . $calling_user['last_name'];
                $calling_msg = $call_type . $calling_user_name . "...";
            }else{
                $calling_user = app('auth')->user($call_meta['from_user']);
                $calling_user_name = $calling_user['first_name'] . ' ' . $calling_user['last_name'];
                $calling_msg = $calling_user_name . $call_type . "...";
            }
            $call_data['calling_msg'] = $calling_msg;
            $success = "true";
            $message = $call_data;
        }
        return json_response(["success" => $success, "response" => $message]);
    }

    public function connect_private_call(){
        $post_data = app('request')->body;
        if ($post_data['call_id']) {
            if (isset(SETTINGS['video_calling_provider']) && SETTINGS['video_calling_provider'] == 'agora' ){
                require_once BASE_PATH.DS.'classes'.DS.'AgoraDynamicKey/RtcTokenBuilder.php';
                if((isset(SETTINGS['agora_app_id']) && SETTINGS['agora_app_id']) && (isset(SETTINGS['agora_app_certificate']) && SETTINGS['agora_app_certificate'])){

                    $appID = SETTINGS['agora_app_id'];
                    $appCertificate = SETTINGS['agora_app_certificate'];

                    $channelName = 'cn-agora-ch-'.$post_data['call_id'];

                    $uid = app('auth')->user()['user_name']; // Set to 0 if you want to let Agora assign a user ID
                    $role = \RtcTokenBuilder::RoleAttendee;
                    $expireTimeInSeconds = 3600; // Token valid for 1 hour
                    
                    $currentTimestamp = (new \DateTime("now", new \DateTimeZone('UTC')))->getTimestamp();
                    $privilegeExpiredTs = $currentTimestamp + $expireTimeInSeconds;
                    
                    $token = \RtcTokenBuilder::buildTokenWithUid($appID, $appCertificate, $channelName, $uid, $role, $privilegeExpiredTs);

                    return json_response([ 'success' => "true", 'appId' => $appID, 'accessToken' => $token, 'roomName' => $channelName ]);
                }else{
                    return json_response([ 'success' => "false", 'message' => __('Video Calling Settings issue') ]);
                }
            }else{
                return json_response([ 'success' => "false", 'message' => __('Video Calling Settings issue') ]);
            }
            
        }
    }


}
