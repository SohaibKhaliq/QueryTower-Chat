<?php

/* Admin class for script administrator*/

class Admin
{
    // This function is responsible for saving settings all data
    function updateSettings($data){
        $status = true;
        $message = array();
        if(!array_key_exists("user_list_auth_roles", $data) or $data['user_list_type'] != 3){
            $data['user_list_auth_roles'] = [];
        }
        foreach ($data as $key => $value) {
            if($key == 'user_list_auth_roles'){
                $validate_data[1][0] = true;
                $user_list_auth_roles = $data['user_list_auth_roles'];
                $auth_role_array = array();
                foreach($user_list_auth_roles as $auth_role){
                    $auth_role_array[] = $auth_role;
                }
                $value = json_encode($auth_role_array);
            }else{
                $validate_data = clean_and_validate($key, $value);
                $value = $validate_data[0];
            }
            
            if($validate_data[1][0]){
                app('db')->where('name', $key);
                if(app('db')->getOne('settings')){
                    app('db')->where ('name', $key);
                    app('db')->update('settings', array('value' => $value));
                }else{
                    app('db')->insert ('settings', array('name' => $key, 'value' => $value));
                }
            }else{
                $status = false;
                array_push($message, $validate_data[1][1]);
            }
        }
        return array($status, $message);
    }

