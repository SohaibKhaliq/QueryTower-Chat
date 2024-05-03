
"use strict";

// Settings Object
const SETTINGS = {
    'display_name_format': "{{ SETTINGS.display_name_format?SETTINGS.display_name_format:'fullname'}}",
}

function getIPLogs(){
    var log_table = $('#ip_logs').DataTable( {
        "processing": true,
        "serverSide": true,
        "ajax": {
        "url": "{{ url('dashboard-ip-logs-data') }}",
            "type": "POST",
            "data": function ( d ) {
                d.csrftoken = '{{ csrf_token_ajax() }}',
                d.log_type = $('.log_type').val();
            }
        },
       "columns": [
           { "data": "ip" },
           { "data": "country" },
           { "data": "device", orderable: false },
           { "data": "email" },
           { "data": "time" },
           { "data": "type" },
           { "data": "message" }
       ]
    });

    $('.log_type').change( function() {
        log_table.draw();
    });
}

function getFlagedContent(){
    var flaged_table = $('#flaged_content').DataTable( {
        "processing": true,
        "serverSide": true,
        "ajax": {
        "url": "{{ url('dashboard-flaged-content-data') }}",
            "type": "POST",
            "data": function ( d ) {
                d.csrftoken = '{{ csrf_token_ajax() }}',
                d.report_type = $('.report_type').val();
                d.report_status = $('.report_status').val();
            }
        },
       "columns": [
            { "data": "id" },
            { "data": null, orderable: false, name: 'report_type', render: function ( data, type, row ) {
                if(data.report_type == 1){
                    var report_type = "Chat";
                }else if (data.report_type == 2) {
                    var report_type = "User";
                }else if (data.report_type == 3) {
                    var report_type = "Room";
                }else if (data.report_type == 4) {
                    var report_type = "Group";
                }else {
                    var report_type = "";
                }
                return report_type;
            }},
            { "data": "title"},
            { "data": "reported_at" },
            { "data": null, orderable: false, name: 'status', render: function ( data, type, row ) {
                var span_cls = 'flaged-'+data.id;
                if(data.status == 1){
                    var status = '<span class="badge badge-danger '+span_cls+'">{{_("Reported")}}</span>';
                }else {
                    var status = '<span class="badge badge-primary '+span_cls+'">{{_("Solved")}}</span>';
                }
                return status;
            }},
            { "data": null, orderable: false, render: function ( data, type, row ) {
                var view_button = '<a class="btn btn-xs btn-success flaged-view" data-id="'+data.id+'" data-toggle="tooltip" data-placement="top" title="{{_("View Flaged")}}" >'
                                        +'<i class="fas fa-eye"></i>'
                                    +'</a>';
               
                return "<div class='nowrap'>"+view_button+"</div>";
            }},
       ],
       "order": [[0, 'desc']]
    });

    $('.report_type').change( function() {
        flaged_table.draw();
    });

    $('.report_status').change( function() {
        flaged_table.draw();
    });
}

function getUsers(){
    var user_list_table = $('#user_list').DataTable( {
        "processing": true,
        "serverSide": true,
        "ajax": {
        "url": "{{ url('dashboard-user-list-data') }}",
            "type": "POST",
            "data": function ( d ) {
                d.csrftoken = '{{ csrf_token_ajax() }}';
                d.user_type = $('.user_type').val();
                d.available_status = $('.available_status').val();
            }
        },
       "columns": [
            { "data": null, name: 'id', orderable: false, render: function ( data, type, row ) {
                if({{USER.id}} != data.id){
                    return '<input type="checkbox" class="user-selection" name="delete_user_list[]" id="'+data.id+'_user" value="'+data.id+'" >';
                }else{
                    return "";
                }
            }},
            { "data": null, orderable: false, render: function ( data, type, row ) {
                var avatar_src = getUserAvatar(data, data.display_name);
  
                var user_avatar = '<div class="user-avatar">'
                                    +'<img class="img-profile mr-2" src="'+avatar_src+'">'
                                    +'</div>';
  
                return user_avatar;
            }},
            { "data": null, name: 'first_name', render: function ( data, type, row ) {
                return data.first_name+" "+data.last_name;
            }},
            { "data": "user_name" },
            { "data": "email" },
            { "data": null, name: 'user_type', render: function ( data, type, row ) {
                if(data.user_type == 1){
                    var user_type = "Admin";
                }else if (data.user_type == 2) {
                    var user_type = "Member";
                }else if (data.user_type == 4) {
                    var user_type = "Moderator";
                }else {
                    var user_type = "Guest";
                }
                return user_type;
            }},
            { "data": null, name: 'available_status', render: function ( data, type, row ) {
                if(data.available_status == 1){
                    var available_status = '<span class="badge badge-primary">{{_("Active")}}</span>';
                }else {
                    var available_status = '<span class="badge badge-warning">{{_("Inactive")}}</span>';
                }
                return available_status;
            }},
            { "data": null, orderable: false, render: function ( data, type, row ) {
                var button_list = '<a class="btn btn-xs btn-success" href="{{  url("dashboard-user-view") }}?user='+data.id+'"  data-toggle="tooltip" data-placement="top" title="{{_("View User")}}" >'
                                        +'<i class="fas fa-eye"></i>'
                                    +'</a>';
                if({{USER.id}} != data.id){
                    button_list += ' <a class="btn btn-danger btn-xs delete-user" href="javascript:void(0)" data-id="'+data.id+'_user" data-toggle="tooltip" data-placement="top" title="{{_("Delete User")}}"  >'
                                        +'<i class="fas fa-trash"></i>'
                                    +'</a>';
                }
                return "<div class='nowrap'>"+button_list+"</div>";
            }},
       ]
    });

    $('.user_type').change( function() {
        user_list_table.draw();
    });

    $('.available_status').change( function() {
        user_list_table.draw();
    });
}

function getGuests(){
    var guest_list_table = $('#guest_list').DataTable( {
        "processing": true,
        "serverSide": true,
        "ajax": {
        "url": "{{ url('dashboard-guest-list-data') }}",
            "type": "POST",
            "data": function ( d ) {
                d.csrftoken = '{{ csrf_token_ajax() }}';
            }
        },
       "columns": [
            { "data": null, name: 'id', orderable: false, render: function ( data, type, row ) {
                if({{USER.id}} != data.id){
                    return '<input type="checkbox" class="user-selection" name="delete_user_list[]" id="'+data.id+'_guest" value="'+data.id+'" >';
                }else{
                    return "";
                }
            }},

            { "data": 'first_name'},
            { "data": "user_name" },
            { "data": "last_seen" },
            { "data": null, orderable: false, render: function ( data, type, row ) {
                var button_list = '<a class="btn btn-xs btn-success" href="{{  url("dashboard-user-view") }}?user='+data.id+'"  data-toggle="tooltip" data-placement="top" title="{{_("View Guest")}}" >'
                                        +'<i class="fas fa-eye"></i>'
                                    +'</a>';

                    button_list += ' <a class="btn btn-danger btn-xs delete-user" href="javascript:void(0)" data-id="'+data.id+'_guest" data-toggle="tooltip" data-placement="top" title="{{_("Delete Guest")}}"  >'
                                        +'<i class="fas fa-trash"></i>'
                                    +'</a>';

                return "<div class='nowrap'>"+button_list+"</div>";
            }},
       ]
    });

}

