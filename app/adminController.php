<?php
namespace App;


class adminController{

    function __construct() {
        // Verify CSFR
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if(! app('csfr')->verifyToken(SECRET_KEY) ){
                header('HTTP/1.0 403 Forbidden');
                exit();
            }
        }

        if(app('auth')->isAuthenticated()){
            $logged_user = app('auth')->user(app('auth')->user()['id']);
            if($logged_user['user_type']!=1){
                header("Location: " . route('logout'));
            }
        }else{
            header("Location: " . route('login').'?next='. route('dashboard'));
        }
    }

    function check_user_type(){
        $logged_user = app('auth')->user(app('auth')->user()['id']);
        if($logged_user['user_type']!=1){
            return json_response(["success" => false], 200);
        }else{
            return json_response(["success" => true], 200);
        }
        
    }

    function index() {
        $data = array();
        $data['users_count'] = app('db')->getValue('users', 'count(*)');
        $data['chatroom_count'] = app('db')->getValue('chat_rooms', 'count(id)');
        $data['private_chats_count'] = app('db')->getValue('private_chats', 'count(id)');
        $data['group_chats_count'] = app('db')->getValue('group_chats', 'count(id)');

        app('db')->orderBy("id","desc");
        $chat_rooms_list = app('db')->get('chat_rooms', array(0,10));
        $chat_rooms = array();
        foreach ($chat_rooms_list as $chat_room) {
            app('db')->join("chat_groups cg", "cg.id=gu.chat_group", "LEFT");
            app('db')->where ('cg.chat_room', $chat_room['id']);
            app('db')->where ('cg.slug', 'general');
            app('db')->get('group_users gu', null, 'gu.*');
            $chat_room['users_count'] = app('db')->count;
            array_push($chat_rooms, $chat_room);
        }
        $data['latest_rooms'] = $chat_rooms;

        app('db')->where ('user_type', Array(1, 2), 'IN');
        app('db')->orderBy("id","desc");
        $user_list = app('db')->get('users', array(0,10));
        $users = array();
        foreach ($user_list as $each_user) {
            $each_user['avatar_url'] = getUserAvatarURL($each_user);
            array_push($users, $each_user);
        }
        $data['latest_users'] = $users;
        $data['lang_list'] = app('db')->get('languages');

        echo app('twig')->render('admin/index.html', $data);
    }

    function general() {
        $data = array();
        app('db')->where ('status', 1);
        app('db')->where ('is_visible', 1);
        $data['chatroom_list'] = app('db')->get('chat_rooms');
        $data['lang_list'] = app('db')->get('languages');
        $data['timezone_list'] = get_timezone_list(SETTINGS['timezone']);
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/general.html', $data);
    }

    function email() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/email.html', $data);
    }

    function timing() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/timing.html', $data);
    }

    function image() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/image.html', $data);
    }

    function color() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/color.html', $data);
    }

    function chatpage() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/chatpage.html', $data);
    }

    function homepage() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/homepage.html', $data);
    }

    function header() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/header.html', $data);
    }

    function footer() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/footer.html', $data);
    }

    function gif() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/gif.html', $data);
    }

    function policy() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/policy.html', $data);
    }

    function about() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/about.html', $data);
    }

    function contact() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/contact.html', $data);
    }

    function profanity(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/profanity.html', $data);
    }

    function notification() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/notification.html', $data);
    }

    function cloud_storage() {
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/cloud_storage.html', $data);
    }

    function pwa(){
        $data = array();
        $data['chatroom_list'] = app('db')->get('chat_rooms');
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/pwa.html', $data);
    }

    function chatroom_list() {
        $data = array();
        $chat_rooms_list = app('db')->get('chat_rooms');
        $chat_rooms = array();
        foreach ($chat_rooms_list as $chat_room) {
            app('db')->join("chat_groups cg", "cg.id=gu.chat_group", "LEFT");
            app('db')->where ('cg.chat_room', $chat_room['id']);
            app('db')->where ('cg.slug', 'general');
            app('db')->get('group_users gu', null, 'gu.*');
            $chat_room['users_count'] = app('db')->count;
            array_push($chat_rooms, $chat_room);
        }
        $data['chat_rooms'] = $chat_rooms;
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/chatroom_list.html', $data);
    }

    function chatroom_users(){
        $get_data = $_GET;
        $data = array();
        if (array_key_exists("room", $_GET)) {
            app('db')->where ('id', $get_data['room']);
            $chat_room = app('db')->getOne('chat_rooms');

            app('db')->where ('slug', 'general');
            app('db')->where ('chat_room', $get_data['room']);
            $chat_group = app('db')->getOne('chat_groups');

            app('db')->join("users u", "g.user=u.id", "LEFT");
            app('db')->where ('g.chat_group', $chat_group['id']);
            $group_users = app('db')->get('group_users g', null, 'g.*, u.*');
            $data['room_users'] = $group_users;
            $data['chat_room'] = $chat_room;
            $data['lang_list'] = app('db')->get('languages');
            echo app('twig')->render('admin/chatroom_users.html', $data);
        }
    }

    function chatroom_edit() {
        $get_data = $_GET;
        $data = array();
        if (array_key_exists("edit_room", $_GET)) {
            if($get_data['edit_room']){
                app('db')->where('id', $get_data['edit_room']);
                $room_data = app('db')->getOne('chat_rooms');
                $data['chat_room'] = $room_data;

                app('db')->where ('slug', 'general');
                app('db')->where ('chat_room', $get_data['edit_room']);
                $chat_group = app('db')->getOne('chat_groups');

                app('db')->join("users u", "g.user=u.id", "LEFT");
                app('db')->where ('g.chat_group', $chat_group['id']);
                $group_users = app('db')->get('group_users g', null, 'g.*, u.*');
                $data['room_users'] = $group_users;
            }
        }
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/chatroom_update.html', $data);
    }

    function user_list() {
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/user_list.html', $data);
    }

    function user_view() {
        $get_data = $_GET;
        if (array_key_exists("user", $_GET)) {
            if($get_data['user']){
                $user_data = app('auth')->user($get_data['user']);
                $sql = "SELECT
                    cr.name, cr.slug, cr.id, gu.created_at, gu.status as gu_status
                FROM
                    cn_chat_rooms cr, cn_chat_groups cg, cn_group_users gu
                WHERE
                    cg.chat_room = cr.id AND gu.chat_group=cg.id AND cg.slug='general' AND gu.user = ?";

                $user_data['user_rooms'] = app('db')->rawQuery(
                    $sql, array($user_data['id'])
                );
                $user_data['timezone_list'] = get_timezone_list($user_data['timezone']);
                $user_data['lang_list'] = app('db')->get('languages');
                include(BASE_PATH.'utils'.DS.'countries.php');
                $user_data['country_list'] = $countries;
                $user_data['system_badges'] = app('db')->get('badges');
                $user_data['user_badges'] = $user_data['badges'];
                echo app('twig')->render('admin/user_view.html', $user_data);
            }
        }
    }

    function user_add() {
        $user_data = array();
        $user_data['timezone_list'] = get_timezone_list();
        $user_data['lang_list'] = app('db')->get('languages');
        include(BASE_PATH.'utils'.DS.'countries.php');
        $user_data['country_list'] = $countries;
        echo app('twig')->render('admin/user_add.html', $user_data);

    }

    function user_list_data(){
        if(app('auth')->user()['user_type']==1){
            $post_data = $_POST;

            $draw = app('purify')->xss_clean($post_data['draw']);
            $row = app('purify')->xss_clean($post_data['start']);
            $row_per_page = app('purify')->xss_clean($post_data['length']); // Rows display per page
            $column_index = app('purify')->xss_clean($post_data['order'][0]['column']); // Column index
            $post_column_data = app('purify')->xss_clean($post_data['columns'][$column_index]['data']); // Column data
            $post_column_name = app('purify')->xss_clean($post_data['columns'][$column_index]['name']); // Column name
            if($post_column_name){
                $column_name = $post_column_name;
            }else if($post_column_data){
                $column_name = $post_column_data;
            }else{
                $column_name = 'id';
            }
            $column_sort_order = app('purify')->xss_clean($post_data['order'][0]['dir']); // asc or desc
            $search_value = app('purify')->xss_clean($post_data['search']['value']); // Search value

            ## Search
            $search_query = " ";
            if($search_value != ''){
                $search_query = " and (email like '%".$search_value."%' or
                    user_name like '%".$search_value."%' or first_name like '%".$search_value."%') ";
            }

            if (array_key_exists("user_type", $post_data)) {
                $user_type = app('purify')->xss_clean($post_data['user_type']);
                if($user_type != ""){
                    $search_query .= " AND user_type = '".$user_type."' ";
                }else{
                    $search_query .= " AND user_type IN (1, 2, 4)";
                }
            }

            if (array_key_exists("available_status", $post_data)) {
                $available_status = app('purify')->xss_clean($post_data['available_status']);
                if($available_status != ""){
                    $search_query .= " AND available_status = '".$available_status."' ";
                }
            }

            ## Total number of records without filtering
            $all_count_q = "SELECT COUNT(*) AS allcount FROM cn_users WHERE user_type IN (1, 2, 4)";
            $all_count_data = app('db')->rawQuery($all_count_q);
            $total_records = $all_count_data[0]['allcount'];

            ## Total number of record with filtering
            $all_filtered_count_q = "SELECT COUNT(*) as allcount FROM cn_users WHERE 1 ".$search_query;
            $all_filtered_count_data = app('db')->rawQuery($all_filtered_count_q);
            $total_filtered_records = $all_filtered_count_data[0]['allcount'];

            ## Fetch records
            $records_q = "SELECT * FROM cn_users WHERE 1 ".$search_query." order by ".$column_name." ".$column_sort_order." limit ".$row.",".$row_per_page;
            $all_data = app('db')->rawQuery($records_q);

            $return_data = array();
            foreach ($all_data as $key => $value) {
                $return_data[] = $value;
            }

            ## Response
            $response = array(
                "draw" => intval($draw),
                "iTotalRecords" => $total_records,
                "iTotalDisplayRecords" => $total_filtered_records,
                "aaData" => $return_data
            );
            echo json_encode($response);

        }else{
            header("Location: " . route('dashboard'));
        }
    }


    function guest_list() {
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/guest_list.html', $data);
    }

    function guest_list_data(){
        if(app('auth')->user()['user_type']==1){
            $post_data = $_POST;

            $draw = app('purify')->xss_clean($post_data['draw']);
            $row = app('purify')->xss_clean($post_data['start']);
            $row_per_page = app('purify')->xss_clean($post_data['length']); // Rows display per page
            $column_index = app('purify')->xss_clean($post_data['order'][0]['column']); // Column index
            $post_column_data = app('purify')->xss_clean($post_data['columns'][$column_index]['data']); // Column data
            $post_column_name = app('purify')->xss_clean($post_data['columns'][$column_index]['name']); // Column name
            if($post_column_name){
                $column_name = $post_column_name;
            }else if($post_column_data){
                $column_name = $post_column_data;
            }else{
                $column_name = 'id';
            }
            $column_sort_order = app('purify')->xss_clean($post_data['order'][0]['dir']); // asc or desc
            $search_value = app('purify')->xss_clean($post_data['search']['value']); // Search value

            ## Search
            $search_query = " ";
            if($search_value != ''){
                $search_query = " and (email like '%".$search_value."%' or
                    user_name like '%".$search_value."%' or first_name like '%".$search_value."%') ";
            }

            $search_query .= " AND user_type = 3";

            ## Total number of records without filtering
            $all_count_q = "SELECT COUNT(*) AS allcount FROM cn_users WHERE user_type = 3";
            $all_count_data = app('db')->rawQuery($all_count_q);
            $total_records = $all_count_data[0]['allcount'];

            ## Total number of record with filtering
            $all_filtered_count_q = "SELECT COUNT(*) as allcount FROM cn_users WHERE 1 ".$search_query;
            $all_filtered_count_data = app('db')->rawQuery($all_filtered_count_q);
            $total_filtered_records = $all_filtered_count_data[0]['allcount'];

            ## Fetch records
            $records_q = "SELECT * FROM cn_users WHERE 1 ".$search_query." order by ".$column_name." ".$column_sort_order." limit ".$row.",".$row_per_page;
            $all_data = app('db')->rawQuery($records_q);

            $return_data = array();
            foreach ($all_data as $key => $value) {
                $return_data[] = $value;
            }

            ## Response
            $response = array(
                "draw" => intval($draw),
                "iTotalRecords" => $total_records,
                "iTotalDisplayRecords" => $total_filtered_records,
                "aaData" => $return_data
            );
            echo json_encode($response);

        }else{
            header("Location: " . route('dashboard'));
        }
    }


    // load index admin_js file
    public function admin_js(){
        header("Content-Type: text/javascript");
        echo app('twig')->render('admin/js/admin.js');
    }

    // get chats for selected user or group
    public function load_chats(){
        $data = array();
        $post_data = app('request')->body;
        $_SESSION['last_loaded_count'] = 0;
        $from_user = $post_data['from_user'];
        if ($post_data['active_user']) {
            if($post_data['active_user'] > $from_user) {
                $user_1 = $from_user;
                $user_2 = $post_data['active_user'];
            }else{
                $user_1 = $post_data['active_user'];
                $user_2 = $from_user;
            }
            $chat_meta_data = app('chat')->getChatMetaData($from_user, $post_data['active_user'], $post_data['active_room']);
            $data['chat_meta_id'] = $chat_meta_data['id'];

            // get new messages
            $chats = app('chat')->getPrivateChats($user_1, $user_2, $post_data['active_room']);

        }else{
            $group_chat_meta_data = app('chat')->getGroupChatMetaData($from_user, $post_data['active_group'], $post_data['active_room']);
            if($group_chat_meta_data){
                $data['chat_meta_id'] = $group_chat_meta_data['id'];
            }else{
                $data['chat_meta_id'] = "";
            }

            // get new messages
            app('db')->join("users u", "c.sender_id=u.id", "LEFT");
            app('db')->where ('c.group_id', $post_data['active_group']);
            app('db')->where ('c.room_id', $post_data['active_room']);
            app('db')->where ('c.sender_id', $from_user);

            app('db')->orderBy('c.time','desc');
            $chats = app('db')->get('group_chats c', array($_SESSION['last_loaded_count'],20), 'c.*, u.first_name, u.last_name, u.avatar, \'group\' as chat_type');
            $chats = array_reverse($chats);
        }

        $data['chats'] = $chats;

        return json_response($data);
    }

    // load more chats when scrolling up
    public function load_more_chats(){
        $data = array();
        $post_data = app('request')->body;
        $_SESSION['last_loaded_count'] += 20;
        $from_user = $post_data['from_user'];
        if ($post_data['active_user']) {
            if($post_data['active_user'] > $from_user) {
                $user_1 = $from_user;
                $user_2 = $post_data['active_user'];
            }else{
                $user_1 = $post_data['active_user'];
                $user_2 = $from_user;
            }
            $data['chats'] = app('chat')->getPrivateChats($user_1, $user_2, $post_data['active_room']);
        }else{
            $data['chats'] = app('chat')->getGroupChats($post_data['active_group'], $post_data['active_room']);
        }
        $data['chats'] = array_reverse($data['chats']);
        return json_response($data);
    }

    // get language list
    function languages() {
        $languages = app('db')->get('languages');
        $data['languages'] = $languages;
        $data['lang_list'] = $languages;
        echo app('twig')->render('admin/languages.html', $data);
    }

    // edit language
    function language_edit() {
        $get_data = $_GET;
        $data = array();
        if (array_key_exists("lang", $_GET)) {
            if($get_data['lang']){
                app('db')->where('code', $get_data['lang']);
                $data['language'] = app('db')->getOne('languages');
                $data['edit_type_name'] = "Update";
                $data['edit_type'] = "update";
            }
        }else{
            $data['edit_type_name'] = "Add New";
            $data['edit_type'] = "add";
        }
        $data['lang_list'] = app('db')->get('languages');

        include(BASE_PATH.'utils'.DS.'languages.php');
        $data['language_code_list'] = $languages;

        include(BASE_PATH.'utils'.DS.'countries.php');
        $data['country_list'] = $countries;
        
        $string = file_get_contents(BASE_PATH."/utils/google_fonts.json");
        $data['google_font_list'] = json_decode($string, true);
        echo app('twig')->render('admin/language_view.html', $data);
    }

    // load language transition
    function language_translation() {
        $get_data = $_GET;
        $data = array();
        if(isset($get_data['lang']) && isset($get_data['section'])){
            app('db')->where('section', $get_data['section']);
            app('db')->join("translations tr", "tr.term_id=lt.id", "LEFT");
            app('db')->joinWhere('translations tr', 'tr.lang_code', $get_data['lang']);
            $data['lang_terms'] = app('db')->get('lang_terms lt', null, 'lt.term, lt.id as term_id, tr.translation');
            $data['selected_lang'] = $get_data['lang'];
            $data['languages'] = app('db')->get('languages');
            $data['selected_section'] = $get_data['section'];
        }
        
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/language_translation.html', $data);
    }

    // rebuild translation phrases
    public function rebuild_translate(){
        $data = array();
        $data['updated_terms'] = collect_update_terms();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/rebuild_translate.html', $data);
    }

    function registration_settings(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/registration_settings.html', $data);
    }

    function advertisements(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/advertisements.html', $data);
    }

    function social_login(){
        $data = array();
        $data['auth_providers'] = get_social_logins();
        $data['my_social_logins'] = app('db')->get('social_logins');
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/social_login.html', $data);
    }

    function radio(){
        $data = array();
        $data['radio_stations'] = app('db')->get('radio_stations');
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/radio_stations.html', $data);
    }

    function set_view_as(){
        if (isset($_GET['view_user'])) {
            app('db')->where('id', $_GET['view_user']);
            $user_data = app('db')->getOne('users');
            $user_data['avatar_url'] = getUserAvatarURL($user_data);
            $user_data['user_status_class'] = "";
            if ($user_data['user_status'] == 1) {
                $user_data['user_status_class'] = "online";
            } elseif ($user_data['user_status'] == 2) {
                $user_data['user_status_class'] = "offline";
            } elseif ($user_data['user_status'] == 3) {
                $user_data['user_status_class'] = "busy";
            } elseif ($user_data['user_status'] == 4) {
                $user_data['user_status_class'] = "away";
            }
            $_SESSION['view_user'] = $user_data;
        }
    }

    function maintenance(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/maintenance.html', $data);
    }

    function recaptcha(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/recaptcha.html', $data);
    }

    function ip_access(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/ip_access.html', $data);
    }

    function ip_logs(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/ip_logs.html', $data);
    }

    function ip_logs_data(){
        if(app('auth')->user()['user_type']==1){
            $post_data = $_POST;

            $draw = app('purify')->xss_clean($post_data['draw']);
            $row = app('purify')->xss_clean($post_data['start']);
            $row_per_page = app('purify')->xss_clean($post_data['length']); // Rows display per page
            $column_index = app('purify')->xss_clean($post_data['order'][0]['column']); // Column index
            $column_name = app('purify')->xss_clean($post_data['columns'][$column_index]['data']); // Column name
            $column_sort_order = app('purify')->xss_clean($post_data['order'][0]['dir']); // asc or desc
            $search_value = app('purify')->xss_clean($post_data['search']['value']); // Search value
            $table = 'cn_ip_logs';

            ## Search
            $search_query = " ";
            if($search_value != ''){
                $search_query = " and (email like '%".$search_value."%' or
                    ip like '%".$search_value."%' or message like '%".$search_value."%') ";
            }

            if (array_key_exists("log_type", $post_data)) {
                $search_type = app('purify')->xss_clean($post_data['log_type']);
                if($search_type != ""){
                    $search_query .= " AND type = '".$search_type."' ";
                }
            }

            ## Total number of records without filtering
            $all_count_q = "SELECT COUNT(*) AS allcount FROM cn_ip_logs";
            $all_count_data = app('db')->rawQuery($all_count_q);
            $total_records = $all_count_data[0]['allcount'];

            ## Total number of record with filtering
            $all_filtered_count_q = "SELECT COUNT(*) as allcount FROM cn_ip_logs WHERE 1 ".$search_query;
            $all_filtered_count_data = app('db')->rawQuery($all_filtered_count_q);
            $total_filtered_records = $all_filtered_count_data[0]['allcount'];

            ## Fetch records
            $records_q = "SELECT * FROM cn_ip_logs WHERE 1 ".$search_query." order by ".$column_name." ".$column_sort_order." limit ".$row.",".$row_per_page;
            $all_data = app('db')->rawQuery($records_q);

            $return_data = array();
            foreach ($all_data as $key => $value) {
                if($value['type'] == 1){
                    $log_type = "Login";
                }elseif ($value['type'] == 2) {
                    $log_type = "Register";
                }elseif ($value['type'] == 3) {
                    $log_type = "Password Resets";
                }elseif ($value['type'] == 4){
                    $log_type = "Logout";
                }else{
                    $log_type = "--";
                }

                $return_data[] = array(
                    "ip"=>$value['ip'],
                    "country"=>$value['country'],
                    "device"=>user_agent_string($value['user_agent']),
                    "email"=>$value['email'],
                    "time"=>$value['time'],
                    "type"=>$log_type,
                    "message"=>$value['message']
                );
            }

            ## Response
            $response = array(
                "draw" => intval($draw),
                "iTotalRecords" => $total_records,
                "iTotalDisplayRecords" => $total_filtered_records,
                "aaData" => $return_data
            );
            echo json_encode($response);

        }else{
            header("Location: " . route('dashboard'));
        }
    }

    function fonts(){
        $data = array();
        $string = file_get_contents(BASE_PATH."/utils/google_fonts.json");
        $data['google_font_list'] = json_decode($string, true);
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/fonts.html', $data);
    }

    function flaged_content(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/flaged_content.html', $data);
    }
    
    function flaged_content_data(){
        if(app('auth')->user()['user_type']==1){
            $post_data = $_POST;

            $draw = app('purify')->xss_clean($post_data['draw']);
            $row = app('purify')->xss_clean($post_data['start']);
            $row_per_page = app('purify')->xss_clean($post_data['length']); // Rows display per page
            $column_index = app('purify')->xss_clean($post_data['order'][0]['column']); // Column index
            $column_name = app('purify')->xss_clean($post_data['columns'][$column_index]['data']); // Column name
            $column_sort_order = app('purify')->xss_clean($post_data['order'][0]['dir']); // asc or desc
            $search_value = app('purify')->xss_clean($post_data['search']['value']); // Search value
            $table = 'cn_reports';

            ## Search
            $search_query = " ";
            // if($search_value != ''){
            //     $search_query = " and (email like '%".$search_value."%' or
            //         ip like '%".$search_value."%' or message like '%".$search_value."%') ";
            // }

            if (array_key_exists("report_type", $post_data)) {
                $search_type = app('purify')->xss_clean($post_data['report_type']);
                if($search_type != ""){
                    $search_query .= " AND report_type = '".$search_type."' ";
                }
            }

            if (array_key_exists("report_status", $post_data)) {
                $report_status = app('purify')->xss_clean($post_data['report_status']);
                if($report_status != ""){
                    $search_query .= " AND status = '".$report_status."' ";
                }
            }

            ## Total number of records without filtering
            $all_count_q = "SELECT COUNT(*) AS allcount FROM cn_reports";
            $all_count_data = app('db')->rawQuery($all_count_q);
            $total_records = $all_count_data[0]['allcount'];

            ## Total number of record with filtering
            $all_filtered_count_q = "SELECT COUNT(*) as allcount FROM cn_reports WHERE 1 ".$search_query;
            $all_filtered_count_data = app('db')->rawQuery($all_filtered_count_q);
            $total_filtered_records = $all_filtered_count_data[0]['allcount'];

            ## Fetch records
            $records_q = "SELECT r.id, r.report_type, r.report_reason, r.reported_at, r.status, rs.title FROM cn_reports r, cn_report_reasons rs WHERE r.report_reason=rs.id ".$search_query." order by ".$column_name." ".$column_sort_order." limit ".$row.",".$row_per_page;
            $all_data = app('db')->rawQuery($records_q);

            $return_data = array();
            foreach ($all_data as $key => $value) {
                $value['title'] = get_default_term($value['title']);
                $return_data[] = $value;
            }

            ## Response
            $response = array(
                "draw" => intval($draw),
                "iTotalRecords" => $total_records,
                "iTotalDisplayRecords" => $total_filtered_records,
                "aaData" => $return_data
            );
            echo json_encode($response);

        }else{
            header("Location: " . route('dashboard'));
        }
    }

    function flaged_view(){
        $post_data = $_POST;
        $flaged_id = app('purify')->xss_clean($post_data['flaged_id']);
        app('db')->join("users u", "r.reported_by=u.id", "LEFT");
        app('db')->join("report_reasons rs", "r.report_reason=rs.id", "LEFT");
        app('db')->where('r.id', $flaged_id);
        $flaged_data = app('db')->getOne('reports r', 'r.*, rs.title as report_reason_title, u.first_name, u.last_name');

        if($flaged_data['report_type'] == 1){

            if($flaged_data['chat_type'] == 1){
                app('db')->join("chat_rooms cr", "c.room_id=cr.id", "LEFT");
                app('db')->where('c.id', $flaged_data['report_for'] );
                $flaged_for = app('db')->getOne('private_chats c', 'c.*, cr.slug');
            }else{
                app('db')->join("chat_rooms cr", "c.room_id=cr.id", "LEFT");
                app('db')->where('c.id', $flaged_data['report_for'] );
                $flaged_for = app('db')->getOne('group_chats c', 'c.*, cr.slug');
            }
            $flaged_data['flaged_for'] = $flaged_for;
            $flaged_data['report_type_text'] = __('Chat',2);
            
        }else if($flaged_data['report_type'] == 2){

            app('db')->where('id', $flaged_data['report_for'] );
            $flaged_for = app('db')->getOne('users');

            $flaged_data['flaged_for'] = $flaged_for;
            $flaged_data['report_type_text'] = __('User',2);

        }else if($flaged_data['report_type'] == 3){

            app('db')->where('id', $flaged_data['report_for'] );
            $flaged_for = app('db')->getOne('chat_rooms');

            $flaged_data['flaged_for'] = $flaged_for;
            $flaged_data['report_type_text'] = __('Room',2);

        }else if($flaged_data['report_type'] == 4){
            app('db')->where('id', $flaged_data['report_for'] );
            $flaged_for = app('db')->getOne('chat_groups');

            $flaged_data['flaged_for'] = $flaged_for;
            $flaged_data['report_type_text'] = __('Group',2);
        }

        $flaged_data['report_reason_title'] = get_default_term($flaged_data['report_reason_title']);
        return json_response($flaged_data);

    }

    // flaged content solve
    public function flaged_resolve(){
        $post_data = app('request')->body;
        app('db')->where ('id', app('purify')->xss_clean($post_data['flaged_id']));
        app('db')->update('reports', array('status' => 2, 'updated_at' => app('db')->now()));
        return json_response(["success" => 'true', "message" => __('Flaged Content Solved', 2)]);
    }

    // Domain filter
    public function domain_filter(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/domain_filter.html', $data);
    }

    // Flood Control
    public function flood_control(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/flood_control.html', $data);
    }

    // Single Sign-on
    public function sso(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/sso.html', $data);
    }

    //Custom Pages
    public function pages(){
        $data = array();
        app('db')->orderBy("id","desc");
        $data['pages'] = app('db')->get('pages', null, 'id, title, slug, status, created_at');
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/pages.html', $data);
    }

     //Add Custom Pages
     public function add_page(){
        $data = array();
        if (isset($_GET['edit_page'])) {
            $page_id = app('purify')->xss_clean($_GET['edit_page']);
            app('db')->where ('id', $page_id);
            $page = app('db')->getOne('pages');
            if( $page){
                $data['page'] = $page;
            }
        }
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/page_add.html', $data);
    }

    //Custom Pages
    public function menus(){
        $data = array();
        app('db')->orderBy("menu_order","asc");
        $data['menus'] = app('db')->get('menus');
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/menus.html', $data);
    }
    

    public function reactions(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/reactions.html', $data);
    }

    public function badges(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        $data['badges'] = app('db')->get('badges');
        echo app('twig')->render('admin/badges.html', $data);
    }

    public function video_calling(){
        $data = array();
        $data['lang_list'] = app('db')->get('languages');
        echo app('twig')->render('admin/video_calling.html', $data);
    }
 

}