    // This function is responsible for saving chatroom data
    function updateChatroom($post_data, $FILES){
        $show_background = 1;
        $is_protected = 0;
        $pw_check = True;
        $is_visible = 0;
        $password = "";
        $new_room = false;
        $allow_guest_view = 0;
        $ad_chat_left_bar = '';
        $ad_chat_right_bar = '';
        $privilege_room_user = $this->checkUserRoomPrivilege(app('auth')->user()['id'], $post_data['room_id']);
        
        if(array_key_exists("allow_guest_view", $post_data)){
            $allow_guest_view = 1;
        }

        if(array_key_exists("is_protected", $post_data)){
            $is_protected = 1;
            $allow_guest_view = 0;
            $password = $post_data['pin'];
            if(!$password){
                $pw_check = False;
            }
        }
        
        if(array_key_exists("is_visible", $post_data)){
            $is_visible = 1;
        }
        if(!array_key_exists("show_background", $post_data)){
            $show_background = 0;
        }
        if(array_key_exists("ad_chat_left_bar", $post_data)){
            $ad_chat_left_bar = $post_data['ad_chat_left_bar'];
        }
        if(array_key_exists("ad_chat_right_bar", $post_data)){
            $ad_chat_right_bar = $post_data['ad_chat_right_bar'];
        }

        if(array_key_exists("hide_chat_list", $post_data) && $post_data['hide_chat_list'] != ""){
            $hide_chat_list = $post_data['hide_chat_list'];
        }else{
            $hide_chat_list = Null;
        }

        if(array_key_exists("room_auto_join", $post_data) && $post_data['room_auto_join'] != ""){
            $room_auto_join = $post_data['room_auto_join'];
        }else{
            $room_auto_join = Null;
        }

        if(array_key_exists("disable_private_chats", $post_data) && $post_data['disable_private_chats'] != ""){
            $disable_private_chats = $post_data['disable_private_chats'];
        }else{
            $disable_private_chats = Null;
        }

        if(array_key_exists("disable_group_chats", $post_data) && $post_data['disable_group_chats'] != ""){
            $disable_group_chats = $post_data['disable_group_chats'];
        }else{
            $disable_group_chats = Null;
        }

        if(array_key_exists("user_list_type", $post_data) && $post_data['user_list_type'] != ""){
            $user_list_type = $post_data['user_list_type'];
        }else{
            $user_list_type = Null;
        }

        
        if($privilege_room_user){
            if($pw_check){
                if($post_data['room_id']){
                    app('db')->where('id !=' . $post_data['room_id']);
                }
                app('db')->where('slug', $post_data['slug']);
                $exist_data = app('db')->getOne('chat_rooms');
                if(!$exist_data){
                    $data = Array ("name" => $post_data['name'],
                                   "description" => $post_data['description'],
                                   "slug" => $post_data['slug'],
                                   "is_protected" => $is_protected,
                                   "pin" => $password,
                                   "is_visible" => $is_visible,
                                   "status" => $post_data['status'],
                                   "allow_guest_view" => $allow_guest_view,
                                   "room_notice_message" => $post_data['room_notice_message'],
                                   "room_notice_class" => $post_data['room_notice_class'],
                                   "ad_chat_left_bar" => $ad_chat_left_bar,
                                   "ad_chat_right_bar" => $ad_chat_right_bar,
                                   "show_background" => $show_background

                                );

                    $status = true;
                    $message = array();
                    foreach ($data as $key => $value) {
                        $validate_data = clean_and_validate($key, $value);
                        $value = $validate_data[0];
                        if($key == 'pin'){
                            unset($data['pin']);
                            $data["password"] = $value;
                        }else{
                            $data[$key] = $value;
                        }

                        if(!$validate_data[1][0]){
                            $status = false;
                            array_push($message, $validate_data[1][1]);
                        }
                    }

                    if($status){
                        $allowed_users = $post_data['allowed_users'];
                        $allowed_user_array = array();
                        foreach($allowed_users as $allow_user){
                            $allowed_user_array[] = $allow_user;
                        }
                        $data['allowed_users'] = json_encode($allowed_user_array);
                        $data['room_auto_join'] = $room_auto_join;
                        $data['hide_chat_list'] = $hide_chat_list;
                        $data['disable_private_chats'] = $disable_private_chats;
                        $data['disable_group_chats'] = $disable_group_chats;
                        $data['user_list_type'] = $user_list_type;
                        if(!array_key_exists("user_list_auth_roles", $post_data) or $user_list_type != 3){
                            $data['user_list_auth_roles'] = '[]';
                        }else{
                            $user_list_auth_roles = $post_data['user_list_auth_roles'];
                            $auth_role_array = array();
                            foreach($user_list_auth_roles as $auth_role){
                                $auth_role_array[] = $auth_role;
                            }
                            $data['user_list_auth_roles'] = json_encode($auth_role_array);
                        }
                        
                        if($post_data['room_id']){
                            $room_id = $post_data['room_id'];
                            app('db')->where ('id', $room_id);
                            app('db')->update('chat_rooms', $data);
                        }else{
                            $new_room = true;
                            $data["created_by"] = app('auth')->user()['id'];
                            $room_id = app('db')->insert('chat_rooms', $data);
                        }

                        app('db')->where ('slug', 'general');
                        app('db')->where ('chat_room', $room_id);
                        $group_id = app('db')->getOne('chat_groups');
                        if(!$group_id){
                            $data = Array ("name" => "General",
                                           "slug" => "general",
                                           "chat_room" => $room_id,
                                           "status" => 1,
                                           "created_by" => app('auth')->user()['id'],
                                           "created_at" => app('db')->now()
                                        );
                            $group_id = app('db')->insert('chat_groups', $data);

                            $join_data = Array (
                                "user" => app('auth')->user()['id'],
                                "chat_group" => $group_id,
                                "user_type" => 1,
                                "status" => 1,
                                "created_at" => app('db')->now(),
                                "updated_at" => app('db')->now()
                            );
                            app('db')->insert ('group_users', $join_data);
                        }else{
                            app('db')->where ('chat_group', $group_id['id']);
                            app('db')->get('group_users');
                            if(app('db')->count == 0){
                                $join_data = Array (
                                    "user" => app('auth')->user()['id'],
                                    "chat_group" => $group_id['id'],
                                    "user_type" => 1,
                                    "status" => 1,
                                    "created_at" => app('db')->now(),
                                    "updated_at" => app('db')->now()
                                );
                                app('db')->insert ('group_users', $join_data);
                            }
                        }

                        app('db')->where('id', $room_id);
                        $room_data = app('db')->getOne('chat_rooms');
                        $room_data['new_room'] = $new_room;

                        $image_status = true;
                        $image_message = "";
                        if(array_key_exists("cover_image", $FILES)){
                            if($FILES['cover_image']['name']){
                                $image = image($FILES['cover_image'], false, 'chatrooms', 480, 640);
                                if($image[0]){
                                    if($room_data['cover_image']){
                                        $old_image = BASE_PATH . 'media/chatrooms/'.$room_data['cover_image'];
                                        if(file_exists($old_image)) {
                                            unlink($old_image);
                                        }
                                    }

                                    app('db')->where ('id', $room_id);
                                    app('db')->update('chat_rooms', Array("cover_image" => $image[1]));
                                }else{
                                    $image_status = false;
                                    $image_message = $image[1];
                                }
                            }
                        }
                        if(array_key_exists("background_image", $FILES)){
                            if($FILES['background_image']['name']){
                                $image = image($FILES['background_image'], false, 'chatrooms', 480, 640);
                                if($image[0]){
                                    if($room_data['background_image']){
                                        $old_image = BASE_PATH . 'media/chatrooms/'.$room_data['background_image'];
                                        if(file_exists($old_image)) {
                                            unlink($old_image);
                                        }
                                    }

                                    app('db')->where ('id', $room_id);
                                    app('db')->update('chat_rooms', Array("background_image" => $image[1]));
                                }else{
                                    $image_status = false;
                                    $image_message = $image[1];
                                }
                            }
                        }

                        if($image_status){
                            $update_room_return = array('true', 'Successfully Updated!', $room_data);
                        }else{
                            $update_room_return = array($image_status, array(array('cover_image' => [$image_message])), '');
                        }
                    }else{
                        $update_room_return = array($status, $message, '');
                    }
                }else{
                    $update_room_return = array('false', array(array('slug' => ['Slug already exist!'])), '');
                }
            }else{
                $update_room_return = array('false', array(array('pin' => ['Room pin required!'])), '');
            }
        }else{
            $update_room_return = array('false', __('Access revoked'), '');
        }

        return json_response(["success" => $update_room_return[0], "message" => $update_room_return[1], "info" => $update_room_return[2]]);

    }

