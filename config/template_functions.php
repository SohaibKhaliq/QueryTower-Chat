<?php
// Set Grobal Template Variables
app()->twig->addGlobal('STATIC_URL', URL . 'static');
if (isset(SETTINGS['cloud_storage']) && SETTINGS['cloud_storage'] == true) {
    app()->twig->addGlobal('MEDIA_URL', SETTINGS['cloud_storage_url']);
}else{
    app()->twig->addGlobal('MEDIA_URL', URL . 'media');
}
app()->twig->addGlobal('USER', app('auth')->user());
app()->twig->addGlobal('SYSTEM_TIMEZONE_OFFSET', date('P'));
app()->twig->addGlobal('SETTINGS', SETTINGS);
app()->twig->addGlobal('IMAGE_SIZE', IMAGE_SIZE);
app()->twig->addGlobal('SITE_URL', URL);
app()->twig->addGlobal('LANG', app()->lang);
app()->twig->addGlobal('GOOGLE_FONT_FAMILY', app()->google_font_family);
app()->twig->addGlobal('THEME', app()->theme);
app()->twig->addGlobal('CV', CV);

if (app('auth')->isAuthenticated() == true){
    app()->twig->addGlobal('IS_AUTHENTICATED', true);
}else{
    app()->twig->addGlobal('IS_AUTHENTICATED', false);
}

if(isset($_GET['view-as'])){
    app()->twig->addGlobal('VIEW_AS', '?view-as='.$_GET['view-as']);
}else{
    app()->twig->addGlobal('VIEW_AS', '');
}
// Custom Template Functions

// Quck accss URL
$url_func = new \Twig\TwigFunction('url', function ($url, $params=array()) {
    if (!empty($params)) {
        return route($url, $params);
    }else{
        return route($url);
    }
});
app()->twig->addFunction($url_func);

// Flash messages for templates
$msg_func = new \Twig\TwigFunction('msg', function () {
    return app()->msg->display();
});
app()->twig->addFunction($msg_func);

// HTML parse functions
function htmlspecialchars_decodex($str){
    return htmlspecialchars_decode($str??'');
}
$filter = new \Twig\TwigFilter('htmlspecialchars_decode', 'htmlspecialchars_decodex');
app()->twig->addFilter($filter);

$filter = new \Twig\TwigFilter('htmlentities', 'htmlentities');
app()->twig->addFilter($filter);

// CSRF tokens and input feils
$csrf_func = new \Twig\TwigFunction('csrf_token', function () {
    return app()->csfr->getInputToken(SECRET_KEY);
});
app()->twig->addFunction($csrf_func);

$csrf_ajax_func = new \Twig\TwigFunction('csrf_token_ajax', function () {
    return app()->csfr->getToken(SECRET_KEY);
});
app()->twig->addFunction($csrf_ajax_func);


// Quck accss URL
$translate_func = new \Twig\TwigFunction('_', function ($term, $section=1) {
    return translate_term($term, $section);
});
app()->twig->addFunction($translate_func);

// Quck accss to get user device
$device_func = new \Twig\TwigFunction('user_device', function ($user_agent) {
    return user_agent_string($user_agent);
});
app()->twig->addFunction($device_func);


$datatable_lang_func = new \Twig\TwigFunction('is_datatable_lang_exsists', function ($lang) {
    $lang_file_path = BASE_PATH.'static'.DS.'vendor'.DS.'datatables'.DS.'lang'.DS.$lang['code'].'.json';
    if (file_exists($lang_file_path)) {
        return true;
    }else{
        return false;
    }
});
app()->twig->addFunction($datatable_lang_func);

$uppy_lang_func = new \Twig\TwigFunction('is_uppy_lang_exsists', function ($lang) {
    $lang_file_path = BASE_PATH.'static'.DS.'vendor'.DS.'uppy'.DS.'locales'.DS.$lang['code'].'_'.strtoupper($lang['country']).'.js';
    if (file_exists($lang_file_path)) {
        return true;
    }else{
        return false;
    }
});
app()->twig->addFunction($uppy_lang_func);

// Build URL with params
$createurl_func = new \Twig\TwigFunction('url_for_embedded', function ($url, $query=false) {
    $parsedUrl = parse_url($url);
    if ($parsedUrl['path'] == null) {
       $url .= '/';
    }
    if (isset($parsedUrl['query'])) {
        $separator = '&';
    }else{
        $separator = '?';
    }
    $url .= $separator . 'room=' . $query['query'];
    return $url;
});
app()->twig->addFunction($createurl_func);

$default_translate_func = new \Twig\TwigFunction('default_translate', function ($term) {
    return get_default_term($term);
});
app()->twig->addFunction($default_translate_func);


?>
