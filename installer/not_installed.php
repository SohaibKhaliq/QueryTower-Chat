<?php

  $bp = dirname(__DIR__, 1).DIRECTORY_SEPARATOR;

    function get_protocol(){
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        return $protocol;
    }

    $actual_link = get_protocol()."$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    $site_url = str_replace("install/", "", $actual_link);
    if($site_url == $actual_link){
        $site_url = str_replace("install", "", $actual_link);
    }
?>

<!doctype html>
<title>Site Maintenance</title>
<style>
  body { text-align: center; padding: 150px; }
  h1 { font-size: 50px; }
  body { font: 20px Helvetica, sans-serif; color: #333; }
  article { display: block; text-align: left; width: 650px; margin: 0 auto; }
  a { color: #dc8100; text-decoration: none; }
  a:hover { color: #333; text-decoration: none; }
  p { line-height: 1.5;}
</style>

<article>
    <h1>Hi, Welcome to ChatNet!</h1>
      
    <?php if(file_exists($bp.'.htaccess')) { ?>

    <div>
        <p>Congratulations, You have successfully uploaded the files to your server</p>
        <p>If you own this site, Please follow visit <a href="<?php echo $site_url ?>install"><?php echo $site_url ?>install</a> to continue with the installation. </p>
        <p>If you encountered with any issue please read <a href="https://support.oncodes.com/help-center/articles/1/6/61/installer-giving-me-a-404-error" target="_blank">this article</a> and <a href="https://support.oncodes.com/help-center/categories/1/chatnet-php-chat-room-and-private-chat-script" target="_blank">installation guide</a>.</p>
        <p>If you need help, please <a href="https://support.oncodes.com/" target="_blank">start a support ticket</a>. We are always there to help.</p>
        <p>&mdash; OnCodes</p>
    </div>

    <?php } else { ?>

      <div>
        <p>It looks like .htaccess file is missing. Please <a href="https://support.oncodes.com/help-center/articles/1/6/61/installer-giving-me-a-404-error#if-you-are-running-on-apache" target="_blank">read this article for help</a>. </p>
      </div>

    <?php }  ?>
</article>