    // update language data
    function language_update($post_data){
        $data = Array ("code" => $post_data['code'],
                       "name" => $post_data['name'],
                       "country" => $post_data['country'],
                       "direction" => $post_data['direction'],
                       "google_font_family" => $post_data['google_font_family']
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
            if($post_data['edit_type'] == "update"){
                app('db')->where('code', $data['code']);
                app('db')->update('languages', $data);
            }else{
                app('db')->where('code', $data['code']);
                $language_exist = app('db')->getOne('languages');
                if ($language_exist) {
                    $status = false;
                    array_push($message, array(array('code' => ['Language code already exists!'])));
                } else {
                    $id = app('db')->insert ('languages', $data);
                }
            }
        }

        return array($status, $message);
    }

    // update language translation
    function update_translation($post_data){
        unset($post_data['csrftoken']);
        $status = true;
        $message = array();
        $data = array();
        $updated_keys = array();
        foreach ($post_data as $key => $value) {
            if($key > 0 and $key != 'lang'){
                $validate_data = clean_and_validate($key, $value);
                $value = $validate_data[0];
                if($value){
                    array_push($data, array($post_data['lang'], $key, $value));
                    
                    array_push($updated_keys, $key);
                }
                if(!$validate_data[1][0]){
                    $status = false;
                    array_push($message, $validate_data[1][1]);
                }
            }
        }
        if($status){
            $keys = Array("lang_code", "term_id", "translation");
            app('db')->where('term_id', $updated_keys, 'IN');
            app('db')->where ('lang_code', $post_data['lang']);
            app('db')->delete('translations');
            $ids = app('db')->insertMulti('translations', $data, $keys);
        }

        // Create lang file
        if (is_writable(BASE_PATH.'lang')) {
            app('db')->join("translations tr", "tr.term_id=lt.id", "LEFT");
            app('db')->joinWhere('translations tr', 'tr.lang_code', $post_data['lang']);
            $lang_terms = app('db')->get('lang_terms lt', null, 'lt.term, tr.translation, lt.section');
            $final = array();
            foreach ($lang_terms as $lang_term) {
                $final[$lang_term['section']][strtolower($lang_term['term'])] = $lang_term['translation'];
            }
            $lang_file = BASE_PATH.'lang'.DS.$post_data['lang'].'_'.CV.'.php';
            $file_content = serialize($final);
            if (isset($lang_terms)) {
                file_put_contents($lang_file, $file_content);
            }
        }


        return array($status, $message);
    }

