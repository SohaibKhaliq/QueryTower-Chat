<?php

class Chat {

    // Save new chat message with it's relavent type to database
    function saveNewMessage($sender, $message_content, $to_user=Null, $to_group=Null, $to_room=Null, $message_type=1, $chat_meta_id=Null){
        $message_content  = trim($message_content);
        $message_id = null;
        $time = "";
        $preview = null;
        // check provided data validity
        if(empty($sender)){
            $status = false;
            $message = "Please Login!";
        }elseif (empty($message_content)) {
            $status = false;
            $message = "Message Content Empty!";
        }elseif (empty($to_room)) {
            $status = false;
            $message = "Empty Room!";
        }elseif (empty($to_user) and empty($to_group)) {
            $status = false;
            $message = "Please select sending user or group!";
        }else{
            if(empty($to_user)){
                $to_user = null;
            }else{
                $to_user = (int)$to_user;
            }

            if(empty($to_group)){
                $to_group = null;
            }else{
                $to_group = (int)$to_group;
            }

            if($to_user){
                if($to_user > $sender) {
                    $user_1 = $sender;
                    $user_2 = $to_user;
                }else{
                    $user_1 = $to_user;
                    $user_2 = $sender;
                }

                $data = Array ("user_1" => $user_1,
                               "user_2" => $user_2,
                               "sender_id" => $sender,
                               "room_id" => $to_room,
                               "type" => $message_type,
                               "message" => $message_content,
                               "status" => 1,
                               "time" => app('db')->now(),
                               "updated_at" => app('db')->now(),
                            );
                $id = app('db')->insert ('private_chats', $data);
                app('db')->where('id', $id);
                $chat_data = app('db')->getOne('private_chats');

                if($chat_meta_id){
                    app('db')->where('id', $chat_meta_id);
                    $chat_meta_data = app('db')->getOne('private_chat_meta');

                    $update_meta = array();
                    $update_meta['chat_meta_id'] = $chat_meta_data['id'];
                    $update_meta['unread_count'] = $chat_meta_data['unread_count'] + 1;
                    $update_meta['last_chat_id'] = $id;
                    $update_meta['is_typing'] = 0;
                    $this->updateChatMetaData($update_meta);

                    //active user chat meta
                    $to_user_chat_meta_data = $this->getChatMetaData($to_user, $sender, $to_room);
                    $to_user_update_meta = array();
                    $to_user_update_meta['chat_meta_id'] = $to_user_chat_meta_data['id'];
                    $to_user_update_meta['last_chat_id'] = $id;
                    $this->updateChatMetaData($to_user_update_meta);
                }
            }else{
                $data = Array ("sender_id" => $sender,
                               "group_id" => $to_group,
                               "room_id" => $to_room,
                               "type" => $message_type,
                               "message" => $message_content,
                               "status" => 1,
                               "time" => app('db')->now(),
                               "updated_at" => app('db')->now(),
                            );
                $id = app('db')->insert ('group_chats', $data);

                app('db')->where('id', $id);
                $chat_data = app('db')->getOne('group_chats');
                if($chat_meta_id){
                    $update_meta = array();
                    $update_meta['updated_at'] = app('db')->now();
                    $update_meta['unread_count'] = app('db')->inc(1);

                    app('db')->where('chat_group', $to_group);
                    app('db')->where('id != ' . $chat_meta_id);
                    app('db')->update('group_users', $update_meta);
                }
            }
            if($id){
                $status = true;
                $message = "Message Sent";
                $message_id = $id;
                $time = $chat_data['time'];
                if ($message_type == 5) {
                    $preview = $message_content;
                }

            }else{
                $status = false;
                $message = "Failed to Save Data!";
                $time = "";
            }
        }
        $return_data = array();
        $return_data['status'] = $status;
        $return_data['message'] = $message;
        $return_data['id'] = $message_id;
        $return_data['time'] = $time;
        $return_data['preview'] = $preview;
        return $return_data;
    }