function messagePreview(obj){
    var msg_preview;
    if(obj.type == 1){
        msg_preview = obj.message;
    }else if(obj.type == 2){
        var images = JSON.parse(obj.message);
        if (images.length >= 2) {
            msg_preview = "<i class='fa fa-image'></i> "+images.length+" {{_('Images')}}";
        }else{
            msg_preview = "<i class='fa fa-image'></i> {{_('Image')}}";
        }
        
    }else if(obj.type == 3){
        msg_preview = "<i class='fa fa-image'></i> {{_('GIF')}} ";
    }else if(obj.type == 4){
        msg_preview = "<i class='fa fa-smile'></i> {{_('Sticker')}}";
    }else if(obj.type == 5){
        var json_msg = JSON.parse(obj.message);
        msg_preview = linkParse(json_msg.message);
    }else if(obj.type == 6){
        var files = JSON.parse(obj.message);
        if (files.length >= 2) {
            msg_preview = "<i class='fa fa-file-alt'></i> "+files.length+" {{_('Files')}}";
        }else{
            msg_preview = "<i class='fa fa-file-alt'></i> {{_('File')}}";
        }
        
    }else if(obj.type == 7){
        msg_preview = "<i class='fa microphone-alt'></i> {{_('Audio')}} ";
    }else if(obj.type == 8){
        msg_preview = "<i class='fa fa-reply'></i> {{_('Reply Message')}} ";
    }else if(obj.type == 9){
        msg_preview = "<i class='fa fa-share'></i> {{_('Forwarded Message')}} ";
    }
    return msg_preview;
}

function linkParse(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank"><span class="chat-link"><i class="fa fa-link"></i> $1</span></a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank"><span class="chat-link"><i class="fa fa-link"></i> $2</span></a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1"><span class="chat-link"><i class="fa fa-link"></i> $1</span></a>');

    return replacedText;
}

function isUrl(s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
}

function getUserAvatar(obj, display_name){
    if(!display_name){
        if (SETTINGS.display_name_format == 'username') {
            var display_name = obj.user_name;
        }else{
            var display_name = obj.first_name + ' ' + obj.last_name;
        }
    }
    if(obj.avatar) {
        if(isUrl(obj.avatar)){
            var img_src = obj.avatar;
        }else{
            var img_src = "{{MEDIA_URL}}/avatars/"+obj.avatar;
        }
    }else if(display_name && (/[a-zA-Z]/).test(display_name.charAt(0))){
        if( obj.user_type == 3) {
            var img_src = "{{STATIC_URL}}/img/user.png";
        }else{
            var img_src = "{{STATIC_URL}}/img/letters/"+display_name.charAt(0).toUpperCase()+".svg";
        }
    }else{
        var img_src = "{{STATIC_URL}}/img/user.png";
    }
    return img_src;
}

