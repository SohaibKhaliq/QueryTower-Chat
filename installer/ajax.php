<?php

// Teast database connection using given data
function database_test($database_name, $database_host, $database_port, $database_user, $database_password){
    error_reporting(E_ERROR | E_PARSE); // to get true or false walue without throwing an error
    if (empty(trim($database_name))) {
        return array (false, "Database Name is required");
    }elseif (empty(trim($database_host))) {
        return array (false, "Database Host is required");
    }elseif (empty(trim($database_port))) {
        return array (false, "Database Port is required");
    }elseif (empty(trim($database_user))) {
        return array (false, "Database User is required");
    }else{
        $mysqli = new mysqli ($database_host, $database_user, $database_password, $database_name, $database_port);
        if ($mysqli -> connect_error) {
            return array (false, "Failed to connect to MySQL: " . $mysqli -> connect_error);
        }else{
            return array(true,$mysqli);
        }
    }
}

// get HTTP or HTTPs from URL
function get_protocol(){
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    return $protocol;
}

// following code will handle installer actions
if ($_POST && isset($_POST['action'])) {
    $action = $_POST['action'];
    if ($action == 'database_test') {
        $database_name = app('purify')->xss_clean(clean($_POST['database_name']));
        $database_host = app('purify')->xss_clean(clean($_POST['database_host']));
        $database_port = app('purify')->xss_clean(clean($_POST['database_port']));
        $database_user = app('purify')->xss_clean(clean($_POST['database_user']));
        $database_password = trim($_POST['database_password']);

        $database_test = database_test($database_name, $database_host, $database_port, $database_user, $database_password);

        if($database_test[0]){
            $db_message = "Database Connection is OK!";
        }else{
            $db_message = $database_test[1];
        }
        echo json_encode($db_message);

    }else if($action == 'database_install'){
        $database_name = app('purify')->xss_clean(clean($_POST['database_name']));
        $database_host = app('purify')->xss_clean(clean($_POST['database_host']));
        $database_port = app('purify')->xss_clean(clean($_POST['database_port']));
        $database_user = app('purify')->xss_clean(clean($_POST['database_user']));
        $purchase_code = app('purify')->xss_clean(clean($_POST['purchase_code']));
        $database_password = trim($_POST['database_password']);

        $database_test = database_test($database_name, $database_host, $database_port, $database_user, $database_password);

        $email = app('purify')->xss_clean(clean($_POST['email']));
        $first_name = app('purify')->xss_clean(clean($_POST['first_name']));
        $last_name = app('purify')->xss_clean(clean($_POST['last_name']));
        $username = app('purify')->xss_clean(clean($_POST['username']));

        if (empty(trim($first_name))) {
            echo json_encode( array (false, "First Name is required"));
        }elseif (empty(trim($last_name))) {
            echo json_encode( array (false, "Last Name is required"));
        }elseif (empty(trim($username))) {
            echo json_encode( array (false, "Username is required"));
        }elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode( array (false, "Email is invalid"));
        }elseif (empty(trim($purchase_code))) {
            echo json_encode( array (false, "Purchase code is required"));
        }else{

            $actual_link = get_protocol()."$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
            $site_url = str_replace("install/ajax", "", $actual_link);

            $purchase_verify = purchase_verify($purchase_code, $email, $site_url);
            if ($purchase_verify['status'] == "true") {

                if($database_test[0]){
                    $conn = $database_test[1];

                    $settingsFile = fopen(BASE_PATH."config/settings.php", "w");
                    if(!$settingsFile){
                        echo json_encode(array(false,"Unable to create settings file!"));
                        die();
                    }
                    $txt = "<?php\n";
                    fwrite($settingsFile, $txt);
                    // $txt = "define('URL', '".$site_url."');\n";
                    // fwrite($settingsFile, $txt);
                    $txt = "define('DB_HOST', '".$database_host."');\n";
                    fwrite($settingsFile, $txt);
                    $txt =$txt = "define('DB_USER', '".$database_user."');\n";
                    fwrite($settingsFile, $txt);
                    $txt =$txt = "define('DB_PASSWORD', '".$database_password."');\n";
                    fwrite($settingsFile, $txt);
                    $txt =$txt = "define('DB_NAME', '".$database_name."');\n";
                    fwrite($settingsFile, $txt);
                    $txt =$txt = "define('DB_PORT', '".$database_port."');\n";
                    fwrite($settingsFile, $txt);
                    $txt =$txt = "define('DB_PREFIX', 'cn_');\n";
                    fwrite($settingsFile, $txt);
                    $txt = "?>\n";
                    fwrite($settingsFile, $txt);
                    fclose($settingsFile);

                    $query = '';
                    $sqlScript = file(BASE_PATH.'installer/chatnet.sql');
                    foreach ($sqlScript as $line)	{

                    	$startWith = substr(trim($line), 0 ,2);
                    	$endWith = substr(trim($line), -1 ,1);

                    	if (empty($line) || $startWith == '--' || $startWith == '/*' || $startWith == '//') {
                    		continue;
                    	}

                    	$query = $query . $line;
                    	if ($endWith == ';') {
                            if (!$conn -> query($query)) {
                              $sql_error = ("Problem in executing the SQL query: " .$query . " - " . $conn -> error);
                              echo json_encode( array(false, $sql_error) );
                              die();
                            }
                    		$query= '';
                    	}
                    }

                    echo json_encode(array(true, true));

                }else{
                    $db_message = $database_test[1];
                    echo json_encode(array(false, $database_test[1]));
                }

            }else{
                echo json_encode( array( $purchase_verify['status'], $purchase_verify['response']));
            }

        }
    }else if($action == 'add_admin_user'){
        $database_name = app('purify')->xss_clean(clean($_POST['database_name']));
        $database_host = app('purify')->xss_clean(clean($_POST['database_host']));
        $database_port = app('purify')->xss_clean(clean($_POST['database_port']));
        $database_user = app('purify')->xss_clean(clean($_POST['database_user']));
        $database_password = trim($_POST['database_password']);

        $first_name = app('purify')->xss_clean(clean($_POST['first_name']));
        $last_name = app('purify')->xss_clean(clean($_POST['last_name']));
        $username = app('purify')->xss_clean(clean($_POST['username']));
        $email = app('purify')->xss_clean(clean($_POST['email']));
        $password = trim($_POST['password']);

        if (empty(trim($first_name))) {
            echo json_encode( array (false, "First Name is required"));
        }elseif (empty(trim($last_name))) {
            echo json_encode( array (false, "Last Name is required"));
        }elseif (empty(trim($username))) {
            echo json_encode( array (false, "Username is required"));
        }elseif (empty(trim($email))) {
            echo json_encode( array (false, "Email is required"));
        }elseif (empty(trim($password))) {
            echo json_encode( array (false, "Password is required"));
        }else{
            $database_test = database_test($database_name, $database_host, $database_port, $database_user, $database_password);

            if($database_test[0]){
                $conn = $database_test[1];
                $password = password_hash($password, PASSWORD_DEFAULT);
                $query = "INSERT INTO `cn_users`
                    (`user_name`, `first_name`, `last_name`, `email`, `password`, `user_status`, `available_status`, `user_type`, `created_at`) VALUES
                    ('".$username."', '".$first_name."', '".$last_name."', '".$email."', '".$password."', '1', '1', '1', NOW())";
                if (!$conn -> query($query)) {
                  $sql_error = ("Problem in executing the SQL query: " .$query . " - " . $conn -> error);
                  echo json_encode( array(false, $sql_error) );
                  die();
                }
                echo json_encode(array(true, true));
            }else{
                $db_message = $database_test[1];
                echo json_encode(array(false, $database_test[1]));
            }
        }
    }else if($action == 'update'){
        $update_sql = app('purify')->xss_clean(clean($_POST['update_sql']));
        $sqlScript = file(BASE_PATH.'installer'.DS.'updates'.DS.$update_sql);
        $database_test = database_test(DB_NAME, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD);
        if ($sqlScript) {
            if ($database_test[0]) {
                $conn = $database_test[1];
                $query = '';
                foreach ($sqlScript as $line)	{
                    $startWith = substr(trim($line), 0 ,2);
                    $endWith = substr(trim($line), -1 ,1);
                    if (empty($line) || $startWith == '--' || $startWith == '/*' || $startWith == '//') {
                        continue;
                    }
                    $query = $query . $line;
                    if ($endWith == ';') {
                        if (!$conn -> query($query)) {
                          $sql_error = ("Problem in executing the SQL query: " .$query . " - " . $conn -> error);
                          echo json_encode( array(false, $sql_error) );
                          die();
                        }
                        $query= '';
                    }
                }
                echo json_encode(array(true, 'Successfully Updated!'));
            }else{
                echo json_encode(array(false, 'Database Connection Error'));
            }
        }else{
            echo json_encode(array(false, 'Update File Not Found'));
        }


    }
}

?>