    // Get active users list
    function get_active_list($room_id, $user_id=false, $q=false, $search_mode='users'){
        $data = array();
        $q_sql = "";
        if ($q) {
            $q_sql = " AND (u.first_name LIKE '%".$q."%' OR u.last_name LIKE '%".$q."%' )";
        }
        app('db')->where ('id', $room_id);
        if ($chat_room = app('db')->getOne('chat_rooms')) {
            if($user_id){
                $loged_in_user_id = $user_id;
            }else{
                $loged_in_user_id = app('auth')->user()['id'];
            }

            // Get room's default group
            app('db')->join("group_users gu", "gu.chat_group=cg.id AND gu.user=$loged_in_user_id", "LEFT");
            app('db')->where ('cg.slug', 'general');
            app('db')->where ('cg.chat_room', $chat_room['id']);
            $chat_group = app('db')->getOne("chat_groups cg", "cg.*, gu.unread_count, gu.is_muted, gu.is_mod");
            if($chat_group){
                // create chat room cover image url
                if ($chat_room['cover_image']) {
                    $chat_room['cover_url'] = MEDIA_URL."/chatrooms/".$chat_room['cover_image'];
                }else {
                    $chat_room['cover_url'] = URL."static/img/group.png";
                }

                // create chat group cover image url
                if (isset($chat_group) && $chat_group['cover_image']) {
                    $chat_group['cover_url'] = MEDIA_URL."/chatgroups/".$chat_group['cover_image'];
                } else {
                    $chat_group['cover_url'] = $chat_room['cover_url'];
                }

                $chat_group['room_data'] = $chat_room;
                if ($chat_group) {
                    if(!isset($_SESSION['last_loaded_users_count'])){
                        $_SESSION['last_loaded_users_count'] = 0;
                    }

                    $online_users_q = "";
                    if(is_null($chat_room['user_list_type']) or $chat_room['user_list_type'] == 0){
                        if(isset(SETTINGS['user_list_type'])){
                            $user_list_type = SETTINGS['user_list_type'];
                            $auth_roles = SETTINGS['user_list_auth_roles'];
                        }else{
                            $user_list_type = 0;
                            $auth_roles = "[]";
                        }
                    }else{
                        $user_list_type = $chat_room['user_list_type'];
                        $auth_roles = $chat_room['user_list_auth_roles'];
                    }

                    if(isset($user_list_type)){
                        if ($user_list_type == 2){
                            if($q_sql == ""){
                                $online_users_q = " AND ADDTIME( u.last_seen, 10 ) >= NOW() ";
                            }
                        }else if($user_list_type == 3){
                            if(isset($auth_roles)){
                                $auth_roles = json_decode($auth_roles);
                                $login_user_type = app('auth')->user()['user_type'];
                                if(in_array($login_user_type, array(1, 4))){
                                    $online_users_q = "";
                                }else if($chat_room['created_by'] == $loged_in_user_id and in_array('creator', $auth_roles)){
                                    $online_users_q = "";
                                }else if($chat_group['is_mod'] == 1 and in_array('rm_mod', $auth_roles)){
                                    $online_users_q = "";
                                }else{
                                    $user_type_q = '';
                                    $created_by_q = '';
                                    $rm_mod_q = '';
                                    if(in_array("creator", $auth_roles)){ //room creator
                                        $created_by_q = " cg.created_by = u.id";
                                        $auth_roles = array_diff($auth_roles, ["creator"]);
                                    }

                                    if(in_array("rm_mod", $auth_roles)){ //room creator
                                        $rm_mod_q = " g.is_mod = 1";
                                        $auth_roles = array_diff($auth_roles, ["rm_mod"]);
                                    }

                                    if(count($auth_roles) > 0){
                                        $auth_role_list = "'". implode("', '", $auth_roles) ."'";
                                        $user_type_q = " u.user_type IN ($auth_role_list) ";
                                    }
                                    
                                    if($created_by_q && $user_type_q && $rm_mod_q){
                                        $online_users_q = ' AND ('.$created_by_q . ' OR '.$user_type_q.' OR '.$rm_mod_q.')';
                                    }else if($created_by_q && $user_type_q){
                                        $online_users_q = ' AND ('.$created_by_q . ' OR '.$user_type_q.')';
                                    }else if($created_by_q && $rm_mod_q){
                                        $online_users_q = ' AND ('.$created_by_q . ' OR '.$rm_mod_q.')';
                                    }else if($user_type_q && $rm_mod_q){
                                        $online_users_q = ' AND ('.$user_type_q . ' OR '.$rm_mod_q.')';
                                    }else if($created_by_q){
                                        $online_users_q = ' AND '.$created_by_q;
                                    }else if($user_type_q){
                                        $online_users_q = ' AND '.$user_type_q;
                                    }
                                }
                            }
                           
                        }else if($user_list_type == 4){
                            $online_users_q = ' AND cm.last_chat_id IS NOT NULL';
                        }
                    }
                    

                    $sql = "SELECT
                        g.chat_group as group_id,
                        u.id as user_id, u.user_name, u.first_name, u.last_name, u.last_seen, IF(ADDTIME(u.last_seen, 10) >= NOW(), 1,0) as online_status, u.avatar, u.user_status, u.timezone, u.country, u.sex, u.user_type,
                        IFNULL(cm.unread_count, 0) as unread_count, IFNULL(cm.is_blocked, 0) as blocked_by_him, IFNULL(cmr.is_favourite, 0) as is_favourite, IFNULL(cmr.is_muted, 0) as is_muted,  
                        IFNULL(cmr.is_blocked, 0) as blocked_by_you,
                        IFNULL(c.message, 0) as last_message, IFNULL(c.type, 0) as last_message_type, IFNULL(c.time, 0) as last_message_time, IFNULL(c.status, 0) as last_message_status, g.is_mod
                    FROM
                        cn_group_users g
                    LEFT JOIN cn_users u ON
                        g.user = u.id
                    LEFT JOIN cn_chat_groups cg ON
                        cg.id = g.chat_group
                    LEFT JOIN cn_private_chat_meta cm ON
                        g.user = cm.from_user AND cm.to_user = ? AND cm.id = (
                            SELECT MIN(cms.id)
                            FROM cn_private_chat_meta cms
                            WHERE u.id = cms.from_user AND cms.to_user = $loged_in_user_id
                        )
                    LEFT JOIN cn_private_chat_meta cmr ON
                        g.user = cmr.to_user AND cmr.from_user = ? AND cmr.id = (
                            SELECT MIN(cmrs.id)
                            FROM cn_private_chat_meta cmrs
                            WHERE u.id = cmrs.to_user AND cmrs.from_user = $loged_in_user_id
                        )
                    LEFT JOIN (
                    SELECT id, message, type, user_1, user_2, time, status
                    FROM cn_private_chats
                    ) c ON c.id = cm.last_chat_id AND IF(cmr.load_chats_from, c.time >= cmr.load_chats_from, 1)
                    WHERE
                        g.chat_group = ? AND
                        IF(u.user_type = 3, ADDTIME( u.last_seen, 10 ) >= NOW() , 1) AND
                        u.id != ? AND 
                        u.available_status = 1
                    " . $online_users_q . "
                    " . $q_sql . "
                    ORDER BY
                        blocked_by_him ASC,
                        blocked_by_you ASC,
                        online_status DESC,
                        cm.last_chat_id DESC,
                        u.last_seen DESC
                    LIMIT ".$_SESSION['last_loaded_users_count'].", 20";

                    $group_users = app('db')->rawQuery(
                        $sql, array(
                            $loged_in_user_id,
                            $loged_in_user_id,
                            $chat_group['id'],
                            $loged_in_user_id,
                        )
                    );

                    if(is_null($chat_room['disable_group_chats']) && isset(SETTINGS['disable_group_chats'])){
                        $disable_group_chats = SETTINGS['disable_group_chats'];
                    }else{
                        $disable_group_chats = $chat_room['disable_group_chats'];
                    }

                    if(isset($disable_group_chats) && $disable_group_chats == 0){
                        $data['default_group'] = $chat_group;
                    }
                    
                    $data['list'] = $group_users;
                }
            }else{
                $data = $this->get_active_list_guest_view($room_id);
            }
            return $data;
        }
    }

    function checkMyCall(){
        $my_user_id = app('auth')->user()['id'];
        $my_call = array();

        app('db')->where ('from_user', $my_user_id);
        app('db')->where ('in_call', 1);
        $in_call = app('db')->getOne('private_chat_meta');
        if($in_call){

            $call_data = $this->get_call_data($in_call['last_call_id']);
            if($call_data['status'] == 1 && $call_data['expired_call']){
                $call_data['status'] = 3;
                $this->hang_up_call($in_call['last_call_id']);
            }

            $my_call['in_call'] = 1;
            $my_call['im_calling'] = $in_call['im_calling'];
            $my_call['call_status'] = $call_data['status'];
            $my_call['call_id'] = $call_data['id'];

            if($in_call['im_calling'] === 0){
                app('db')->where ('id', $in_call['to_user']);
                $from_user = app('db')->getOne('users', "first_name, last_name, user_name, avatar");
                $my_call['from_user'] = $from_user;
            }
        }else{
            //check in_call status through from_user
            app('db')->where ('to_user', $my_user_id);
            app('db')->where ('in_call', 1);
            $in_call_to = app('db')->get('private_chat_meta');
            if($in_call_to){
                $call_data = $this->get_call_data($in_call_to['last_call_id']);
                if($call_data['status'] == 1 && $call_data['expired_call']){
                    $call_data['status'] = 3;
                    $this->hang_up_call($in_call_to['last_call_id']);
                }

                $my_call['in_call'] = 1;
                $my_call['im_calling'] = 0;
                $my_call['call_status'] = $call_data['status'];
                $my_call['call_id'] = $call_data['id'];
                
            }else{
                $my_call['in_call'] = 0;
                $my_call['im_calling'] = 0;
                $my_call['call_status'] = 3;
                $my_call['call_id'] = '';
            }
        }
        return $my_call;

    }

    function minutesToMySQLInterval($minutes) {
        // Ensure $minutes is between 0 and 1380
        $minutes = max(0, min($minutes, 1380));
        
        // Convert total minutes into hours and minutes
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;
    
        // Format the time interval as HH:MM:SS for MySQL
        $timeInterval = sprintf("%02d:%02d:00", $hours, $mins);
    
        return $timeInterval;
    }

    function get_call_data($call_id){
        if(isset(SETTINGS['max_call_length']) && SETTINGS['max_call_length']){
            $max_call_length = SETTINGS['max_call_length'];
            $time_interval = $this->minutesToMySQLInterval($max_call_length);
            $call_length_q = "IF(ADDTIME(pc.answered_on, '$time_interval') < NOW(), 1,0) as call_length_exceeded"; 
        }else{
            $call_length_q = "0 as call_length_exceeded"; 
        }
        $call_q = "SELECT
                pc.*,
                IF(ADDTIME(pc.initiated_on, 59) < NOW(), 1,0) as expired_call,
                $call_length_q
        FROM
            cn_private_calls pc
        WHERE
            pc.id = ".$call_id;
        $call_data = app('db')->rawQueryOne($call_q);
        return $call_data;
    }