    // delete selected users
    function delete_users($post_data){
        $status = true;
        $message = array();
        $delete_users = $post_data['delete_user_list'];

        foreach($delete_users as $delete_user){
            if (isset(SETTINGS['unlink_with_delete']) && SETTINGS['unlink_with_delete'] == true) {
                //unlink user avatar
                app('db')->where ('id', $delete_user);
                $delete_profile = app('db')->getOne('users');
                if($delete_profile['avatar']){
                    if (file_exists('media/avatars/'.$delete_profile['avatar'])) {
                        unlink('media/avatars/'.$delete_profile['avatar']);
                    }
                }

                //unlink group chats files
                app('db')->where('sender_id', $delete_user);
                app('db')->where('type', Array(2, 6, 7, 8), 'IN');
                $group_chats = app('db')->get('group_chats');
                foreach ($group_chats as $chat) {
                    app('chat')->unlink_files($chat['message'], $chat['type']);
                }

                //unlink private chats files
                app('db')->where('sender_id', $delete_user);
                app('db')->where('type', Array(2, 6, 7, 8), 'IN');
                $private_chats = app('db')->get('private_chats');
                foreach ($private_chats as $chat) {
                    app('chat')->unlink_files($chat['message'], $chat['type']);
                }
            }

            app('db')->where ('user', $delete_user);
            app('db')->delete('group_users');

            app('db')->where ('sender_id', $delete_user);
            app('db')->delete('group_chats');

            app('db')->where ('from_user', $delete_user);
            app('db')->delete('private_chat_meta');

            app('db')->where ('sender_id', $delete_user);
            app('db')->delete('private_chats');

            app('db')->where ('id', $delete_user);
            app('db')->delete('users');
        }

        return array($status, $message);
    }

    function update_auth_provider($update_list, $delete_list){
        foreach(json_decode($delete_list) as $delete_auth){
            app('db')->where ('name', $delete_auth);
            app('db')->delete('social_logins');
        }

        foreach(json_decode($update_list) as $auth_provider){
            app('db')->where ('name', $auth_provider[0]);
            $exist_auth = app('db')->getOne('social_logins');
            if($exist_auth){
                $update_data = Array (
                    "id_key" => $auth_provider[1],
                    "secret_key" => $auth_provider[2],
                    "status" => $auth_provider[3]
                );
                app('db')->where('name', $exist_auth['name']);
                app('db')->update('social_logins', $update_data);
            }else{
                $data = Array (
                    "name" => $auth_provider[0],
                    "id_key" => $auth_provider[1],
                    "secret_key" => $auth_provider[2],
                    "status" => $auth_provider[3]
                );
                $id = app('db')->insert('social_logins', $data);
            }

        }

        return array(true, "");
    }

    function update_radio($update_list, $delete_list){
        foreach(json_decode($delete_list) as $delete_radio){
            app('db')->where ('id', $delete_radio);
            app('db')->delete('radio_stations');
        }

        foreach(json_decode($update_list, true) as $radio_station){
            $image_status = true;
            $image_message = "";
            $radio_icon = $radio_station['data_image'];
            $radio_icon_name = "";
            if($radio_icon){
                $radio_icon_name = uniqid(rand(), true).'_radio.jpg';
                $radio_icon_path = BASE_PATH. 'media'.DS.'settings'.DS.$radio_icon_name;
                base64_to_upload($radio_icon, $radio_icon_path);
                $image = new ImageResize($radio_icon_path);
                $image->crop(50, 50);
                $image->save($radio_icon_path);
            }

            $data = Array();
            $data['name'] = $radio_station['radio_station_name'];
            $data['description'] = $radio_station['description'];
            $data['description'] = $radio_station['description'];
            $data['source'] = $radio_station['source'];
            $data['status'] = $radio_station['status'];
            if($radio_icon_name){
                $data['image'] = $radio_icon_name;
            }

            app('db')->where ('id', $radio_station['id']);
            $exist_radio = app('db')->getOne('radio_stations');
            if($exist_radio){
                app('db')->where('id', $exist_radio['id']);
                app('db')->update('radio_stations', $data);
            }else{
                $id = app('db')->insert('radio_stations', $data);
            }

        }

        return array(true, "");
    }

