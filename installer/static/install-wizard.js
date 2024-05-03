//Wizard Init

function loading(div, status) {
    $(div).LoadingOverlay(status, {
        image: "",
        custom: '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>',
    });
}

function installDatabase() {

    var database_name = $("#database_name").val();
    var database_host = $("#database_host").val();
    var database_port = $("#database_port").val();
    var database_user = $("#database_user").val();
    var database_password = $("#database_password").val();

    var first_name = $("#first_name").val();
    var last_name = $("#last_name").val();
    var username = $("#username").val();
    var email = $("#email").val();
    var password = $("#password").val();
    var purchase_code = $("#purchase_code").val();

    var valid = true;
    if(database_name == ""){
        valid = false;
        alert("Database Name is required!");
    }else if(database_host == ""){
        valid = false;
        alert("Database Host is required!");
    }else if(database_port == ""){
        valid = false;
        alert("Database Port is required!");
    }else if(database_user == ""){
        valid = false;
        alert("Database User is required!");
    }else if(first_name == ""){
        valid = false;
        alert("First Name is required!");
    }else if(last_name == ""){
        valid = false;
        alert("Last Name is required!");
    }else if(username == ""){
        valid = false;
        alert("Username is required!");
    }else if(email == ""){
        valid = false;
        alert("Email is required!");
    }else if(password == ""){
        valid = false;
        alert("Password is required!");
    }else if(purchase_code == ""){
        valid = false;
        alert("Envato Purchase Code is required!");
    }

    if(valid){
        var url = $('#site_url').val() + "install/ajax";
        $.ajax({
            url: url,
            type: "POST",
            dataType: 'json',
            data: {
                action: 'database_install',
                database_name: database_name,
                database_host: database_host,
                database_port: database_port,
                database_user: database_user,
                database_password: database_password,
                email: email,
                first_name: first_name,
                last_name: last_name,
                username: username,
                purchase_code: purchase_code,
            },
            beforeSend: function() {
                loading("#wizard", "show");
            },
            success: function(data) {
                if(data[0]==true){
                    addAdminUser();
                }else{
                    alert(data[1])
                }

            },
            complete: function() {
                loading("#wizard", "hide");
            }
        })
    }
}

function addAdminUser() {

    var database_name = $("#database_name").val();
    var database_host = $("#database_host").val();
    var database_port = $("#database_port").val();
    var database_user = $("#database_user").val();
    var database_password = $("#database_password").val();

    var first_name = $("#first_name").val();
    var last_name = $("#last_name").val();
    var username = $("#username").val();
    var email = $("#email").val();
    var password = $("#password").val();

    var url = $('#site_url').val() + "install/ajax";
    $.ajax({
        url: url,
        type: "POST",
        dataType: 'json',
        data: {
            action: 'add_admin_user',
            database_name: database_name,
            database_host: database_host,
            database_port: database_port,
            database_user: database_user,
            database_password: database_password,
            first_name: first_name,
            last_name: last_name,
            username: username,
            email: email,
            password: password,
        },
        beforeSend: function() {
            loading("#wizard", "show");
        },
        success: function(data) {
            if(data[0]==true){
                $('.actions').hide();
                $('.install-pending').hide();
                $('.install-success').show();
                $('.actions').hide();
                $('.steps').hide();
            }else{
                alert(data[1])
            }
        },
        complete: function() {
            loading("#wizard", "hide");
        }
    })
}

$("#wizard").steps({
    headerTag: "h3",
    bodyTag: "section",
    transitionEffect: "none",
    titleTemplate: '#title#',
    enableFinishButton: false,
    onStepChanging: function(event, currentIndex, newIndex) {
        if (currentIndex > newIndex) {
            return true;
        }
        if (currentIndex == 0) {
            var can_proceed = $("#can-proceed").val();
            if (can_proceed == true) {
                return true;
            } else {
                alert("Server Requerements Error");
                return false;
            }
        }if (currentIndex == 0) {
            var database_name = $("#database_name").val();
            var database_host = $("#database_host").val();
            var database_port = $("#database_port").val();
            var database_user = $("#database_user").val();

        } else {
            return true;
        }

    },
});

$('#test_connection').on('click', function(){
    var database_name = $("#database_name").val();
    var database_host = $("#database_host").val();
    var database_port = $("#database_port").val();
    var database_user = $("#database_user").val();
    var database_password = $("#database_password").val();

    var url = $('#site_url').val() + "install/ajax";
    $.ajax({
        url: url,
        type: "POST",
        dataType: 'json',
        data: {
            action: 'database_test',
            database_name: database_name,
            database_host: database_host,
            database_port: database_port,
            database_user: database_user,
            database_password: database_password,
        },
        beforeSend: function() {
            //loading(".messages","show");
        },
        success: function(data) {
            alert(data);
        },
        complete: function() {

        }
    });
});

$('#install').on('click', function(){
    installDatabase();
});


$('.btn-update').on('click', function(){
    var update_sql = (this.id);
    var url = $('#site_url').val() + "install/ajax";
    $.ajax({
        url: url,
        type: "POST",
        dataType: 'json',
        data: {
            action: 'update',
            update_sql: update_sql,
        },
        beforeSend: function() {
            loading("#wizard","show");
        },
        success: function(data) {
            alert(data[1]);
            if (data[0]) {
                location.reload();
            }
        },
        complete: function() {
            loading("#wizard", "hide");
        }
    });
});