    function get_active_list_guest_view($room_id, $user_id=false, $q=false, $search_mode='users'){
        $data = array();
        $q_sql = "";
        
        app('db')->where ('id', $room_id);
        if ($chat_room = app('db')->getOne('chat_rooms')) {
            // Get room's default group
            app('db')->where ('slug', 'general');
            app('db')->where ('chat_room', $chat_room['id']);

            app('db')->where ('cg.slug', 'general');
            app('db')->where ('cg.chat_room', $chat_room['id']);
            $chat_group = app('db')->getOne("chat_groups cg", null, "cg.*");
            // create chat room cover image url
            if ($chat_room['cover_image']) {
                $chat_room['cover_url'] = MEDIA_URL."/chatrooms/".$chat_room['cover_image'];
            }else {
                $chat_room['cover_url'] = URL."static/img/group.png";
            }

            // create chat group cover image url
            if ($chat_group['cover_image']) {
                $chat_group['cover_url'] = MEDIA_URL."/chatgroups/".$chat_group['cover_image'];
            } else {
                $chat_group['cover_url'] = $chat_room['cover_url'];
            }

            $chat_group['room_data'] = $chat_room;
            $chat_group['is_mod'] = 0;
            if ($chat_group) {
                if(!isset($_SESSION['last_loaded_users_count'])){
                    $_SESSION['last_loaded_users_count'] = 0;
                }

                $online_users_q = "";
                if(is_null($chat_room['user_list_type']) or $chat_room['user_list_type'] == 0){
                    if(isset(SETTINGS['user_list_type'])){
                        $user_list_type = SETTINGS['user_list_type'];
                        $auth_roles = SETTINGS['user_list_auth_roles'];
                    }else{
                        $user_list_type = 0;
                        $auth_roles = "[]";
                    }
                }else{
                    $user_list_type = $chat_room['user_list_type'];
                    $auth_roles = $chat_room['user_list_auth_roles'];
                }

                if(isset($user_list_type)){
                    if ($user_list_type == 2){
                        if($q_sql == ""){
                            $online_users_q = " AND ADDTIME( u.last_seen, 10 ) >= NOW() ";
                        }
                    }else if($user_list_type == 3){
                        
                        if(isset($auth_roles)){
                            $auth_roles = json_decode($auth_roles);
                            $login_user_type = app('auth')->user()['user_type'];
                            if(in_array($login_user_type, array(1, 4))){
                                $online_users_q = "";
                            }else if($chat_group['is_mod'] == 1 and in_array('rm_mod', $auth_roles)){
                                $online_users_q = "";
                            }else{
                                $user_type_q = '';
                                $created_by_q = '';
                                $rm_mod_q = '';
                                if(in_array("creator", $auth_roles)){ //room creator
                                    //$created_by_q = " cg.created_by = u.id";
                                    $auth_roles = array_diff($auth_roles, ["creator"]);
                                }

                                if(in_array("rm_mod", $auth_roles)){ //room creator
                                    $rm_mod_q = " g.is_mod = 1";
                                    $auth_roles = array_diff($auth_roles, ["rm_mod"]);
                                }

                                if(count($auth_roles) > 0){
                                    $auth_role_list = "'". implode("', '", $auth_roles) ."'";
                                    $user_type_q = " u.user_type IN ($auth_role_list) ";
                                }
                                
                                if($created_by_q && $user_type_q && $rm_mod_q){
                                    $online_users_q = ' AND ('.$created_by_q . ' OR '.$user_type_q.' OR '.$rm_mod_q.')';
                                }else if($created_by_q && $user_type_q){
                                    $online_users_q = ' AND ('.$created_by_q . ' OR '.$user_type_q.')';
                                }else if($created_by_q && $rm_mod_q){
                                    $online_users_q = ' AND ('.$created_by_q . ' OR '.$rm_mod_q.')';
                                }else if($user_type_q && $rm_mod_q){
                                    $online_users_q = ' AND ('.$user_type_q . ' OR '.$rm_mod_q.')';
                                }else if($created_by_q){
                                    $online_users_q = ' AND '.$created_by_q;
                                }else if($user_type_q){
                                    $online_users_q = ' AND '.$user_type_q;
                                }
                            }
                        }
                       
                    }else if($user_list_type == 4){
                        $online_users_q = ' AND u.user_type = 1';
                    }
                }

                $sql = "SELECT
                    g.chat_group as group_id,
                    u.id as user_id, u.user_name, u.first_name, u.last_name, u.last_seen, IF(ADDTIME(u.last_seen, 10) >= NOW(), 1,0) as online_status, u.avatar, u.user_status, u.timezone, u.country, u.sex, u.user_type, g.is_mod
                FROM
                    cn_group_users g
                LEFT JOIN cn_users u ON
                    g.user = u.id
                WHERE
                    IF(u.user_type = 3, ADDTIME( u.last_seen, 10 ) >= NOW() , 1) AND
                    g.chat_group = ".$chat_group['id']."
                " . $online_users_q . "
                ORDER BY
                    online_status DESC,
                    u.last_seen DESC
                LIMIT ".$_SESSION['last_loaded_users_count'].", 20";
                $group_users = app('db')->rawQuery($sql);

                if(is_null($chat_room['disable_group_chats']) && isset(SETTINGS['disable_group_chats'])){
                    $disable_group_chats = SETTINGS['disable_group_chats'];
                }else{
                    $disable_group_chats = $chat_room['disable_group_chats'];
                }

                if(isset($disable_group_chats) && $disable_group_chats == 0){
                    $data['default_group'] = $chat_group;
                }
                $data['list'] = $group_users;
            }
        }
        return $data;
    }

    // Get direct message users list
    function get_dm_users($user_id=false, $q=false){
        $data = array();
        $q_sql = "";
        if ($q) {
            $q_sql = " AND (u.first_name LIKE '%".$q."%' OR u.last_name LIKE '%".$q."%' )";
        }

        if($user_id){
            $loged_in_user_id = $user_id;
        }else{
            $loged_in_user_id = app('auth')->user()['id'];
        }

        if(!isset($_SESSION['last_loaded_dm_users_count'])){
            $_SESSION['last_loaded_dm_users_count'] = 0;
        }

        $sql = "SELECT
            '' as group_id,
            u.id as user_id, u.user_name, u.first_name, u.last_name, u.last_seen, IF(ADDTIME(u.last_seen, 10) >= NOW(), 1,0) as online_status, u.avatar, u.user_status, u.timezone, u.country, u.sex, u.user_type,
            IFNULL(cm.unread_count, 0) as unread_count, IFNULL(cm.is_blocked, 0) as blocked_by_him, IFNULL(cmr.is_favourite, 0) as is_favourite, IFNULL(cmr.is_muted, 0) as is_muted, IFNULL(cmr.is_blocked, 0) as blocked_by_you,
            IFNULL(c.message, 0) as last_message, IFNULL(c.type, 0) as last_message_type, IFNULL(c.time, 0) as last_message_time, IFNULL(c.status, 0) as last_message_status
        FROM
            cn_users u
        LEFT JOIN cn_private_chat_meta cm ON
            u.id = cm.from_user AND cm.to_user = $loged_in_user_id AND cm.id = (
                SELECT MIN(cms.id)
                FROM cn_private_chat_meta cms
                WHERE u.id = cms.from_user AND cms.to_user = $loged_in_user_id
            )
        LEFT JOIN cn_private_chat_meta cmr ON
            u.id = cmr.to_user AND cmr.from_user = $loged_in_user_id AND cmr.id = (
                SELECT MIN(cmrs.id)
                FROM cn_private_chat_meta cmrs
                WHERE u.id = cmrs.to_user AND cmrs.from_user = $loged_in_user_id
            )
        LEFT JOIN (
           SELECT id, message, type, user_1, user_2, time, status
           FROM cn_private_chats
        ) c ON c.id = cm.last_chat_id
        WHERE
            u.id != $loged_in_user_id
            AND cm.last_chat_id IS NOT NULL
            $q_sql
        ORDER BY
            blocked_by_him ASC,
            blocked_by_you ASC,
            online_status DESC,
            cm.last_chat_id DESC,
            u.last_seen DESC
        LIMIT ".$_SESSION['last_loaded_dm_users_count'].", 20";
        // echo $sql;
        $dm_users = app('db')->rawQuery($sql);
        $data['dm_list'] = $dm_users;
        return $data;
    }

