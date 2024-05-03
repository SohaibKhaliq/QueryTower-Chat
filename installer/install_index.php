<?php

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

<?php include 'install.php' ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Install - ChatNet by Oncodes</title>
    <link href="<?php echo $site_url; ?>static/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link href="<?php echo $site_url; ?>static/css/styles.css" rel="stylesheet">
    <link href="<?php echo $site_url; ?>installer/static/install-wizard.css" rel="stylesheet" />
</head>
<body>
    <main class="my-5">
        <div class="container">
            <div id="wizard">
                <h3>
                    <div class="media">
                        <div class="bd-wizard-step-icon"><i class="far fa-handshake"></i></div>
                        <div class="media-body">
                            <div class="bd-wizard-step-title">Welcome!</div>
                            <div class="bd-wizard-step-subtitle">Step 1</div>
                        </div>
                    </div>
                </h3>
                <section>
                    <div class="content-wrapper">
                        <div class="row">
                            <div class="col-md-6">
                                <h4 class="section-heading">Welcome to ChatNet V<?php echo CV; ?> Installer</h4>
                                <p class="section-description">
                                    Thank you for purchasing ChatNet. From this wizard you can install the script to your server.
                                    If you encounter any issues, please feel free to contact us.
                                </p>
                                <p>
                                    <a href="https://codecanyon.net/item/chatnet-php-ajax-chat-room-private-chat-script/28419241/support" class="btn btn-info" target="_blank">
                                        <i class="fa fa-hands-helping"></i>
                                        I Need Help
                                    </a>
                                </p>
                                <div>
                                    <img style="width:100%" src="<?php echo $site_url; ?>installer/img/welcome.svg" />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h4 class="section-heading">Server Status </h4>
                                <p class="section-description">
                                    Check your server configuration before install the script. Make sure all requered
                                    software are installed and requements are met.
                                </p>
                                <p class="text-info">Your Server Status</p>
                                <input type="hidden" id="can-proceed" value="<?php echo $can_proceed ?>"/>
                                <table style="width:100%">
                                    <tr>
                                        <td style="width:20%">PHP</td>
                                        <td>v <?php echo $currrent_php_version; ?></td>
                                    </tr>
                                    <tr>
                                        <td>Apache</td>
                                        <td><?php echo $currrent_apache_version; ?></td>
                                    </tr>
                                </table>
                                <hr>
                                <p class="text-info">Extensions & Applications</p>
                                <table style="width:100%">
                                    <tr>
                                        <td>PHP <?php echo $required_php_version; ?> or higher</td>
                                        <td><span class="badge badge-info">Required</span></td>
                                        <td>
                                            <?php if ($required_php_version <= $currrent_php_version){ ?>
                                                <i class="fa fa-check text-success"></i>
                                            <?php } else { ?>
                                                <i class="fa fa-times text-danger"></i>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>MySQLi PHP Extension</td>
                                        <td><span class="badge badge-info">Required</span></td>
                                        <td>
                                            <?php if ($is_mysqli_installed){ ?>
                                                <i class="fa fa-check text-success"></i>
                                            <?php } else { ?>
                                                <i class="fa fa-times text-danger"></i>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>GD Library PHP Extension</td>
                                        <td><span class="badge badge-info">Required</span></td>
                                        <td>
                                            <?php if ($is_gd_installed){ ?>
                                                <i class="fa fa-check text-success"></i>
                                            <?php } else { ?>
                                                <i class="fa fa-times text-danger"></i>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Curl PHP Extension</td>
                                        <td><span class="badge badge-info">Required</span></td>
                                        <td>
                                            <?php if ($is_curl_installed){ ?>
                                                <i class="fa fa-check text-success"></i>
                                            <?php } else { ?>
                                                <i class="fa fa-times text-danger"></i>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>MBString PHP Extension	</td>
                                        <td><span class="badge badge-info">Required</span></td>
                                        <td>
                                            <?php if ($is_mbstring_installed){ ?>
                                                <i class="fa fa-check text-success"></i>
                                            <?php } else { ?>
                                                <i class="fa fa-times text-danger"></i>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>FileInfo PHP Extension</td>
                                        <td><span class="badge badge-info">Required</span></td>
                                        <td>
                                            <?php if ($is_fileinfo_installed){ ?>
                                                <i class="fa fa-check text-success"></i>
                                            <?php } else { ?>
                                                <i class="fa fa-times text-danger"></i>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Exif PHP Extension</td>
                                        <td><span class="badge badge-info">Required</span></td>
                                        <td>
                                            <?php if ($is_exif_installed){ ?>
                                                <i class="fa fa-check text-success"></i>
                                            <?php } else { ?>
                                                <i class="fa fa-times text-danger"></i>
                                            <?php } ?>
                                        </td>
                                    </tr>


                                </table>
                                <hr>
                                <p class="text-info mb-0">Directory Permissions</p>
                                <p class="section-description">Plase make sure following directories are writable and required permissions are set.</p>
                                <table style="width:100%">
                                    <tr>
                                        <td>Media Directory <small>(/media)</small></td>
                                        <td> <span class="badge badge-info">0777</span>  <small>required</small></td>
                                        <td> <span class="badge badge-info"><?php echo $media_perm; ?></span> <small>found</small></td>
                                        <td>
                                            <?php if ($is_media_writable){ ?>
                                                <i class="fa fa-check text-success"></i>
                                            <?php } else { ?>
                                                <i class="fa fa-times text-danger"></i>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Config Directory <small>(/config)</small> </td>
                                        <td><span class="badge badge-info">0777</span>  <small>required</small></td>
                                        <td><span class="badge badge-info"><?php echo $config_perm; ?></span> <small>found</small></td>
                                        <td>
                                            <?php if ($is_config_writable){ ?>
                                                <i class="fa fa-check text-success"></i>
                                            <?php } else { ?>
                                                <i class="fa fa-times text-danger"></i>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Language Directory <small>(/lang)</small> </td>
                                        <td><span class="badge badge-info">0777</span>  <small>required</small></td>
                                        <td><span class="badge badge-info"><?php echo $lang_perm; ?></span> <small>found</small></td>
                                        <td>
                                            <?php if ($is_lang_writable){ ?>
                                                <i class="fa fa-check text-success"></i>
                                            <?php } else { ?>
                                                <i title="Not Writable" class="fa fa-times text-danger"></i>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
                <h3>
                    <div class="media">
                        <div class="bd-wizard-step-icon"><i class="fa fa-database"></i></div>
                        <div class="media-body">
                            <div class="bd-wizard-step-title">Database Config</div>
                            <div class="bd-wizard-step-subtitle">Step 2</div>
                        </div>
                    </div>
                </h3>
                <section>
                    <div class="row">
                        <div class="col-md-12">
                            <h4 class="section-heading">Database Settings</h4>
                            <p class="section-description">
                                Configure your database details here. Make sure to use an empty database.
                                Use the Test Connection button to check the database connection before proceed.
                            </p>
                        </div>
                        <div class="col-md-6">
                            <input type="hidden" name="site_url" id="site_url" value="<?php echo $site_url; ?>">
                            <div class="form-group">
                              <label for="database_name">Database Name</label>
                              <input type="text" id="database_name" value="chatnet" class="form-control input-sm" >
                              <small>Make sure you specify an empty database</small>
                            </div>
                            <div class="form-group">
                              <label for="database_host">Database Host</label>
                              <input type="text" id="database_host" value="localhost" class="form-control input-sm" >
                            </div>
                            <div class="form-group">
                              <label for="database_port">Database Port</label>
                              <input type="text" id="database_port" value="3306" class="form-control input-sm">
                            </div>
                        </div>
                        <div class="col-md-6">
                              <div class="form-group">
                                <label for="database_user">Database User</label>
                                <input type="text" id="database_user" value="" class="form-control input-sm">
                              </div>
                              <div class="form-group">
                                <label for="database_password">Password</label>
                                <input type="text" id="database_password" class="form-control">
                              </div>
                              <button id="test_connection" class="btn btn-primary">Test Connection</button>
                        </div>
                    </div>
                </section>
                <h3>
                    <div class="media">
                        <div class="bd-wizard-step-icon"><i class="fa fa-user-shield"></i></div>
                        <div class="media-body">
                            <div class="bd-wizard-step-title">Admin Account </div>
                            <div class="bd-wizard-step-subtitle">Step 3</div>
                        </div>
                    </div>
                </h3>
                <section>
                    <div class="row">
                        <div class="col-md-12">
                            <h4 class="section-heading">Adminitrator Account</h4>
                            <p class="section-description">
                                Please fill in your administrator account details. You can change these after you
                                log in to the system later.
                            </p>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                              <label for="first_name">First Name</label>
                              <input type="text" id="first_name" value="" class="form-control input-sm">
                            </div>
                            <div class="form-group">
                                <label for="last_name">Last Name</label>
                                <input type="text" id="last_name" value="" class="form-control input-sm">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" id="username" value="" class="form-control input-sm">
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" value="" class="form-control input-sm">
                            </div>
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="text" id="password" value="" class="form-control">
                            </div>
                        </div>
                    </div>
                </section>
                <h3>
                    <div class="media">
                        <div class="bd-wizard-step-icon"><i class="fa fa-running"></i></div>
                        <div class="media-body">
                            <div class="bd-wizard-step-title">Install</div>
                            <div class="bd-wizard-step-subtitle">Step 4</div>
                        </div>
                    </div>
                </h3>
                <section>
                    <div class="row install-pending">
                        <div class="col-md-6">
                            <img style="width:100%" src="<?php echo $site_url; ?>installer/img/install.svg" />
                        </div>
                        <div class="col-md-6">
                            <h4 class="section-heading">Install ChatNet</h4>
                            <p class="section-description">
                                Click the Install button to begin the installation process.
                                Do not close the tab or browser. This installation process may take few minutes to complete.
                            </p>
                            <p>
                                <div class="form-group">
                                    <label for="purchase_code">ChatNet will be installed on </label>
                                    <input disabled readonly type="text" value="<?php echo $site_url; ?>" class="form-control input-sm">
                                    <small>If you want to change the site URL, Access the installer from the URL you want ChatNet to be installed.</small>
                                </div>
                            </p>
                            <p>
                                <div class="form-group">
                                    <label for="purchase_code text-info">Envato Purchase Code</label>
                                    <input type="text" id="purchase_code" value="DoniaWeB" class="form-control input-sm">
                                    <small><a href="https://doniaweb.com" target="_blank">Licensed By DoniaWeB</a></small>
                                </div>
                            </p>
                            <p>
                                <button id="install" class="btn btn-primary">Install</button>
                            </p>
                        </div>
                    </div>
                    <div class="row install-success" style="display:none;">
                        <div class="col-md-6">
                            <img style="width:100%" src="<?php echo $site_url; ?>installer/img/finish.svg" />
                        </div>
                        <div class="col-md-6">
                            <h4 class="section-heading">ChatNet Installed Successfully!</h4>
                            <p class="section-description">
                                Congratulations, You have Successfully installed the ChatNet script to your server.
                                Please click the following button to login and enjoy your newly created chat .community.
                            </p>
                            <p>
                                <a href="<?php echo $site_url; ?>" class="btn btn-primary">Visit</a>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>
    <script src="<?php echo $site_url; ?>static/vendor/jquery/jquery.min.js"></script>
    <script src="<?php echo $site_url; ?>static/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="<?php echo $site_url; ?>static/js/loadingoverlay.min.js" ></script>
    <script src="<?php echo $site_url; ?>installer/static/jquery.steps.min.js" type="text/javascript"></script>
    <script src="<?php echo $site_url; ?>installer/static/install-wizard.js" type="text/javascript"></script>
</body>

</html>
