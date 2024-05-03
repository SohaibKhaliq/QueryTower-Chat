<?php $updates_available=false; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Updater - ChatNet by Oncodes</title>
    <link href="<?php echo URL; ?>static/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link href="<?php echo URL; ?>static/css/styles.css" rel="stylesheet">
    <link href="<?php echo URL; ?>installer/static/install-wizard.css" rel="stylesheet" />
</head>
<body>
    <main class="my-5">
        <div class="container">
            <div id="wizard">
                <h3>
                    <div class="media">
                        <div class="bd-wizard-step-icon"><i class="fas fa-tools"></i></div>
                        <div class="media-body">
                            <div class="bd-wizard-step-title">Updater</div>
                            <div class="bd-wizard-step-subtitle">Update Chatnet</div>
                        </div>
                    </div>
                </h3>
                <section>
                    <div class="content-wrapper">
                        <div class="row">
                            <div class="col-md-6">
                                <h4 class="section-heading">Welcome! </h4>
                                <p class="section-description">
                                    Prior to the update process, It is VERY IMPORTANT to backup all your existing ChatNet files & database.
                                    Please note that we are not responsible for the loss of any data.
                                </p>
                                <div>
                                    <img style="width:100%" src="<?php echo URL; ?>installer/img/update.png" />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <input type="hidden" name="site_url" id="site_url" value="<?php echo URL; ?>">
                                <h4 class="section-heading">Update Now</h4>
                                <p class="section-description">
                                    Check your server configuration before install the script. Make sure all requered
                                    software are installed and requements are met.
                                </p>
                                <?php
                                if ($handle = opendir(BASE_PATH.'/installer/updates')) {
                                    if (!isset(SETTINGS['current_version'])) {
                                        $current_version = 1.0;
                                    }else{
                                        $current_version = SETTINGS['current_version'];
                                    }
                                    while (false !== ($entry = readdir($handle))) {
                                        if ($entry != "." && $entry != "..") {
                                            $ext = pathinfo($entry, PATHINFO_EXTENSION);
                                            $update_file_name = pathinfo($entry, PATHINFO_FILENAME );

                                            if( $current_version < $update_file_name){

                                            if($ext == 'sql'){
                                                $updates_available = true;
                                ?>
                                            <div class="card mb-2">
                                                <div class="card-body">
                                                    Update to Version <?php echo $update_file_name; ?>
                                                    <button id="<?php echo $entry; ?>" class="btn btn-success btn-xs float-right btn-update" type="button" >Run Update</button>
                                                </div>
                                            </div>

                                <?php       }
                                        }
                                    }

                                }
                                    closedir($handle);
                                }
                                ?>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>
    <script src="<?php echo URL; ?>static/vendor/jquery/jquery.min.js"></script>
    <script src="<?php echo URL; ?>static/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="<?php echo URL; ?>static/js/loadingoverlay.min.js" ></script>
    <script src="<?php echo URL; ?>installer/static/jquery.steps.min.js" type="text/javascript"></script>
    <script src="<?php echo URL; ?>installer/static/install-wizard.js" type="text/javascript"></script>
</body>

</html>
<?php
if(!$updates_available){
    header("Location: " . route('index'));
}
?>