    // Get direct message users count
    function get_dm_users_count(){
        $data = array();
        $loged_in_user_id = app('auth')->user()['id'];

        $sql = "SELECT COUNT(u.id) as dm_count
        FROM
            cn_users u
        LEFT JOIN cn_private_chat_meta cm ON
            u.id = cm.from_user AND cm.to_user = $loged_in_user_id AND cm.id = (
                SELECT MIN(cms.id)
                FROM cn_private_chat_meta cms
                WHERE u.id = cms.from_user AND cms.to_user = $loged_in_user_id
            )
        WHERE
            u.id != $loged_in_user_id
            AND cm.last_chat_id IS NOT NULL";
        // echo $sql;
        $dm_users = app('db')->rawQueryOne($sql);
        return $dm_users['dm_count'];
    }

    // Update database once an user read a message
    function updateChatReadStatus($sender, $to_user=Null, $to_group=Null, $to_room=Null, $last_chat_id=Null){
        if($to_user){
            if($to_user > $sender) {
                $user_1 = $sender;
                $user_2 = $to_user;
            }else{
                $user_1 = $to_user;
                $user_2 = $sender;
            }


            //update chat interactions
            if ($last_chat_id) {
                app('db')->where ('id', $last_chat_id, ">");
            }
            app('db')->where ('user_1', $user_1);
            app('db')->where ('user_2', $user_2);
            app('db')->where ("sender_id != " . app('auth')->user()['id']);
            app('db')->where ('status', 1);
            $read_chats = app('db')->get('private_chats', null, 'id');
            if($read_chats){
                foreach ($read_chats as $read_chat) {
                    $chat_interaction = array();
                    $chat_interaction['chat_id'] = $read_chat['id'];
                    $chat_interaction['user_id'] = app('auth')->user()['id'];
                    $chat_interaction['chat_type'] = 1;
                    $chat_interaction['is_read'] = 1;
                    $chat_interaction['is_notified'] = 1;
                    $chat_interaction['read_at'] = app('db')->now();
                    $chat_interaction['notified_at'] = app('db')->now();
                    $this->updateChatInteraction($chat_interaction);
                }
            }

            if ($last_chat_id) {
                app('db')->where ('id', $last_chat_id, ">");
            }

            app('db')->where ('user_1', $user_1);
            app('db')->where ('user_2', $user_2);
            app('db')->where ("sender_id != " . app('auth')->user()['id']);
            app('db')->where ('status', 1);
            app('db')->update('private_chats', array('status' => 2, "updated_at" => app('db')->now()));

            //active user chat meta
            $to_user_chat_meta_data = $this->getChatMetaData($to_user, $sender, $to_room);
            $to_user_update_meta = array();
            $to_user_update_meta['chat_meta_id'] = $to_user_chat_meta_data['id'];
            $to_user_update_meta['unread_count'] = 0;
            $this->updateChatMetaData($to_user_update_meta);

            return true;
        }else{

            //update chat interactions
            if ($last_chat_id) {
                app('db')->where ('id', $last_chat_id, ">");
            }
            app('db')->where ('group_id', $to_group);
            app('db')->where ("sender_id != " . app('auth')->user()['id']);
            app('db')->where ('status', 1);

            $read_chats = app('db')->get('group_chats', null, 'id');
            if($read_chats){
                foreach ($read_chats as $read_chat) {
                    $chat_interaction = array();
                    $chat_interaction['chat_id'] = $read_chat['id'];
                    $chat_interaction['user_id'] = app('auth')->user()['id'];
                    $chat_interaction['chat_type'] = 2;
                    $chat_interaction['is_read'] = 1;
                    $chat_interaction['read_at'] = app('db')->now();
                    $this->updateChatInteraction($chat_interaction);
                }
            }

            if ($last_chat_id) {
                app('db')->where ('id', $last_chat_id, ">");
            }

            app('db')->where ('group_id', $to_group);
            app('db')->where ("sender_id != " . app('auth')->user()['id']);
            app('db')->where ('status', 1);
            app('db')->update('group_chats', array('status' => 2, "updated_at" => app('db')->now()));

            $group_chat_meta = $this->getGroupChatMetaData(app('auth')->user()['id'], $to_group);
            if($group_chat_meta){
                $update_meta = array();
                $update_meta['chat_meta_id'] = $group_chat_meta['id'];
                $update_meta['unread_count'] = 0;
                $this->updateGroupChatMetaData($update_meta);
            }
            return true;
        }
    }

    function getChatInteraction($chat_id, $user_id, $chat_type){
        app('db')->where ('chat_id', $chat_id );
        app('db')->where ('user_id', $user_id);
        app('db')->where ('chat_type', $chat_type);
        $chat_interactions = app('db')->getOne('chat_interactions');
        if ($chat_interactions) {
            return $chat_interactions;
        }else{
            return false;
        }
    }

    function updateChatInteraction($chat_interaction){
        if (array_key_exists('id', $chat_interaction)) {
            app('db')->where ('id', $chat_interaction['id']);
            app('db')->update('chat_interactions', $chat_interaction);
            $interaction_id = $chat_interaction['id'];
        }else{
            $exist_chat_interactions = $this->getChatInteraction($chat_interaction['chat_id'], $chat_interaction['user_id'], $chat_interaction['chat_type']);
            if ($exist_chat_interactions) {
                app('db')->where ('id', $exist_chat_interactions['id']);
                app('db')->update('chat_interactions', $chat_interaction);
                $interaction_id = $exist_chat_interactions['id'];
            }else{
                $interaction_id = app('db')->insert('chat_interactions', $chat_interaction);
            }
        }

        //update main chat table latest update time
        if (array_key_exists('chat_type', $chat_interaction) and array_key_exists('chat_id', $chat_interaction)) {
            if($chat_interaction['chat_type'] == 1){
                app('db')->where ('id', $chat_interaction['chat_id']);
                app('db')->update('private_chats', array("updated_at" => app('db')->now()));
            }else{
                app('db')->where ('id', $chat_interaction['chat_id']);
                app('db')->update('group_chats', array("updated_at" => app('db')->now()));
            }
        }
        return $interaction_id;

    }

    // get last updated time for a conversation
    function getLastUpdatedTime($sender, $to_user=Null, $to_group=Null, $to_room=Null){
        if($to_user){
            if($to_user > $sender) {
                $user_1 = $sender;
                $user_2 = $to_user;
            }else{
                $user_1 = $to_user;
                $user_2 = $sender;
            }

            app('db')->where ('user_1', $user_1);
            app('db')->where ('user_2', $user_2);
            app('db')->where ('room_id', $to_room);
            app('db')->orderBy("updated_at","desc");
            $updated_chats = app('db')->getValue('private_chats', "updated_at", 1);
            if ($updated_chats) {
                return $updated_chats;
            }else{
                return 0;
            }

        }else{
            app('db')->where ('group_id', $to_group);
            app('db')->orderBy("updated_at","desc");
            $updated_chats = app('db')->getValue('group_chats', "updated_at", 1);
            if ($updated_chats) {
                return $updated_chats;
            }else{
                return 0;
            }
        }
    }