$(document).ready(function() {
    // Initialize summernote wysiwyg editor
    $('.summernote').summernote();
    $(".dob").dateDropdowns();
    $('#dataTable').DataTable({
        stateSave: true
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    //Init lazy Load
    $(function() {
        $('.lazy').Lazy();
    });
    var page_reload = false;

    // Whenever user click on Update button on settings page, call ajax with new settings
    $(".update-settings").on('click', function(e) {
        var update_type = $(this).val();
        var data = new FormData($('#'+$(this).val())[0]);
        data.append("update_type", $(this).val());
        {{ csrf_token }}
        if(update_type == "policy-settings"){
            data.set('terms_and_conditions', $('#terms_and_conditions').summernote('code'));
            data.set('privacy_policy', $('#privacy_policy').summernote('code'));
        }
        if(update_type == "about-settings"){
            data.set('about_us', $('#about_us').summernote('code'));
        }
        $('.settings-success').hide();
        $('.settings-error').hide();
        $.ajax({
            url: "{{ url('ajax-update-settings') }}",
            data: data,
            type: "POST",
            dataType: 'json',
            contentType: false,
            processData: false,
            enctype: 'multipart/form-data',
            beforeSend: function() {
                loading(".card-"+update_type, "show");
            },
            success: function(data) {
                page_reload = true;
                $('.text-error').remove();
                if(data.success) {
                    toastr["success"]("{{_('Successfully Updated')}}");
                }else{
                    $.each( data.message, function( key, field_array ) {
                        $.each( field_array, function( field, error_list ) {
                            $.each( error_list, function( error_key, error_message ) {
                                $('[name='+field+']').after(`<small class="form-text text-danger text-error">`+error_message+`</small>`);
                            });
                        });
                    });
                }
            },complete: function(){
                loading(".card-"+update_type, "hide");
            }
        });

    });

    // Generate image instant previews
    $(document).on("change",".upload-setting-image", function(){
        var uploadFile = $(this);
        var files = !!this.files ? this.files : [];
        if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support

        if (/^image/.test( files[0].type)){ // only image file
            var reader = new FileReader(); // instance of the FileReader
            reader.readAsDataURL(files[0]); // read the local file
            reader.onloadend = function(){ // set image data as background of div
                uploadFile.closest(".row").find(".setting-image-preview").html("");
                uploadFile.closest(".row").find(".setting-image-preview").css("background-image", "url("+this.result+")");

            }
        }
    });

    // Update Chat Room information with ajax
    $(document).on("click", '.admin-update-chatroom', function(event) {
        var data = new FormData($('#admin-chatroom-info')[0]);
        $('.chatroom-success').hide();
        $('.chatroom-error').hide();
        $.ajax({
            url: "{{ url('ajax-update-chatroom') }}",
            data: data,
            type: "POST",
            dataType: 'json',
            contentType: false,
            processData: false,
            enctype: 'multipart/form-data',
            beforeSend: function() {
                loading(".card-room-info", "show");
            },
            success: function(data) {
                $('.text-error').remove();
                if(data.success == "true") {
                    toastr.success(
                        "{{_('Successfully Updated')}}", '',
                        {
                            timeOut: 3000,
                            fadeOut: 3000,
                            onHidden: function () {
                                window.location.href = "{{ url('dashboard-chatroom-list') }}";
                            }
                        }
                    );
                }else{
                    $.each( data.message, function( key, field_array ) {
                        $.each( field_array, function( field, error_list ) {
                            $.each( error_list, function( error_key, error_message ) {
                                $('[name='+field+']').after(`<small class="form-text text-danger text-error">`+error_message+`</small>`);
                            });
                        });
                    });
                }

            },complete: function(){
                loading(".card-room-info", "hide");
            }
        });

        $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {

            $('.chatroom-success').hide();
            $('.chatroom-error').hide();
        });
    });

    // Change cover image of chat room preveiw
    $(document).on("change",".upload-cover-image", function(){
        var uploadFile = $(this);
        var files = !!this.files ? this.files : [];
        if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support

        if (/^image/.test( files[0].type)){ // only image file
            var reader = new FileReader(); // instance of the FileReader
            reader.readAsDataURL(files[0]); // read the local file
            reader.onloadend = function(){ // set image data as background of div
                uploadFile.closest(".row").find(".room-coverimage-preview img").attr("src",this.result);
            }
        }
    });

    // Change bg  image of chat room preveiw
    $(document).on("change",".upload-background-image", function(){
        var uploadFile = $(this);
        var files = !!this.files ? this.files : [];
        if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support

        if (/^image/.test( files[0].type)){ // only image file
            var reader = new FileReader(); // instance of the FileReader
            reader.readAsDataURL(files[0]); // read the local file
            reader.onloadend = function(){ // set image data as background of div
                uploadFile.closest(".row").find(".room-bgimage-preview img").attr("src",this.result);
            }
        }
    });

    // Whenever user click on Update button on social login
    $(document).on("click",".update-social-login", function(e){
        var enable_social_login = $('#enable_social_login').val();
        var update_list = [];
        var delete_list = [];
        $('tr').not('.hidden-row, .delete-row').each(function(){
            var auth_provider = $(this).find('#name').val();
            if(auth_provider){
                var auth_id = $(this).find('#id_key').val();
                var auth_secret = $(this).find('#secret_key').val();
                var auth_status = $(this).find('#status').val();
                var each_auth = [auth_provider, auth_id, auth_secret, auth_status];
                update_list.push(each_auth);
            }
        });

        $('.delete-row').each(function(){
            var auth_provider = $(this).find('#name').val();
            if(auth_provider){
                delete_list.push(auth_provider);
            }
        });

        $.ajax({
            url: "{{ url('ajax-social-login-update') }}",
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                update_list : JSON.stringify(update_list),
                delete_list : JSON.stringify(delete_list),
                enable_social_login : enable_social_login,
            },
            type: "POST",
            dataType: 'json',
            beforeSend: function() {
                loading(".card-social-login-settings", "show");
            },
            success: function(data) {
                $('.text-error').remove();
                if(data.success) {
                    toastr["success"]("{{_('Successfully Updated')}}");
                }else{
                    $.each( data.message, function( key, field_array ) {
                        $.each( field_array, function( field, error_list ) {
                            $.each( error_list, function( error_key, error_message ) {
                                $('[name='+field+']').after(`<small class="form-text text-danger text-error">`+error_message+`</small>`);
                            });
                        });
                    });
                }
            },complete: function(){
                loading(".card-social-login-settings", "hide");
            }
        });

    });

    $(document).on("change",".upload-reaction-icon", function(e){
        var myImageUrl = URL.createObjectURL(e.target.files[0]);
        var myImage = new Image();
        myImage.src = myImageUrl;
        var this_image = this;

        myImage.onload = function(){
            var myCanvas = document.createElement('canvas');
            $(myCanvas).prop('width', this.width).prop('height', this.height);
            var ctx = myCanvas.getContext('2d');
            ctx.drawImage(myImage, 0, 0);
            var mydataURL = myCanvas.toDataURL('image/png');
            $(this_image).parent().parent().find('.reaction-icon').prop('src', mydataURL);
            $(this_image).data('image', mydataURL);
        }
    });

    $(document).on("change",".upload-radio-icon", function(e){
        var myImageUrl = URL.createObjectURL(e.target.files[0]);
        var myImage = new Image();
        myImage.src = myImageUrl;
        var this_image = this;

        myImage.onload = function(){
            var myCanvas = document.createElement('canvas');
            $(myCanvas).prop('width', this.width).prop('height', this.height);
            var ctx = myCanvas.getContext('2d');
            ctx.drawImage(myImage, 0, 0);
            var mydataURL = myCanvas.toDataURL('image/jpg');
            $(this_image).parent().parent().find('.radio-icon').prop('src', mydataURL);
            $(this_image).data('image', mydataURL);
        }
    });

    // Whenever user click on Update button on social login
    $(document).on("click", ".update-radio", function(e){
        var enable_radio = $('#enable_radio').val();
        var update_list = [];
        var delete_list = [];
        $('tr').not('.hidden-row, .delete-row').each(function(){
            var radio_station_name = $(this).find('#name').val();
            if(radio_station_name){
                var id = $(this).find('#id').val();
                var description = $(this).find('#description').val();
                var source = $(this).find('#source').val();
                var status = $(this).find('#status').val();
                var data_image = $(this).find(".upload-radio-icon").data('image');
                var each_station = {id, radio_station_name, description, source, status, data_image};
                update_list.push(each_station);
            }
        });

        $('.delete-row').each(function(){
            var radio_station = $(this).find('#id').val();
            if(radio_station){
                delete_list.push(radio_station);
            }
        });

        var formData = new FormData();
        formData.append('csrftoken', '{{ csrf_token_ajax() }}');
        formData.append('update_list', JSON.stringify(update_list));
        formData.append('delete_list', JSON.stringify(delete_list));
        formData.append('radio', enable_radio);

        $.ajax({
            url: "{{ url('ajax-radio-update') }}",
            data: formData,
            contentType: false,
            processData: false,
            cache: false,
            type: "POST",
            dataType: 'json',
            beforeSend: function() {
                loading(".card-radio-settings", "show");
            },
            success: function(data) {
                $('.text-error').remove();
                if(data.success) {
                    toastr.success(
                        "{{_('Successfully updated')}}", '',
                        {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        }
                    );
                }else{
                    $.each( data.message, function( key, field_array ) {
                        $.each( field_array, function( field, error_list ) {
                            $.each( error_list, function( error_key, error_message ) {
                                $('[name='+field+']').after(`<small class="form-text text-danger text-error">`+error_message+`</small>`);
                            });
                        });
                    });
                }
            },complete: function(){
                loading(".card-radio-settings", "hide");
            }
        });

    });

    // Update already created chat room
    $(document).on("click", ".edit-chatroom, .new-chatroom", function(){
        var edit_id = $(this).attr("data-edit-id");
        $.ajax({
            url: "{{ url('ajax-get-chatroom') }}",
            data: {
                edit_room: edit_id,
                csrftoken: '{{ csrf_token_ajax() }}'
            },
            type: "POST",
            beforeSend: function() {
                loading(".card-room-users", "show");
            },
            success: function(data) {
                $('.rooms-modal .modal-body').html(data);
                $('.rooms-modal').modal('show');
                $('#dataTable').DataTable();
            },
            complete: function(){
                loading(".card-room-users", "hide");
            }
        });
    });

    // delete chatroom
    $(document).on('click', '.delete-chatroom', function(e) {
        var room_id = this.id;
        if (confirm('{{_("Are you sure you want to delete this room? This action can not be undone.")}}')) {
            $.ajax({
                url: "{{ url('ajax-delete-chatroom') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    room_id: room_id
                },
                beforeSend: function() {
                    loading(".card-room-list","show");
                },
                success: function(data) {
                    if(data.success){
                        toastr["success"]("{{_('Successfully deleted')}}");
                        $('#dataTable').DataTable().row($('#'+room_id).closest('tr')).remove().draw();
                    }
                },complete: function(){
                    loading(".card-room-list","hide");
                }

            });
        }
    });

    // delete chats
    $(document).on('click', '.delete-chats', function(e) {
        var room_id = this.id;
        if (confirm('{{_("Are you sure you want to delete all chats on this room? This action can not be undone.")}}')) {
            $.ajax({
                url: "{{ url('ajax-delete-chats') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    room_id: room_id
                },
                beforeSend: function() {
                    loading(".card-room-list","show");
                },
                success: function(data) {
                    if(data.success){
                        toastr["success"]("{{_('Successfully deleted')}}");
                    }
                },complete: function(){
                    loading(".card-room-list","hide");
                }

            });
        }
    });

    // Update and manage users in chat rooms (kick and unkick)
    $(document).on("click", ".chatroom-user-restriction", function(){
        var result = confirm("Are you sure?");
        if (result) {
            var current_row = $(this).closest('tr');
            var room_id = $(this).attr("data-room");
            var selected_user = $(this).attr("data-user");
            var restriction_type = $(this).attr("data-restriction-type");
            $.ajax({
                url: "{{ url('ajax-chatroom-user-restriction') }}",
                data: {room_id : room_id, selected_user : selected_user, restriction_type : restriction_type,
                csrftoken: '{{ csrf_token_ajax() }}'
                },
                type: "POST",
                beforeSend: function() {
                    loading(".card-room-users", "show");
                },
                success: function(data) {
                    if(restriction_type == "3"){
                        $(current_row).find('.kick-btn').css("display", "none");
                        $(current_row).find('.unkick-btn').css("display", "inline-block");
                    }else if (restriction_type == "1") {
                        $(current_row).find('.kick-btn').css("display", "inline-block");
                        $(current_row).find('.unkick-btn').css("display", "none");
                    }

                    if(data.success == "true") {
                        $('.chatroom-success').html(data.message);
                        $('.chatroom-success').show();
                    }else{
                        $('.chatroom-error').html(data.message);
                        $('.chatroom-error').show();
                    }
                },
                complete: function(){
                    loading(".card-room-users", "hide");
                }
            });
        }
    });

    // Whenever user click on Update button on language page, call ajax with new settings
    $(document).on("click", ".update-language", function(){
        var data = new FormData($('#language-form')[0]);
        $('.language-error').hide();
        $.ajax({
            url: "{{ url('ajax-language-update') }}",
            data: data,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function() {
                loading(".card-language", "show");
            },
            success: function(data) {
                page_reload = true;
                $('.text-error').remove();
                if(data.success) {
                    toastr.success(
                        "{{_('Successfully Updated')}}", '',
                        {
                            timeOut: 3000,
                            fadeOut: 3000,
                            onHidden: function () {
                                window.location.href = "{{ url('dashboard-languages') }}";
                            }
                        }
                    );
                }else{
                    $.each( data.message, function( key, field_array ) {
                        $.each( field_array, function( field, error_list ) {
                            $.each( error_list, function( error_key, error_message ) {
                                $('[name='+field+']').after(`<small class="form-text text-danger text-error">`+error_message+`</small>`);
                            });
                        });
                    });
                }
            },complete: function(){
                loading(".card-language", "hide");
            }
        });

    });

    // Whenever user click on Update translation on translation page
    $(document).on("click", ".update-translation", function(){
        var data = new FormData($('#lang-translation')[0]);
        $.ajax({
            url: "{{ url('ajax-update-translation') }}",
            data: data,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function() {
                loading(".card-language", "show");
            },
            success: function(data) {
                page_reload = true;
                $('.text-error').remove();
                if(data.success) {
                    toastr.success(
                        "{{_('Successfully Updated')}}", '',
                        {
                            timeOut: 3000,
                            fadeOut: 3000,
                        }
                    );
                }else{
                    if ($.isArray(data.message)) {
                        $.each( data.message, function( key, field_array ) {
                            $.each( field_array, function( field, error_list ) {
                                $.each( error_list, function( error_key, error_message ) {
                                    $('[name='+field+']').after(`<small class="form-text text-danger text-error">`+error_message+`</small>`);
                                });
                            });
                        });
                    } else {
                        toastr["warning"](data.message);
                    }
                }
            },complete: function(){
                loading(".card-language", "hide");
            }
        });

    });

    // Update and manage users in chat rooms (kick and unkick)
    $(document).on("click", ".delete-language", function(){
        var result = confirm("Are you sure?");
        if (result) {
            var lang = $(this).attr("data-lang");
            $.ajax({
                url: "{{ url('ajax-language-delete') }}",
                data: {lang : lang, csrftoken: '{{ csrf_token_ajax() }}'},
                type: "POST",
                beforeSend: function() {
                    loading(".card-language-list", "show");
                },
                success: function(data) {
                    if(data.success == true) {
                        toastr.success(
                            "{{_('Successfully deleted')}}", '',
                            {
                                timeOut: 3000,
                                fadeOut: 3000,
                                onHidden: function () {
                                    window.location.href = "{{ url('dashboard-languages') }}";
                                }
                            }
                        );
                    }else{
                        $('.language-error').html(data.message);
                        $('.language-error').show();
                    }
                },
                complete: function(){
                    loading(".card-language-list", "hide");
                }
            });
        }
    });

    $(document).on('change', '#is_protected', function() {
        if(this.checked) {
            $('.pin-area').show();
            $('.public-view-area').hide();
        }else{
            $('.pin-area').hide();
            $('.public-view-area').show();
        }
    });

    $(document).on('change', '#user_list_type', function() {
        if($(this).val() == 3) {
            $('.user-list-auth-roles').show();
        }else{
            $('.user-list-auth-roles').hide();
        }
    });

    $(document).on('change', '#single_room_mode', function() {
        if($(this).val() == 1) {
            $('.default-room-area').show();
        }else{
            $('.default-room-area').hide();
        }
    });

    $(document).on('change', '#enable_terms', function() {
        if($(this).val() == 1) {
            $('.enable-terms-area').show();
        }else{
            $('.enable-terms-area').hide();
        }
    });

    $(document).on('change', '#enable_privacy', function() {
        if($(this).val() == 1) {
            $('.enable-privacy-area').show();
        }else{
            $('.enable-privacy-area').hide();
        }
    });

    $(document).on('change', '#enable_about', function() {
        if($(this).val() == 1) {
            $('.enable-about-area').show();
        }else{
            $('.enable-about-area').hide();
        }
    });

    $(document).on('change', '#profanity_filter', function() {
        if($(this).val() == 1) {
            $('.enable-profanity-area').show();
        }else{
            $('.enable-profanity-area').hide();
        }
    });

    $(document).on('change', '#enable_files', function() {
        if($(this).val() == 1) {
            $('.enable-filelist-area').show();
        }else{
            $('.enable-filelist-area').hide();
        }
    });

    $(document).on('change', '#domain_filter', function() {
        if($(this).val() == 1) {
            $('.domain-filter-area').show();
        }else{
            $('.domain-filter-area').hide();
        }
    });

    $(document).on('change', '#sso_enabled', function() {
        if($(this).val() == 1) {
            $('.sso-setting-area').show();
        }else{
            $('.sso-setting-area').hide();
        }
    });

    $(document).on('change', '#cloud_storage', function() {
        if($(this).val() == 1) {
            $('.cloud-storage-area').show();
        }else{
            $('.cloud-storage-area').hide();
        }
    });

    $(document).on('change', '#video_calling', function() {
        if($(this).val() == 1) {
            $('.video-calling-area').show();
            var provider = $('#video_calling_provider').val();
            $('.video-settings').hide();
            $('.'+provider+'-settings').show();
        }else{
            $('.video-calling-area').hide();
        }
    });

    $(document).on('change', '#video_calling_provider', function() {
        $('.video-settings').hide();
        var provider = $(this).val();
        $('.'+provider+'-settings').show();
    });

    $(document).on('change', '#hide_chat_list', function() {
        if($(this).val() == 1) {
            $('.chat-list-setting-area').hide();
        }else{
            $('.chat-list-setting-area').show();
        }
    });
    
    $(document).on('change', '.auth-provider-name', function() {
        var selected_auth_src = "{{ STATIC_URL }}/img/auth_icons/"+$(this).val()+".png";
        $(this).parent().parent().find('.auth-provider-icon').attr('src', selected_auth_src);
    });

    $(document).on('change', '#enable_contact', function() {
        if($(this).val() == 1) {
            $('.enable-contact-area').show();
        }else{
            $('.enable-contact-area').hide();
        }
    });

    $(document).on('change', '#cookie_consent_popup', function() {
        if($(this).val() == 1) {
            $('.cookie-message-area').show();
        }else{
            $('.cookie-message-area').hide();
        }
    });

    $(document).on('change', '#theme', function() {
        if($(this).val() == 'custom') {
            $('.custom-colors').show();
        }else{
            $('.custom-colors').hide();
        }
    });

    $(document).on('change', '#push_notifications', function() {
        if($(this).val() == 1) {
            $('.push-notification-area').show();
        }else{
            $('.push-notification-area').hide();
        }
    });

    $(document).on('change', '#pwa_enabled', function() {
        if($(this).val() == 1) {
            $('.enable-pwa-area').show();
        }else{
            $('.enable-pwa-area').hide();
        }
    });

    $(document).on('change', '#enable_social_login', function() {
        if($(this).val() == 1) {
            $('.enable-social-login-area').show();
        }else{
            $('.enable-social-login-area').hide();
        }
    });

    $(document).on('change', '#enable_radio', function() {
        if($(this).val() == 1) {
            $('.enable-radio-area').show();
        }else{
            $('.enable-radio-area').hide();
        }
    });

    $(document).on('change', '#enable_recaptcha', function() {
        if($(this).val() == 1) {
            $('.recaptcha-area').show();
        }else{
            $('.recaptcha-area').hide();
        }
    });

    $(document).on('change', '#recaptcha_version', function() {
        if($(this).val() == 3) {
            $('.recaptcha_v3_pass_score_area').show();
        }else{
            $('.recaptcha_v3_pass_score_area').hide();
        }
    });

    $(document).on('change', '#reg_autodetect_country', function() {
        if($(this).val() == 1) {
            $('.geoip_api_endpoint_area').show();
        }else{
            $('.geoip_api_endpoint_area').hide();
        }
    });

    $(document).on('change', '#enable_ip_blacklist', function() {
        if($(this).val() == 1) {
            $('.ip-blacklist-area').show();
        }else{
            $('.ip-blacklist-area').hide();
        }
    });

    $(document).on('change', '#enable_multiple_languages', function() {
        $('.update-settings').click();
    });

    $(document).on('change', '#push_provider', function() {
        $('.push-provider-area').hide();
        $('.'+$(this).val()+'-area').show();
    });

    $(document).on('change', '.trans-lang-switch, .trans-section-switch', function() {
        var lang = $('.trans-lang-switch').val();
        var section = $('.trans-section-switch').val();
        window.location.href = "{{ url('dashboard-language-translation') }}?lang="+lang+"&section="+section;
    });

    $(document).on('change', '.check_all', function() {
        $('.user-selection, .check_all').prop('checked', this.checked);
    });

    $(document).on('click', '.delete-user', function(e) {
        var selected = $(this).attr('data-id');
        $('#'+selected).prop('checked', 'checked');
        $(".delete-selected-user").trigger("click");
    });

    $(document).on('click', '.delete-selected-user', function(e) {
        var result = confirm("Are you sure?");
        if (result) {
            var data = new FormData($('#user-list')[0]);
            var url = "{{url('ajax-delete-users')}}";
            $.ajax({
                url: url,
                data: data,
                type: "POST",
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false,
                success: function(data) {
                    if (data.success == true) {
                        toastr.success(
                            "{{_('Successfully deleted')}}", '',
                            {
                                timeOut: 1500,
                                fadeOut: 1500,
                                onHidden: function () {
                                    window.location.reload();
                                }
                            }
                        );
                    } else {
                        toastr["error"]("{{_('Something went wrong')}}");
                    }
                },
            });
        }
    });

    $('.color-picker').on('input', function() {
        $(this).siblings("input[type=text]").val($(this).val());
    });

    $('.color-input').on('input', function() {
        $(this).siblings('.color-picker').val($(this).val());
    });

    $(".save-profile").on('click', function(e) {
        var data = new FormData($('#profile-form')[0]);
        var url = "{{url('ajax-save-profile')}}";
        $('.profile-error').hide();
        $.ajax({
            url: url,
            data: data,
            type: "POST",
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
            enctype: 'multipart/form-data',
            success: function(data) {

                $('.text-error').remove();
                if (data.success == true) {
                    toastr["success"]("{{_('Successfully Updated')}}");
                } else {
                    if ($.isArray(data.message)) {
                        $.each(data.message, function(key, field_array) {
                            $.each(field_array, function(field, error_list) {
                                $.each(error_list, function(error_key, error_message) {
                                    $('[name=' + field + ']').after(`<small class="form-text text-danger text-error">` + error_message + `</small>`);
                                });
                            });
                        });
                    } else {
                        $('.profile-error').html(data.message);
                        $('.profile-error').show();
                    }
                }
            },
        });
    });

    $(".add-profile").on('click', function(e) {
        var data = new FormData($('#profile-form')[0]);
        var url = "{{url('ajax-add-profile')}}";
        $('.profile-error').hide();
        $.ajax({
            url: url,
            data: data,
            type: "POST",
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
            enctype: 'multipart/form-data',
            success: function(data) {

                $('.text-error').remove();
                if (data.success == true) {
                    toastr.success(
                        "{{_('Successfully added')}}", '',
                        {
                            timeOut: 3000,
                            fadeOut: 3000,
                            onHidden: function () {
                                window.location.href = "{{ url('dashboard-user-list') }}";
                            }
                        }
                    );
                } else {
                    if ($.isArray(data.message)) {
                        $.each(data.message, function(key, field_array) {
                            $.each(field_array, function(field, error_list) {
                                $.each(error_list, function(error_key, error_message) {
                                    $('[name=' + field + ']').after(`<small class="form-text text-danger text-error">` + error_message + `</small>`);
                                });
                            });
                        });
                    } else {
                        $('.profile-error').html(data.message);
                        $('.profile-error').show();
                    }
                }
            },
        });
    });


    // profile image upload
    $(document).on("change", ".upload-image", function() {
        var uploadFile = $(this);
        var files = !!this.files ? this.files : [];
        if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support

        if (/^image/.test(files[0].type)) { // only image file
            var reader = new FileReader(); // instance of the FileReader
            reader.readAsDataURL(files[0]); // read the local file
            reader.onloadend = function() { // set image data as background of div
                uploadFile.closest(".imgUp").find('.imagePreview').html("");
                uploadFile.closest(".imgUp").find('.imagePreview').css("background-image", "url(" + this.result + ")");
            }
        }
    });

    $(document).on("click", ".add-new-auth-provider", function() {
        var $tr = $('.hidden-row').clone();
        $tr.removeClass('hidden-row');
        $('.auth-provider-list').append($tr);
    });

    $(document).on("click", ".delete-auth-provider", function() {
        $(this).closest('tr').addClass('delete-row');
    });

    $(document).on("click", ".add-new-radio", function() {
        var $tr = $('.hidden-row').clone();
        $tr.removeClass('hidden-row');
        $('.radio-list').append($tr);
    });

    $(document).on("click", ".delete-radio", function() {
        $(this).closest('tr').addClass('delete-row');
    });

    $('.select2').select2({
        theme: 'bootstrap4'
    });

    // Update and manage users in chat rooms (kick and unkick)
    $(document).on("click", ".chatroom-user-mod", function(){
        var result = confirm("Are you sure?");
        if (result) {
            var current_row = $(this).closest('tr');
            var room_id = $('#room_id').val();
            var selected_user = $(this).attr("data-user");
            var mod_type = $(this).attr("data-mod-type");
            $.ajax({
                url: "{{ url('ajax-chatroom-user-mod') }}",
                data: {
                    room_id : room_id,
                    selected_user : selected_user,
                    mod_type: mod_type,
                    csrftoken: '{{ csrf_token_ajax() }}'
                },
                type: "POST",
                beforeSend: function() {
                    loading(".card-room-users", "show");
                },
                success: function(data) {
                    if(mod_type == "1"){
                        $(current_row).find('.add-mod').css("display", "none");
                        $(current_row).find('.remove-mod').css("display", "inline-block");
                    }else if (mod_type == "0") {
                        $(current_row).find('.add-mod').css("display", "inline-block");
                        $(current_row).find('.remove-mod').css("display", "none");
                    }

                    if(data.success == "true") {
                        toastr["success"](data.message);
                    }else{
                        toastr["error"](data.message);
                    }
                },
                complete: function(){
                    loading(".card-room-users", "hide");
                }
            });
        }
    });

    // Update already created chat room
    $(document).on("click", ".flaged-view", function(){
        var flaged_id = $(this).attr("data-id");
        $.ajax({
            url: "{{ url('dashboard-flaged-view') }}",
            data: {
                flaged_id: flaged_id,
                csrftoken: '{{ csrf_token_ajax() }}'
            },
            type: "POST",
            beforeSend: function() {
                loading(".flaged-view-html", "show");
            },
            success: function(data) {
                if(data.report_type == 1){
                    var message_preview = messagePreview(data.flaged_for);
                    if(data.chat_type == 1){
                        if(data.flaged_for.user_1 == data.reported_by){
                            var to_user = data.flaged_for.user_2;
                        }else{
                            var to_user = data.flaged_for.user_1;
                        }
                        var chat_with = '&chat-with='+to_user;
                    }else{
                        var chat_with = "";
                    }
                     
                    var chat_view = ` <a class="btn btn-xs btn-success" onclick="window.open('{{  url('chat-room', {'chatroomslug':'`+data.flaged_for.slug+`'}) }}?view-as=`+data.reported_by+`&view-chat=`+data.flaged_for.id+chat_with+`','popUpWindow','height=768,width=1024,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes');" href="javascript:void(0)"  data-toggle="tooltip" data-placement="top" title="View Chats"  >
                                            {{_("View", 2)}}
                                        </a>`;
                    var report_section = message_preview + chat_view;

                    if(data.flaged_for.status == 3){
                        var delete_btn = ' <a href="javascript:void(0)" class="btn btn-sm btn-success disable" data-toggle="tooltip" data-placement="top" title="{{_("Message Deleted")}}" >'
                                            +'{{_("Message Deleted", 2)}}'
                                        +'</a>';
                    }else{
                        var delete_btn = ' <a href="javascript:void(0)" class="btn btn-sm btn-danger flaged-delete-chat" data-id="'+data.flaged_for.id+'" data-chat-type="'+data.chat_type+'" data-toggle="tooltip" data-placement="top" title="{{_("Delete Message")}}" >'
                                            +'{{_("Delete Message", 2)}}'
                                        +'</a>';
                    }
                }else if(data.report_type == 2){
                    var user_view = ' <a class="btn btn-xs btn-success" target="_blank" href="{{  url("dashboard-user-view") }}?user='+data.flaged_for.id+'"  data-toggle="tooltip" data-placement="top" title="{{_("View User")}}" >'
                                        +'{{_("View", 2)}}'
                                    +'</a>';
                    var report_section = data.flaged_for.first_name + " " + data.flaged_for.last_name + user_view;
                    if(data.flaged_for.available_status == 2){
                        var delete_btn = ' <a href="javascript:void(0)" class="btn btn-sm btn-success disable" data-toggle="tooltip" data-placement="top" title="{{_("User Deactivated")}}" >'
                                            +'{{_("User Deactivated", 2)}}'
                                        +'</a>';
                    }else{
                        var delete_btn = ' <a  href="javascript:void(0)" class="btn btn-sm btn-danger flaged-delete-user" data-id="'+data.flaged_for.id+'" data-toggle="tooltip" data-placement="top" title="{{_("Deactivate User")}}" >'
                                            +'{{_("Deactivate User", 2)}}'
                                        +'</a>';
                    }
                    
                }else if(data.report_type == 3){
                    var room_view = ' <a class="btn btn-xs btn-success" target="_blank" href="{{  url("dashboard-chatroom-edit") }}?edit_room='+data.flaged_for.id+'"  data-toggle="tooltip" data-placement="top" title="{{_("View Room")}}" >'
                                        +'{{_("View", 2)}}'
                                    +'</a>';
                    var report_section = data.flaged_for.name + room_view;
                    if(data.flaged_for.status == 2){
                        var delete_btn = ' <a href="javascript:void(0)" class="btn btn-sm btn-success disable" data-toggle="tooltip" data-placement="top" title="{{_("Room Deactivated")}}" >'
                                            +'{{_("Room Deactivated", 2)}}'
                                        +'</a>';
                    }else{
                        var delete_btn = ' <a href="javascript:void(0)" class="btn btn-sm btn-danger flaged-delete-room" data-id="'+data.flaged_for.id+'" data-toggle="tooltip" data-placement="top" title="{{_("Deactivate Room")}}" >'
                                            +'{{_("Deactivate Room", 2)}}'
                                        +'</a>';
                    }
                }else if(data.report_type == 4){
                    var report_section = data.flaged_for.name;
                    var delete_btn = "";
                }else{
                    var report_section = "";
                    var delete_btn = "";
                }

                if(data.status == 2){
                    var solve_btn = ' <a href="javascript:void(0)" class="btn btn-sm btn-info disable" data-toggle="tooltip" data-placement="top" title="{{_("Solved")}}" >'
                                        +'{{_("Solved", 2)}}'
                                    +'</a>';
                }else{
                    var solve_btn = ' <a href="javascript:void(0)" class="btn btn-sm btn-primary flaged-resolve" data-flaged-id="'+data.id+'" data-toggle="tooltip" data-placement="top" title="{{_("Resolve")}}" >'
                                        +'{{_("Resolve", 2)}}'
                                    +'</a>';
                }

                $('.report-section-title').html(data.report_type_text);
                $('.report-section').html(report_section);
                $('.report-reason').html(data.report_reason_title);
                $('.report-comment').html(data.report_comment);
                $('.report-flaged-by').html(data.first_name + " " + data.last_name);
                $('.report-flaged-at').html(data.reported_at);
                $('.flaged-deactive').html(delete_btn);
                $('.flaged-solve').html(solve_btn);
                $('.report-head').html("#" + data.id + " - " + data.report_type_text + " " + "{{_('Flaged', 2)}}");
                $('.flaged-view-html').show();
            },
            complete: function(){
                loading(".flaged-view-html", "hide");
            }
        });
    });

    $(document).on("click", ".flaged-delete-chat", function(){
        if (confirm('{{_("Are you sure?", 2)}}')) {
            var chat_id = $(this).data('id');
            var chat_type = $(this).data('chat-type');
            if(chat_type == 1){
                chat_type = "private";
            }else{
                chat_type = "group";
            }

            $.ajax({
                url: "{{ url('ajax-delete-message') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    message_id: chat_id,
                    chat_type: chat_type
                },
                beforeSend: function() {
                    loading(".flaged-delete-chat","show");
                },
                success: function(data) {
                    if(data.success){
                        $('.flaged-delete-chat').addClass('btn-success').addClass('disable').removeClass('btn-danger');
                        $('.flaged-delete-chat').html('{{_("Message Deleted", 2)}}');
                        $('.flaged-delete-chat').attr('title', '{{_("Message Deleted", 2)}}');
                    }else{
                        toastr.error(data.message);
                    }
                },complete: function(){
                    loading(".flaged-delete-chat","hide");
                }

            });
        }
    });

    $(document).on("click", ".flaged-delete-user", function(){
        if (confirm('{{_("Are you sure?", 2)}}')) {
            var user_id = $(this).data('id');

            $.ajax({
                url: "{{ url('ajax-deactivate-user') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    user_id: user_id
                },
                beforeSend: function() {
                    loading(".flaged-delete-user","show");
                },
                success: function(data) {
                    if(data.success){
                        $('.flaged-delete-user').addClass('btn-success').addClass('disable').removeClass('btn-danger');
                        $('.flaged-delete-user').html('{{_("User Deactivated", 2)}}');
                        $('.flaged-delete-user').attr('title', '{{_("User Deactivated", 2)}}');
                    }else{
                        toastr.error(data.message);
                    }
                },complete: function(){
                    loading(".flaged-delete-user","hide");
                }

            });
        }
    });

    $(document).on("click", ".flaged-delete-room", function(){
        if (confirm('{{_("Are you sure?", 2)}}')) {
            var room_id = $(this).data('id');

            $.ajax({
                url: "{{ url('ajax-deactivate-room') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    room_id: room_id
                },
                beforeSend: function() {
                    loading(".flaged-delete-room","show");
                },
                success: function(data) {
                    if(data.success){
                        $('.flaged-delete-room').addClass('btn-success').addClass('disable').removeClass('btn-danger');
                        $('.flaged-delete-room').html('{{_("Room Deactivated", 2)}}');
                        $('.flaged-delete-room').attr('title', '{{_("Room Deactivated", 2)}}');
                    }else{
                        toastr.error(data.message);
                    }
                },complete: function(){
                    loading(".flaged-delete-room","hide");
                }

            });
        }
    });

    $(document).on("click", ".flaged-resolve", function(){
        if (confirm('{{_("Are you sure?", 2)}}')) {
            var flaged_id = $(this).data('flaged-id');

            $.ajax({
                url: "{{ url('dashboard-flaged-resolve') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    flaged_id: flaged_id
                },
                beforeSend: function() {
                    loading(".flaged-resolve","show");
                },
                success: function(data) {
                    if(data.success){
                        $('.flaged-resolve').addClass('btn-info').addClass('disable').removeClass('btn-primary');
                        $('.flaged-resolve').html('{{_("Solved", 2)}}');
                        $('.flaged-resolve').attr('title', '{{_("Solved", 2)}}');

                        $('.flaged-'+flaged_id).addClass('badge-primary').removeClass('badge-danger');
                        $('.flaged-'+flaged_id).html('{{_("Solved", 2)}}');
                        
                    }else{
                        toastr.error(data.message);
                    }
                },complete: function(){
                    loading(".flaged-resolve","hide");
                }

            });
        }
    });

    // remove chat room bg
    $(document).on("click", '.room-bgimage-remove', function() {
        var room_id = $('#room_id').val();
        $.ajax({
            url: "{{ url('ajax-chatroom-remove-bg') }}",
            data: {
                room_id : room_id,
                csrftoken: '{{ csrf_token_ajax() }}'
            },
            type: "POST",
            success: function(data) {
                if(data.success){
                    toastr.success(data.message);
                    $('#background_image').val('');
                    $('.room-bgimage-preview img').attr('src', "{{STATIC_URL}}/img/chatbg.png");
                }else{
                    toastr.error(data.message);
                }
            }
        });
    });

    // remove setting
    $(document).on("click", '.remove-setting', function(e) {
        e.preventDefault();
        if (confirm('{{_("Are you sure?", 2)}}')) {
            var setting = $(this).data('setting');
            if (setting) {
                $.ajax({
                    url: "{{ url('ajax-remove-setting') }}",
                    data: {
                        setting : setting,
                        csrftoken: '{{ csrf_token_ajax() }}'
                    },
                    type: "POST",
                    success: function(data) {
                        if(data.success){
                            toastr.success(
                                "{{_('Successfully updated')}}", '',
                                {
                                    timeOut: 1000,
                                    fadeOut: 1000,
                                    onHidden: function () {
                                        window.location.reload();
                                    }
                                }
                            );
                            
                        }else{
                            toastr.error(
                                data.message, '',
                                {
                                    timeOut: 1000,
                                    fadeOut: 1000,
                                    onHidden: function () {
                                        window.location.reload();
                                    }
                                }
                            );
                        }
                    }
                });
            }
        }
    });

    //check user type
    window.setInterval(function(){
        $.ajax({
            url: "{{ url('dashboard-check-user-type') }}",
            data: {
                csrftoken: '{{ csrf_token_ajax() }}'
            },
            type: "POST",
            error: function(){
                toastr.error(
                    "{{_('Access has been revoked')}}", '',
                    {
                        timeOut: 1500,
                        fadeOut: 1500,
                        onHidden: function () {
                            window.location.href = "{{ url('logout') }}";
                        }
                    }
                );
            }
        });
    }, 5000);

    
    $(".save-page").on('click', function(e) {
        var data = new FormData($('#add-new-page')[0]);
        $.ajax({
            url: "{{url('dashboard-ajax-save-page')}}",
            data: data,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function() {
                loading(".new-page-row", "show");
            },
            success: function(data) {
                $('.text-error').remove();

                if (data.success == true) {
                    if(data.update){
                        toastr.success(
                            "{{_('Successfully Updated')}}", '',
                            {
                                timeOut: 3000,
                                fadeOut: 3000,
                            }
                        );
                    }else{
                        toastr.success(
                            "{{_('Successfully Added')}}", '',
                            {
                                timeOut: 3000,
                                fadeOut: 3000,
                                onHidden: function () {
                                    window.location.href = "{{ url('dashboard-pages') }}";
                                }
                            }
                        );
                    }
                    
                    
                } else {
                    if ($.isArray(data.message)) {
                        $.each(data.message, function(key, field_array) {
                            $.each(field_array, function(field, error_list) {
                                $.each(error_list, function(error_key, error_message) {
                                    $('[name=' + field + ']').after(`<small class="form-text text-danger text-error">` + error_message + `</small>`);
                                });
                            });
                        });
                    } else {
                        toastr["warning"](data.message);
                    }
                }
            },
            complete: function(){
                loading(".new-page-row", "hide");
            }
        });
    });

    $(document).on('change', '#custom_menus', function() {
        if($(this).val() == 1) {
            $('.enable-menu-area').show();
        }else{
            $('.enable-menu-area').hide();
        }
    });

    
    $(document).on("click", ".add-new-menu", function() {
        var $tr = $('.hidden-row').clone();
        $tr.removeClass('hidden-row');
        $('.menu-list').append($tr);
    });

    $(document).on("click", ".delete-menu", function() {
        $(this).closest('tr').addClass('delete-row');
    });

    // Whenever user click on Update button on social login
    $(document).on("click", ".update-menu", function(e){
        var custom_menus = $('#custom_menus').val();
        var update_list = [];
        var delete_list = [];
        $('tr').not('.hidden-row, .delete-row').each(function(){
            var title = $(this).find('#title').val();
            if(title){
                var id = $(this).find('#id').val();
                var permalink = $(this).find('#permalink').val();
                var menu_order = $(this).find('#menu_order').val();
                var target = $(this).find('#target').val();
                var icon_class = $(this).find('#icon_class').val();
                var css_class = $(this).find('#css_class').val();
                var status = $(this).find('#status').val();
                var members_only = $(this).find('#members_only').val();
                var each_menu = {id, title, permalink, menu_order, target, icon_class, css_class, members_only, status};
                update_list.push(each_menu);
            }
        });

        $('.delete-row').each(function(){
            var menu = $(this).find('#id').val();
            if(menu){
                delete_list.push(menu);
            }
        });

        var formData = new FormData();
        formData.append('csrftoken', '{{ csrf_token_ajax() }}');
        formData.append('update_list', JSON.stringify(update_list));
        formData.append('delete_list', JSON.stringify(delete_list));
        formData.append('custom_menus', custom_menus);

        $.ajax({
            url: "{{ url('dashboard-ajax-menu-update') }}",
            data: formData,
            contentType: false,
            processData: false,
            cache: false,
            type: "POST",
            dataType: 'json',
            beforeSend: function() {
                loading(".card-menu-settings", "show");
            },
            success: function(data) {
                $('.text-error').remove();
                if(data.success) {
                    toastr.success(
                        "{{_('Successfully updated')}}", '',
                        {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        }
                    );
                }else{
                    $.each( data.message, function( key, field_array ) {
                        $.each( field_array, function( field, error_list ) {
                            $.each( error_list, function( error_key, error_message ) {
                                $('[name='+field+']').after(`<small class="form-text text-danger text-error">`+error_message+`</small>`);
                            });
                        });
                    });
                }
            },complete: function(){
                loading(".card-menu-settings", "hide");
            }
        });

    });

    $(document).on('click', '.delete-page', function(e) {
        var page_id = this.id;
        if (confirm('{{_("Are you sure you want to delete this page? This action can not be undone.")}}')) {
            $.ajax({
                url: "{{ url('dashboard-ajax-delete-page') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    page_id: page_id
                },
                beforeSend: function() {
                    loading(".card-pages-list","show");
                },
                success: function(data) {
                    if(data.success){
                        toastr["success"]("{{_('Successfully deleted')}}");
                        $('#dataTable').DataTable().row($('#page-'+page_id)).remove().draw();
                    }
                },complete: function(){
                    loading(".card-pages-list","hide");
                }

            });
        }
    });

    $(document).on('change', '#enable_badges', function() {
        if($(this).val() == 1) {
            $('.enable-badge-area').show();
        }else{
            $('.enable-badge-area').hide();
        }
    });

    $(document).on("click", ".add-new-badge", function() {
        var $tr = $('.hidden-row').clone();
        $tr.removeClass('hidden-row');
        $('.badge-list').append($tr);
    });


    // Whenever user click on Update button on badge page
    $(document).on("click", ".update-badge", function(e){
        var enable_badges = $('#enable_badges').val();
        var update_list = [];
        var delete_list = [];
        $('tr').not('.hidden-row, .delete-row').each(function(){
            var badge_name = $(this).find('#name').val();
            if(badge_name){
                var id = $(this).find('#id').val();
                var status = $(this).find('#status').val();
                var data_image = $(this).find(".upload-badge-icon").data('image');
                var each_badge = {id, badge_name, status, data_image};
                update_list.push(each_badge);
            }
        });

        $('.delete-row').each(function(){
            var badge_to_del = $(this).find('#id').val();
            if(badge_to_del){
                delete_list.push(badge_to_del);
            }
        });

        var formData = new FormData();
        formData.append('csrftoken', '{{ csrf_token_ajax() }}');
        formData.append('update_list', JSON.stringify(update_list));
        formData.append('delete_list', JSON.stringify(delete_list));
        formData.append('enable_badges', enable_badges);

        $.ajax({
            url: "{{ url('dashboard-ajax-badges-update') }}",
            data: formData,
            contentType: false,
            processData: false,
            cache: false,
            type: "POST",
            dataType: 'json',
            beforeSend: function() {
                loading(".card-badge-settings", "show");
            },
            success: function(data) {
                $('.text-error').remove();
                if(data.success) {
                    toastr.success(
                        "{{_('Successfully updated')}}", '',
                        {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        }
                    );
                }else{
                    $.each( data.message, function( key, field_array ) {
                        $.each( field_array, function( field, error_list ) {
                            $.each( error_list, function( error_key, error_message ) {
                                $('[name='+field+']').after(`<small class="form-text text-danger text-error">`+error_message+`</small>`);
                            });
                        });
                    });
                }
            },complete: function(){
                loading(".card-badge-settings", "hide");
            }
        });

    });

    $(document).on("change",".upload-badge-icon", function(e){
        var myImageUrl = URL.createObjectURL(e.target.files[0]);
        var myImage = new Image();
        myImage.src = myImageUrl;
        var this_image = this;

        myImage.onload = function(){
            var myCanvas = document.createElement('canvas');
            $(myCanvas).prop('width', this.width).prop('height', this.height);
            var ctx = myCanvas.getContext('2d');
            ctx.drawImage(myImage, 0, 0);
            var mydataURL = myCanvas.toDataURL('image/jpg');
            $(this_image).parent().parent().find('.badge-icon').prop('src', mydataURL);
            $(this_image).data('image', mydataURL);
        }
    });

    $(".assign-badges").on('click', function(e) {
        e.preventDefault();
        var data = new FormData($('#assigned-badges')[0]);
        var badgeIDs = $("#assigned-badges input:checkbox:checked").map(function(){
          return $(this).val();
        }).get(); 
        data.append("badges", badgeIDs);
        var url = "{{url('dashboard-ajax-assign-badges')}}";
        $.ajax({
            url: url,
            data: data,
            type: "POST",
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {
                if (data.success == true) {
                    toastr["success"]("{{_('Successfully Updated')}}");
                } else {
                    toastr["error"]("{{_('Update Failed')}}");
                }
            },
        });
    });


    $(document).on("change","#send_emails_via", function(){
        var via = $(this).val();
        if(via == 'smtp'){
            $('.email-settings-config').hide();
            $('.email-settings-config.smtp').show();
        }else if(via=='mailgun'){
            $('.email-settings-config').hide();
            $('.email-settings-config.mailgun').show();
        }else{
            $('.email-settings-config').hide();
        }
    });
    

});


