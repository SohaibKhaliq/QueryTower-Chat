<?php
namespace App;


class adminAjaxController{

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

    // Saving received messages
    public function save_page(){
        $post_data = $_POST;

        $data = Array (
            "title" => app('purify')->xss_clean($post_data['title']),
            "content" => app('purify')->xss_clean($post_data['content']),
            "slug" => app('purify')->xss_clean($post_data['slug']),
            "meta_description" => clean($post_data['meta_description']),
            "show_banner" => app('purify')->xss_clean($post_data['show_banner']),
            "members_only" => app('purify')->xss_clean($post_data['members_only']),
            "status" => app('purify')->xss_clean($post_data['status'])
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
        
        if(isset($post_data['page_id'])){
            $page_id = $post_data['page_id'];
        }else{
            $page_id = false;
        }
        app('db')->where ('slug', $data['slug']);
        $page_with_slug = app('db')->getOne('pages');

        if($page_with_slug &&  $page_id != $page_with_slug['id']){
            $status = false;
            array_push($message, array('slug'=>[__('Permalink already exists for page id ') . $page_with_slug['id']]));
        }

        if($status){
            if($post_data['edit_type'] == "update"){
                $page_id = app('purify')->xss_clean($post_data['page_id']);
                app('db')->where ('id', $page_id);
                $page = app('db')->getOne('pages');
                if($page){
                    app('db')->where ('id', $page_id);
                    $update = app('db')->update('pages', $data);
                    if($update){
                        return json_response(["success" => true, "message" => __('Successfully Saved'), "update" => true]);
                    }else{
                        return json_response(["success" => false, "message" => __('Update Error')]);
                    }
                }else{
                    return json_response(["success" => false, "message" => __('Page ID not found')]);
                }
            }else{
                $insert = app('db')->insert ('pages', $data);
                if($insert){
                    return json_response(["success" => true, "message" => __('Successfully Saved')]);
                }else{
                    return json_response(["success" => false, "message" => __('Insert Error')]);
                }
            }
        }else{
            return json_response(["success" => false, "message" => $message]);
        }

    }  
    
    public function menu_update(){
        $post_data = app('request')->body;
        $update_data = array();
        $update_data['custom_menus'] = $post_data['custom_menus'];
        $return_data = app('admin')->updateSettings($update_data);
        if($update_data['custom_menus']){
            $return_data = app('admin')->update_menus($post_data['update_list'], $post_data['delete_list']);
        }

        return json_response(array("success" => $return_data[0], "message" => $return_data[1]));
    }

    // delete page
    public function delete_page(){
        $post_data = app('request')->body;
        app('db')->where ('id', app('purify')->xss_clean($post_data['page_id']));
        app('db')->delete('pages');
        return json_response(["success" => true, "message" => ""]);
    }

    public function badges_update(){
        $post_data = app('request')->body;
        $update_data = array();
        $update_data['enable_badges'] = $post_data['enable_badges'];
        $return_data = app('admin')->updateSettings($update_data);
        if($update_data['enable_badges']){
            $return_data = app('admin')->update_badges($post_data['update_list'], $post_data['delete_list']);
        }

        return json_response(array("success" => $return_data[0], "message" => $return_data[1]));
    }

    
    public function badges_assign(){
        $post_data = app('request')->body;
        $update_data = array();
        $update_data['badges'] = json_encode(explode(',', $post_data['badges']));
        app('db')->where('id', $post_data['user_id']);
        $update = app('db')->update('users', $update_data);
        if( $update ){
            return json_response(array("success" => true, "message" => ''));
        }else{
            return json_response(array("success" => false, "message" => ''));
        }
        
    }

}