    // Get recenly shared photos or files with a particular user or group
    function getSharedData($sender, $data_type, $count, $to_user=Null, $to_group=Null, $to_room=Null){

        if (!is_array($count)) {
            $count = Array(0, $count);
        }

        if($to_user){
            if($to_user > $sender) {
                $user_1 = $sender;
                $user_2 = $to_user;
            }else{
                $user_1 = $to_user;
                $user_2 = $sender;
            }

            app('db')->where ('user_1', $user_1);
            app('db')->where ('user_2', $user_2);
            app('db')->where ('room_id', $to_room);
            app('db')->where ('type', $data_type);
            app('db')->where ('status != 3');
            app('db')->orderBy("id","desc");
            $shared_image = app('db')->getValue('private_chats', "message", $count);
            if ($shared_image) {
                return $shared_image;
            }else{
                return 0;
            }

        }else{
            app('db')->where ('group_id', $to_group);
            app('db')->where ('type', $data_type);
            app('db')->where ('status != 3');
            app('db')->orderBy("id","desc");
            $shared_image = app('db')->getValue('group_chats', "message", $count);
            if ($shared_image) {
                return $shared_image;
            }else{
                return 0;
            }
        }
    }

    // Get extra information for private chats
    function getChatMetaData($from_user, $to_user, $to_room=false){
        app('db')->where ('from_user', $from_user);
        app('db')->where ('to_user', $to_user);
        $chat_meta_data = app('db')->getOne('private_chat_meta');
        if(!$chat_meta_data){
            $data = Array ("from_user" => $from_user,
                           "to_user" => $to_user,
                           "created_at" => app('db')->now(),
                           "updated_at" => app('db')->now(),
                        );
            $chat_meta_id = app('db')->insert('private_chat_meta', $data);
            app('db')->where('id', $chat_meta_id);
            $chat_meta_data = app('db')->getOne('private_chat_meta');
        }
        return $chat_meta_data;
    }

    // Get extra information for group chats
    function getGroupChatMetaData($from_user, $to_group){
        app('db')->where ('user', $from_user);
        app('db')->where ('chat_group', $to_group);
        $chat_meta_data = app('db')->getOne('group_users');
        if(!$chat_meta_data){
            $chat_meta_data = False;
        }
        return $chat_meta_data;
    }

    // Update extra information for private chats
    function updateChatMetaData($meta_data){
        if (array_key_exists('chat_meta_id', $meta_data)) {
            $update_data = array();
            $update_data['updated_at'] = app('db')->now();
            if (array_key_exists('last_chat_id', $meta_data)) {
                $update_data['last_chat_id'] = $meta_data['last_chat_id'];
            }

            if (array_key_exists('unread_count', $meta_data)) {
                $update_data['unread_count'] = $meta_data['unread_count'];
            }

            if (array_key_exists('is_typing', $meta_data)) {
                $update_data['is_typing'] = $meta_data['is_typing'];
            }

            if (array_key_exists('is_blocked', $meta_data)) {
                $update_data['is_blocked'] = $meta_data['is_blocked'];
            }

            if (array_key_exists('is_favourite', $meta_data)) {
                $update_data['is_favourite'] = $meta_data['is_favourite'];
            }

            if (array_key_exists('is_muted', $meta_data)) {
                $update_data['is_muted'] = $meta_data['is_muted'];
            }

            if (array_key_exists('is_muted', $meta_data)) {
                $update_data['is_muted'] = $meta_data['is_muted'];
            }

            if (array_key_exists('load_chats_from', $meta_data)){
                $update_data['load_chats_from'] = $meta_data['load_chats_from'];
            }

            if (array_key_exists('last_call_id', $meta_data)) {
                $update_data['last_call_id'] = $meta_data['last_call_id'];
            }

            if (array_key_exists('in_call', $meta_data)) {
                $update_data['in_call'] = $meta_data['in_call'];
            }

            if (array_key_exists('im_calling', $meta_data)) {
                $update_data['im_calling'] = $meta_data['im_calling'];
            }


            app('db')->where ('id', $meta_data['chat_meta_id']);
            app('db')->update('private_chat_meta', $update_data);
        }
    }

    // Update extra information for group chats
    function updateGroupChatMetaData($meta_data){
        if (array_key_exists('chat_meta_id', $meta_data)) {
            $update_data = array();
            $update_data['updated_at'] = app('db')->now();

            if (array_key_exists('unread_count', $meta_data)) {
                $update_data['unread_count'] = $meta_data['unread_count'];
            }

            if (array_key_exists('is_typing', $meta_data)) {
                $update_data['is_typing'] = $meta_data['is_typing'];
            }

            if (array_key_exists('is_muted', $meta_data)) {
                $update_data['is_muted'] = $meta_data['is_muted'];
            }

            if (array_key_exists('load_chats_from', $meta_data)) {
                $update_data['load_chats_from'] = $meta_data['load_chats_from'];
            }

            app('db')->where ('id', $meta_data['chat_meta_id']);
            app('db')->update('group_users', $update_data);
        }
    }

    // Get typing stateses
    function getGroupChatTypingUsers($sender, $active_group, $active_room){
        app('db')->where('gu.chat_group', $active_group);
        app('db')->where('gu.user != ' . $sender);

        app('db')->where ("ADDTIME(u.last_seen, '0:2:0') >= NOW()");
        app('db')->where('gu.is_typing', 1);
        app('db')->join("users u", "u.id=gu.user", "LEFT");

        $private_usersQ = app('db')->subQuery("pc");
        $private_usersQ->where('from_user', $sender);
        $private_usersQ->get("private_chat_meta");

        $private_minQ = '(
            SELECT MIN(cms.id)
            FROM cn_private_chat_meta cms
            WHERE cms.to_user = u.id AND cms.from_user = '.$sender.'
        )';

