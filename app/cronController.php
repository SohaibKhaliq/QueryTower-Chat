<?php
namespace App;

/* This class is handling all the requests in the cron*/

class cronController{

    function delete_guests() {
        if (SETTINGS['guest_inactive_hours'] > 0) {
            app('db')->where ('user_type', 3);
            app('db')->where ('last_seen <= (NOW() - interval '.SETTINGS['guest_inactive_hours'].' hour) OR last_seen IS NULL');
            $users = app('db')->get('users', null, 'id');
            foreach ($users as $user) {
                $delete_user = $user['id'];
                if (isset(SETTINGS['unlink_with_delete']) && SETTINGS['unlink_with_delete'] == true) {

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
        }
    }

    function delete_group_chats() {
        if (SETTINGS['delete_group_chat_hours'] > 0) {
            if (isset(SETTINGS['unlink_with_delete']) && SETTINGS['unlink_with_delete'] == true) {
                //unlink group chats files
                app('db')->where ('time <= (NOW() - interval '.SETTINGS['delete_group_chat_hours'].' hour)');
                app('db')->where('type', Array(2, 6, 7, 8), 'IN');
                $group_chats = app('db')->get('group_chats');
                foreach ($group_chats as $chat) {
                    app('chat')->unlink_files($chat['message'], $chat['type']);
                }
            }
            app('db')->where ('time <= (NOW() - interval '.SETTINGS['delete_group_chat_hours'].' hour)');
            app('db')->delete('group_chats');
        }
    }

    function delete_private_chats() {
        if (SETTINGS['delete_private_chat_hours'] > 0) {
            if (isset(SETTINGS['unlink_with_delete']) && SETTINGS['unlink_with_delete'] == true) {
                //unlink group chats files
                app('db')->where ('time <= (NOW() - interval '.SETTINGS['delete_private_chat_hours'].' hour)');
                app('db')->where('type', Array(2, 6, 7, 8), 'IN');
                $private_chats = app('db')->get('private_chats');
                foreach ($private_chats as $chat) {
                    app('chat')->unlink_files($chat['message'], $chat['type']);
                }
            }
            app('db')->where ('time <= (NOW() - interval '.SETTINGS['delete_private_chat_hours'].' hour)');
            app('db')->delete('private_chats');
        }
    }
}