    function checkUserRoomPrivilege($user_id, $room_id=false){
        $user_data = app('auth')->user($user_id);
        $user_room_access = false;
        if($user_data['user_type'] == 1){
            $user_room_access = true;
        }else{
            if($room_id){
                app('db')->where('id', $room_id);
                app('db')->where('created_by', $user_id);
                $created_by = app('db')->getOne('chat_rooms');
                if($created_by){
                    $user_room_access = true;
                }else if($user_data['user_type'] == 4){
                    $user_room_access = true;
                }else{
                    app('db')->where ('slug', 'general');
                    app('db')->where ('chat_room', $room_id);
                    $general_group = app('db')->getOne('chat_groups');
                    if($general_group){
                        app('db')->where ('chat_group', $general_group['id']);
                        app('db')->where ('user', $user_id);
                        app('db')->where ('is_mod', 1);
                        $group_mod = app('db')->getOne('group_users');
                        if($group_mod){
                            $user_room_access = true;
                        }
                    }
                }
            }else{
                if($user_data['user_type'] == 2 and SETTINGS['enable_members_room'] == true){
                    $user_room_access = true;
                }else if($user_data['user_type'] == 4 and SETTINGS['enable_moderators_room'] == true){
                    $user_room_access = true;
                }
            }
        }
        if(!$user_room_access){
            $_SESSION['user'] = $user_data;
        }
        return $user_room_access;
    }


    function removeSettings($setting){
        app('db')->where('name', $setting);
        if(app('db')->getOne('settings')){
            app('db')->where('name', $setting);
            app('db')->delete('settings');
            return true;
        }else{
            return false;
        }
    }

    function update_menus($update_list, $delete_list){
        foreach(json_decode($delete_list) as $delete_menu){
            app('db')->where ('id', $delete_menu);
            app('db')->delete('menus');
        }

        foreach(json_decode($update_list, true) as $menu){

            $data = Array();
            $data['title'] = app('purify')->xss_clean($menu['title']);
            $data['permalink'] = app('purify')->xss_clean($menu['permalink']);
            $data['menu_order'] = app('purify')->xss_clean($menu['menu_order']);
            $data['icon_class'] = app('purify')->xss_clean($menu['icon_class']);
            $data['css_class'] = app('purify')->xss_clean($menu['css_class']);
            $data['target'] = app('purify')->xss_clean($menu['target']);
            $data['status'] = app('purify')->xss_clean($menu['status']);
            $data['members_only'] = app('purify')->xss_clean($menu['members_only']);
            app('db')->where ('id', $menu['id']);
            $exist_menu = app('db')->getOne('menus');
            if($exist_menu){
                app('db')->where('id', $exist_menu['id']);
                app('db')->update('menus', $data);
            }else{
                $id = app('db')->insert('menus', $data);
            }

        }

        return array(true, "");
    }


    function update_badges($update_list, $delete_list){
        foreach(json_decode($delete_list) as $delete_badge){
            app('db')->where ('id', $delete_badge);
            app('db')->delete('badges');
        }

        foreach(json_decode($update_list, true) as $badge){
            $image_status = true;
            $image_message = "";
            $badge_icon = $badge['data_image'];
            $badge_icon_name = "";
            if($badge_icon){
                $badge_icon_name = uniqid(rand(), true).'_badge.jpg';
                $badge_icon_path = BASE_PATH. 'media'.DS.'settings'.DS.$badge_icon_name;
                base64_to_upload($badge_icon, $badge_icon_path);
                $image = new ImageResize($badge_icon_path);
                $image->crop(50, 50);
                $image->save($badge_icon_path);
            }

            $data = Array();
            $data['name'] = $badge['badge_name'];
            $data['status'] = $badge['status'];
            if($badge_icon_name){
                $data['icon'] = $badge_icon_name;
            }

            app('db')->where ('id', $badge['id']);
            $exist_badge = app('db')->getOne('badges');
            if($exist_badge){
                app('db')->where('id', $exist_badge['id']);
                app('db')->update('badges', $data);
            }else{
                $id = app('db')->insert('badges', $data);
            }

        }

        return array(true, "");
    }

}