        app('db')->join($private_usersQ, "pc.to_user=u.id", "LEFT");
        app('db')->where ("pc.id = $private_minQ");
        app('db')->orderBy("pc.is_favourite","desc");
        $group_users = app('db')->get("group_users gu", null, "gu.*, u.user_name, u.first_name, u.last_name, pc.is_favourite");
        return $group_users;

    }

    // Get group chat info
    function getGroupChats($group, $chat_room, $chat_id=false, $direction='up'){
        app('db')->where ('chat_group', $group);
        app('db')->where ('user', app('auth')->user()['id']);
        $group_user_data = app('db')->getOne('group_users');
        $loged_in_user_id = app('auth')->user()['id'];

        if ($chat_id) { // when chat search
            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.group_id', $group);
            app('db')->where ('c.room_id', $chat_room);
            app('db')->where ('c.id <= ' . $chat_id);
            app('db')->join("chat_interactions ci", "ci.chat_id=c.id AND ci.chat_type=2 AND ci.user_id = ".$loged_in_user_id, "LEFT");
            if (isset(SETTINGS['chat_load_type']) && SETTINGS['chat_load_type'] == 2){
                if(isset($group_user_data)){
                    if($group_user_data['load_chats_from']){
                        $chat_from = $group_user_data['load_chats_from'];
                    }else{
                        $chat_from = $group_user_data['created_at'];
                    }
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
            app('db')->orderBy('c.time','desc');
            $chats1 = app('db')->get('group_chats c', array(0,10), 'c.*, u.user_name, u.first_name, u.last_name, 
                u.avatar, u.user_type, \'group\' as chat_type, ci.reaction as my_reaction');
            if ($chats1) {
                $_SESSION['last_loaded_up'] = (end($chats1)['id']?end($chats1)['id']:0);
            }


            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.group_id', $group);
            app('db')->where ('c.room_id', $chat_room);
            app('db')->where ('c.id > ' . $chat_id);
            app('db')->join("chat_interactions ci", "ci.chat_id=c.id AND ci.chat_type=2 AND ci.user_id = ".$loged_in_user_id, "LEFT");
            if (isset(SETTINGS['chat_load_type']) && SETTINGS['chat_load_type'] == 2){
                if(isset($group_user_data)){
                    if($group_user_data['load_chats_from']){
                        $chat_from = $group_user_data['load_chats_from'];
                    }else{
                        $chat_from = $group_user_data['created_at'];
                    }
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
            app('db')->orderBy('c.time','asc');
            $chats2 = app('db')->get('group_chats c', array(0,10), 'c.*, u.user_name, u.first_name, u.last_name, 
                u.avatar, u.user_type, \'group\' as chat_type, ci.reaction as my_reaction');
            if ($chats2) {
                $_SESSION['last_loaded_down'] = (end($chats2)['id']);
            }
            $chats = array_merge( array_reverse($chats1), $chats2);
            return $chats;
        }else{ // when load more and load chats
            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.group_id', $group);
            app('db')->where ('c.room_id', $chat_room);
            app('db')->join("chat_interactions ci", "ci.chat_id=c.id AND ci.chat_type=2 AND ci.user_id = ".$loged_in_user_id, "LEFT");
            if (isset(SETTINGS['chat_load_type']) && SETTINGS['chat_load_type'] == 2){
                if(isset($group_user_data)){
                    if($group_user_data['load_chats_from']){
                        $chat_from = $group_user_data['load_chats_from'];
                    }else{
                        $chat_from = $group_user_data['created_at'];
                    }
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
            if ($direction == 'up') {
                app('db')->orderBy('c.time','desc');
                if (isset($_SESSION['last_loaded_up']) && $_SESSION['last_loaded_up'] !== false) {
                    app('db')->where ('c.id < ' . $_SESSION['last_loaded_up']);
                }
            }else if($direction == 'down'){
                if (isset($_SESSION['last_loaded_down']) && $_SESSION['last_loaded_down'] !== false) {
                    app('db')->where ('c.id > ' . $_SESSION['last_loaded_down']);
                }
                app('db')->orderBy('c.time','asc');
            }
            $chats = app('db')->get('group_chats c', array(0,20), 'c.*, u.user_name, u.first_name, u.last_name, 
                u.avatar, u.user_type, \'group\' as chat_type, ci.reaction as my_reaction');
            // echo app('db')->getLastQuery();
            if ($chats) {
                if ($direction == 'up') {
                    $_SESSION['last_loaded_up'] = (end($chats)['id']?end($chats)['id']:0);
                }else if($direction == 'down'){
                    $_SESSION['last_loaded_down'] = (end($chats)['id']?end($chats)['id']:'(SELECT MAX(id) FROM `cn_group_chats`)');
                }
                $chats = array_reverse($chats);
            }
            return $chats;
        }

    }

    // Get a conversation between two users
    function getPrivateChats($user_1, $user_2, $chat_room, $chat_id=false, $direction='up', $load_chats_from=false){
        $loged_in_user_id = app('auth')->user()['id'];
        if ($chat_id) { // when chat search
            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.user_1', $user_1);
            app('db')->where ('c.user_2', $user_2);
            app('db')->where ('c.id <= ' . $chat_id);
            app('db')->join("chat_interactions ci", "ci.chat_id=c.id AND ci.chat_type=1 AND ci.user_id = ".$loged_in_user_id, "LEFT");
            if($load_chats_from){
                app('db')->where ('c.time >= "' . $load_chats_from .'"');
            }
            app('db')->orderBy('c.time','desc');
            $chats1 = app('db')->get('private_chats c', array(0,10), 'c.*, u.user_name, u.first_name, u.last_name, 
                u.avatar, u.user_type, \'private\' as chat_type, ci.reaction as my_reaction');
            $_SESSION['last_loaded_up'] = (end($chats1)['id']?end($chats1)['id']:0);

            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.user_1', $user_1);
            app('db')->where ('c.user_2', $user_2);
            app('db')->where ('c.id > ' . $chat_id);
            app('db')->join("chat_interactions ci", "ci.chat_id=c.id AND ci.chat_type=1 AND ci.user_id = ".$loged_in_user_id, "LEFT");
            if($load_chats_from){
                app('db')->where ('c.time >= "' . $load_chats_from .'"');
            }
            app('db')->orderBy('c.time','asc');
            $chats2 = app('db')->get('private_chats c', array(0,10), 'c.*, u.user_name, u.first_name, u.last_name, 
                u.avatar, u.user_type, \'private\' as chat_type, ci.reaction as my_reaction');
            $_SESSION['last_loaded_down'] = (end($chats2)['id']);

            $chats = array_merge( array_reverse($chats1), $chats2);
            return $chats;
        }else{ // when load more and load chats
            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.user_1', $user_1);
            app('db')->where ('c.user_2', $user_2);
            app('db')->join("chat_interactions ci", "ci.chat_id=c.id AND ci.chat_type=1 AND ci.user_id = ".$loged_in_user_id, "LEFT");

            if($load_chats_from){
                app('db')->where ('c.time >= "' . $load_chats_from .'"');
            }

            if ($direction == 'up') {
                app('db')->orderBy('c.id','desc'); //changed from time
                if (isset($_SESSION['last_loaded_up']) && $_SESSION['last_loaded_up'] !== false) {
                    app('db')->where ('c.id < ' . $_SESSION['last_loaded_up']);
                }
            }else if($direction == 'down'){
                if (isset($_SESSION['last_loaded_down']) && $_SESSION['last_loaded_down'] !== false) {
                    app('db')->where ('c.id > ' . $_SESSION['last_loaded_down']);
                }
                app('db')->orderBy('c.id','asc'); //changed from time
            }
            $chats = app('db')->get('private_chats c', array(0,20), 'c.*, u.user_name, u.first_name, u.last_name, 
                u.avatar, u.user_type, \'private\' as chat_type, ci.reaction as my_reaction');
            if ($chats) {
                if ($direction == 'up') {
                    $_SESSION['last_loaded_up'] = (end($chats)['id']?end($chats)['id']:0);
                }else if($direction == 'down'){
                    $_SESSION['last_loaded_down'] = (end($chats)['id']?end($chats)['id']:'(SELECT MAX(id) FROM `cn_private_chats`)');
                }
                $chats = array_reverse($chats);
            }
            return $chats;
        }
    }

    function getUnnotifiedChats(){ 
        if (app('auth')->isAuthenticated() == true){
            $logged_user = app('auth')->user()['id'];
            
            if(app('auth')->user()['last_login']){
                $chat_from = app('auth')->user()['last_login'];
            }else{
                $chat_from = date("Y-m-d H:i:s");
            }
            //$chat_from = date("Y-m-d H:i:s" , strtotime(date("Y-m-d H:i:s")) - SETTINGS['chat_receive_seconds']);

            $private_query =
            "SELECT
                c.id,
                c.time,
                c.message,
                c.type,
                c.sender_id,
                c.status,
                c.updated_at,
                u.user_name, u.first_name, u.last_name, u.avatar,
                '' AS room_name, '' AS room_id,
                'private' AS chat_type
            FROM
                cn_private_chats c
                LEFT JOIN cn_users u ON c.sender_id = u.id
                INNER JOIN cn_private_chat_meta cm ON c.sender_id = cm.to_user AND cm.from_user = $logged_user AND cm.id = (
                            SELECT MIN(cms.id)
                            FROM cn_private_chat_meta cms
                            WHERE c.sender_id = cms.to_user AND cms.from_user = $logged_user
                        )
            WHERE
                c.sender_id != $logged_user AND 
                (IF(c.user_1 = $logged_user, c.user_1 = $logged_user, c.user_2 = $logged_user)) AND
                c.time >= '$chat_from' AND 
                cm.is_muted = 0 AND 
                NOT EXISTS ( SELECT ci.chat_id FROM cn_chat_interactions ci WHERE ci.chat_id = c.id AND ci.chat_type = 1 AND ci.user_id = $logged_user ) AND
                c.status != 3";

            $room_query =
            "SELECT
                c.id,
                c.time,
                c.message,
                c.type,
                c.sender_id,
                c.status,
                c.updated_at,
                u.user_name, u.first_name, u.last_name, u.avatar,
                cr.name AS room_name, cr.id AS room_id,
                'group' AS chat_type
            FROM
                cn_group_chats c
                LEFT JOIN cn_users u ON c.sender_id = u.id
                LEFT JOIN cn_chat_rooms cr ON cr.id = c.room_id
                INNER JOIN cn_group_users gu ON gu.user = $logged_user AND gu.chat_group = c.group_id
            WHERE
                c.sender_id != $logged_user AND 
                c.time >= '$chat_from' AND 
                gu.is_muted = 0 AND 
                NOT EXISTS ( SELECT ci.chat_id FROM cn_chat_interactions ci WHERE ci.chat_id = c.id AND ci.chat_type = 2 AND ci.user_id = $logged_user ) AND
                c.status != 3";

            $query = "$private_query UNION $room_query ORDER BY time DESC";
            $unnotified_chats = app('db')->rawQuery($query);
            
            if($unnotified_chats){
                foreach($unnotified_chats as $key => $unnotified_chat){
                    if($unnotified_chat['chat_type'] == 'private'){
                        $chat_type = 1;
                    }else{
                        $chat_type = 2;
                    }
                    $chat_interaction = array();
                    
                    $chat_interaction['chat_id'] = $unnotified_chat['id'];
                    $chat_interaction['user_id'] = $logged_user;
                    $chat_interaction['chat_type'] = $chat_type;
                    $chat_interaction['is_notified'] = 1;
                    $chat_interaction['notified_at'] = app('db')->now();
                    $this->updateChatInteraction($chat_interaction);
                    if (!empty($unnotified_chat['room_name'])) {
                        $room_name_add = " &blacktriangleright; ".$unnotified_chat['room_name'];
                    }else{
                        $room_name_add = "";
                    }
                    if (SETTINGS['display_name_format']=='username') {
                        $unnotified_chats[$key]['display_name'] = $unnotified_chat['user_name'].$room_name_add;
                    }else{
                        $unnotified_chats[$key]['display_name'] = $unnotified_chat['first_name'] . " " .$unnotified_chat['last_name'].$room_name_add;
                    }

                }
            }

            return $unnotified_chats;
        }

    }

    function getChatButtonCount(){
        $chat_button_count = 0;
        if (isset(SETTINGS['enable_gif'])){
            if(SETTINGS['enable_gif'] == 1){
                $chat_button_count += 1;
            }
        }else{
            $chat_button_count += 1;
        }

        if (isset(SETTINGS['enable_stickers'])){
            if(SETTINGS['enable_stickers'] == 1){
                $chat_button_count += 1;
            }
        }else{
            $chat_button_count += 1;
        }

        if (isset(SETTINGS['enable_files'])){
            if(SETTINGS['enable_files'] == 1){
                $chat_button_count += 1;
            }
        }else{
            $chat_button_count += 1;
        }

        return $chat_button_count;
    }

    function humanFileSize($size, $unit="") {
        if( (!$unit && $size >= 1<<30) || $unit == "GB"){
            return number_format($size/(1<<30),2)."GB";
        }else if( (!$unit && $size >= 1<<20) || $unit == "MB"){
            return number_format($size/(1<<20),2)."MB";
        }else if( (!$unit && $size >= 1<<10) || $unit == "KB"){
            return number_format($size/(1<<10),2)."KB";
        }else{
            return number_format($size)." bytes";
        }
    }

    // search group chats
    function searchGroupChats($group, $chat_room, $q){
        app('db')->where ('chat_group', $group);
        app('db')->where ('user', app('auth')->user()['id']);
        $group_user_data = app('db')->getOne('group_users');

        app('db')->join("users u", "c.sender_id=u.id", "LEFT");
        app('db')->where ('c.group_id', $group);
        app('db')->where ('c.room_id', $chat_room);
        app('db')->where ('c.status != 3');
        app('db')->where ("c.message", '%'.$q.'%', 'like');
        if (isset(SETTINGS['chat_load_type']) && SETTINGS['chat_load_type'] == 2){
            if($group_user_data['load_chats_from']){
                $chat_from = $group_user_data['load_chats_from'];
            }else{
                $chat_from = $group_user_data['created_at'];
            }
            app('db')->where ('c.time >= "' . $chat_from .'"');
        }else if(isset(SETTINGS['chat_load_type']) && SETTINGS['chat_load_type'] == 3){
            if($group_user_data['load_chats_from']){
                $chat_from = $group_user_data['load_chats_from'];
            }else if(app('auth')->user()['last_login']){
                $chat_from = app('auth')->user()['last_login'];
            }else{
                $chat_from = date("Y-m-d H:i:s");
            }
            app('db')->where ('c.time >= "' . $chat_from .'"');
        }else{
            if($group_user_data['load_chats_from']){
                $chat_from = $group_user_data['load_chats_from'];
                app('db')->where ('c.time >= "' . $chat_from .'"');
            }
        }
        app('db')->orderBy('c.time','desc');
        $chats = app('db')->get('group_chats c', array(0,200), 'c.*, u.user_name, u.first_name, u.last_name, u.avatar, \'group\' as chat_type');
        //echo app('db')->getLastQuery();
        $chats = array_reverse($chats);
        return $chats;
    }

    // search private chats
    function searchPrivateChats($user_1, $user_2, $chat_room, $q, $load_chats_from=false){
        app('db')->join("users u", "c.sender_id=u.id", "LEFT");
        app('db')->where ('c.user_1', $user_1);
        app('db')->where ('c.user_2', $user_2);
        app('db')->where ('c.room_id', $chat_room);
        app('db')->where ('c.status != 3');
        app('db')->where ("c.message", '%'.$q.'%', 'like');
        if($load_chats_from){
            app('db')->where ('c.time >= "' . $load_chats_from .'"');
        }
        app('db')->orderBy('c.time','desc');
        $chats = app('db')->get('private_chats c', array(0,200), 'c.*, u.user_name, u.first_name, u.last_name, u.avatar, \'private\' as chat_type');
        $chats = array_reverse($chats);
        return $chats;
    }

    function getChatRooms($q=false){
        app('db')->join("chat_rooms cr", "cr.id=cg.chat_room", "LEFT");
        app('db')->join("group_users gu", "gu.chat_group=cg.id", "INNER");
        app('db')->join("group_users gui", "gui.chat_group=cg.id AND gui.status=1 AND gui.user=".app('auth')->user()['id'], "LEFT");
        app('db')->where ('cg.slug', 'general');
        app('db')->where ('cr.status', 1);
        app('db')->where ('IF(gui.id, cr.is_visible IN (0,1), cr.is_visible = 1)');
        if($q != ""){
            app('db')->where ("cr.name", '%'.$q.'%', 'like');
        }

        app('db')->groupBy ('gu.chat_group, cr.id, gui.id');

        app('db')->orderBy ('users_count', 'DESC');

        $chat_rooms = app('db')->get('chat_groups cg', NULL, 'cr.id, cr.name, cr.description, cr.cover_image, cr.is_protected, cr.password, cr.is_visible, cr.slug, cr.allowed_users, cr.status, cr.created_by, cr.allow_guest_view, COUNT(gu.id) as users_count, gui.id as is_joined, gui.unread_count');
        return $chat_rooms;
    }

    function getChatRoomsUnread(){
        app('db')->join("chat_groups cg", "cg.id=gui.chat_group", "LEFT");
        app('db')->join("chat_rooms cr", "cr.id=cg.chat_room", "LEFT");
        app('db')->where ('cg.slug', 'general');
        app('db')->where ('cr.status', 1);
        app('db')->where ('gui.status', 1);
        app('db')->where ('gui.user', app('auth')->user()['id']);

        $chat_rooms = app('db')->getOne('group_users gui', 'SUM(gui.unread_count) as unread_total');
        return $chat_rooms['unread_total'];
    }

    function unlink_files($message, $type){
        if($type == 2){
            foreach (json_decode($message) as $image) {
                if (file_exists('media/chats/images/large/'.$image)) {
                    unlink('media/chats/images/large/'.$image);
                }
                if (file_exists('media/chats/images/medium/'.$image)) {
                    unlink('media/chats/images/medium/'.$image);
                }
                if (file_exists('media/chats/images/thumb/'.$image)) {
                    unlink('media/chats/images/thumb/'.$image);
                }
            }
        }else if($type == 6){
            foreach (json_decode($message, True) as $file) {
                if (file_exists('media/chats/files/'.$file['name'])) {
                    unlink('media/chats/files/'.$file['name']);
                }
            }
        }else if($type == 7){
            $audio_file = json_decode($message, True);
            if (file_exists('media/chats/audio/'.$audio_file['name'])) {
                unlink('media/chats/audio/'.$audio_file['name']);
            }
        }else if($type == 8){
            $reply_message = json_decode($message, True);
            $type = $reply_message['new_message']['new_type'];
            $message = $reply_message['new_message']['new_content'];
            $this->unlink_files($message, $type);
        }
    }

    function chatUserAccessCheck($active_user, $active_room){
        $loged_in_user_id = app('auth')->user()['id'];
        app('db')->where ('id', $loged_in_user_id );
        $user = app('db')->getOne('users');
        if($user){
            $private_min_pc_Q = '(
                SELECT MIN(cms.id)
                FROM cn_private_chat_meta cms
                WHERE cms.to_user = '.$active_user.' AND cms.from_user = '.app('auth')->user()['id'].'
            )';

            $private_min_pcr_Q = '(
                SELECT MIN(cms.id)
                FROM cn_private_chat_meta cms
                WHERE cms.from_user = '.$active_user.' AND cms.to_user = '.app('auth')->user()['id'].'
            )';

            app('db')->join("private_chat_meta pcr", "pcr.to_user=pc.from_user AND pcr.id = $private_min_pcr_Q AND pcr.from_user=".$active_user, "LEFT");
            app('db')->where('pc.to_user', $active_user);
            app('db')->where("pc.id = $private_min_pc_Q");
            app('db')->where('pc.from_user', app('auth')->user()['id']);
            $cols = Array("pc.is_favourite, pc.is_muted, pc.is_blocked as blocked_by_you, pcr.is_blocked as blocked_by_him");
            $access_data = app('db')->getOne('private_chat_meta pc', $cols);

            app('db')->where('id', $active_user);
            $available_data = app('db')->getOne('users', 'available_status');
            $access_data['available_status'] = $available_data['available_status'];
            return $access_data;
        }else{
            return array('user_deleted' => true);
        }
    }

    function chatRoomAccessCheck($chat_group, $user_id=false){
        if($user_id){
            $loged_in_user_id = $user_id;
        }else{
            $loged_in_user_id = app('auth')->user()['id'];
        }

        app('db')->where ('user', $loged_in_user_id );
        app('db')->where ('chat_group', $chat_group);
        $group_user = app('db')->getOne('group_users');
        if($group_user && $group_user['status'] == 1){
            return array('room_access' => true);
        }else if($group_user && $group_user['status'] == 3){
            return array('room_access' => false);
        }else{
            if (app('auth')->isAuthenticated() == true ){
                // check user availability
                app('db')->where ('id', $loged_in_user_id );
                $user = app('db')->getOne('users');
                if($user){
                    app('db')->join("chat_rooms cr", "cr.id=cg.chat_room", "LEFT");
                    app('db')->where('cg.id', $chat_group);
                    $chat_room = app('db')->getOne('chat_groups cg');
                    if($chat_room && $chat_room['allow_guest_view']){
                        return array('room_access' => true);
                    }else{
                        return array('room_access' => false);
                    }
                }else{
                    return array('user_deleted' => true);
                }
            }else{
                return array('room_access' => true);
            }
        }
    }

    function markAllNotified(){
        if (app('auth')->isAuthenticated() == true ){
            $logged_user = app('auth')->user()['id'];
            if(isset(app('auth')->user()['last_login'])){
                $chat_from = app('auth')->user()['last_login'];
            }else{
                $chat_from = date("Y-m-d H:i:s");
            }

            $private_query =
            "SELECT
                c.id, c.time, 1 AS chat_type, ci.id as interaction_id
            FROM
                cn_private_chats c
                LEFT JOIN cn_chat_interactions ci ON ci.chat_id = c.id AND ci.chat_type = 1 AND ci.user_id = $logged_user
            WHERE
                c.sender_id != $logged_user AND 
                (c.user_1 = $logged_user OR c.user_2 = $logged_user) AND
                c.time >= '$chat_from' AND 
                (ci.is_notified	= 0 OR ci.is_notified IS NULL) AND 
                c.STATUS != 3";

            $room_query =
            "SELECT
                c.id, c.time, 2 AS chat_type, ci.id as interaction_id
            FROM
                cn_group_chats c
                LEFT JOIN cn_chat_interactions ci ON ci.chat_id = c.id AND ci.chat_type = 2 AND ci.user_id = $logged_user
            WHERE
                c.sender_id != $logged_user AND 
                c.time >= '$chat_from' AND 
                (ci.is_notified	= 0 OR ci.is_notified IS NULL) AND 
                c.STATUS != 3";

            $query = "$private_query UNION $room_query ORDER BY time DESC";
            $unnotified_chats = app('db')->rawQuery($query);

            if($unnotified_chats){
                foreach($unnotified_chats as $key => $unnotified_chat){
                    $chat_interaction = array();
                    if($unnotified_chat['interaction_id']){
                        $chat_interaction['id'] = $unnotified_chat['interaction_id'];
                    }
                    $chat_interaction['chat_id'] = $unnotified_chat['id'];
                    $chat_interaction['user_id'] = $logged_user;
                    $chat_interaction['chat_type'] = $unnotified_chat['chat_type'];
                    $chat_interaction['is_notified'] = 1;
                    $chat_interaction['notified_at'] = app('db')->now();
                    $this->updateChatInteraction($chat_interaction);
                    
                }
            }
        }
    }

    function get_unread_dm_total(){
        $loged_in_user_id = app('auth')->user()['id'];
        $sql = "SELECT 
                    SUM(unread_count) as unread_total 
                FROM 
                    cn_private_chat_meta
                WHERE
                    to_user = $loged_in_user_id ";
        $unread_total = app('db')->rawQueryOne($sql);
        return $unread_total['unread_total'];
    }

    function add_notification($type, $content, $user_id){
        $data = Array (
            "type" => $type,
            "content" => $content,
            "user_id" => $user_id,
            "is_read" => 0,
            "created_at" => app('db')->now(),
        );
        $id = app('db')->insert('notifications', $data);
    }

    function get_msg_reaction_data($msg_id, $chat_type){
        app('db')->join("users u", "ci.user_id=u.id", "LEFT");
        app('db')->where ('ci.chat_type', $chat_type);
        app('db')->where ('ci.chat_id', $msg_id);
        app('db')->where ('ci.reaction != 0');
        app('db')->orderBy('ci.reacted_at','desc');
        $msg_data = app('db')->get('chat_interactions ci', Null, 'ci.reaction, ci.reacted_at, u.user_name, u.first_name, u.last_name, u.avatar');
        return $msg_data;
    }

    function hang_up_call($call_id){
        $call_data = Array ();
        $call_data['ended_on'] = app('db')->now();
        $call_data['status'] = 3;
        app('db')->where ('id', $call_id);
        app('db')->update('private_calls', $call_data);

        $update_meta = Array ();
        $update_meta['in_call'] = 0;
        $update_meta['im_calling'] = 0;
        app('db')->where ('last_call_id', $call_id);
        app('db')->update('private_chat_meta', $update_meta);
        return true;
    }


}


?>
