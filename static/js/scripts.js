"use strict"; // Start of use strict

// Mobile window size
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

// device detection
var isMobile = false;
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
    isMobile = true;
}

{% if is_datatable_lang_exsists(LANG) %}
$.extend( true, $.fn.dataTable.defaults, {
    language: {
        url: '{{STATIC_URL}}/vendor/datatables/lang/{{LANG.code}}.json'
    }
});
{% endif %}


function loading(div, status) {
    $(div).LoadingOverlay(status, {
        image: "",
        custom: '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>',
    });
}

// save profile details
var page_reload = false;
var page_location = false;
$(".save-profile").on('click', function(e) {
    var data = new FormData($('#profile-form')[0]);
    var url = $('#save_profile_url').val();
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
                page_reload = true;
                toastr["success"]("{{_('Successfully updated')}}");
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
                    toastr["error"]("{{_('Successfully updated')}}");
                }
            }
        },
    });
});

// delete chatroom
$(document).on('click', '.delete-chatroom', function(e) {
    var room_id = $(this).data('id');
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
                loading(".table-responsive","show");
            },
            success: function(data) {
                if(data.success){
                    page_reload = true;
                    page_location = "{{ url('index') }}";
                    toastr["success"]("{{_('Successfully deleted')}}");
                    $('.dataTable').DataTable().row($('#room_'+room_id).closest('tr')).remove().draw();
                }else{
                    toastr.error(
                        data.message, '',
                        {
                            timeOut: 1500,
                            fadeOut: 1500,
                            onHidden: function () {
                                window.location.reload();
                            }
                        }
                    );
                }
            },complete: function(){
                loading(".table-responsive","hide");
            }

        });
    }
});

// delete chats
$(document).on('click', '.delete-chats', function(e) {
    var room_id = $(this).data('id');
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
                loading(".table-responsive","show");
            },
            success: function(data) {
                if(data.success){
                    page_reload = true;
                    toastr["success"]("{{_('Successfully deleted')}}");
                }else{
                    toastr.error(
                        data.message, '',
                        {
                            timeOut: 1500,
                            fadeOut: 1500,
                            onHidden: function () {
                                window.location.reload();
                            }
                        }
                    );
                }
            },complete: function(){
                loading(".table-responsive","hide");
            }

        });
    }
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
            uploadFile.closest(".imgUp").find('img').remove();
            uploadFile.closest(".imgUp").find('.imagePreview').css("background-image", "url(" + this.result + ")");
        }
    }
});

$('#modalProfile').on('hidden.bs.modal', function() {
    if (page_reload) {
        page_reload = false;
        window.location.reload();
    }
});

$('.rooms-modal, .room-list-modal').on('hidden.bs.modal', function() {
    if (page_reload) {
        page_reload = false;
        if(page_location){
            window.location.href = page_location;
        }else{
            window.location.reload();
        }
    }
});

if ( $( ".cookiealert" ).length ) {

    var cookieAlert = document.querySelector(".cookiealert");
    var acceptCookies = document.querySelector(".acceptcookies");


    cookieAlert.offsetHeight;

    // Show the alert if we cant find the "acceptCookies" cookie
    if (!getCookie("acceptCookies")) {
        cookieAlert.classList.add("show");
    }

    // When clicking on the agree button, create a 1 year
    // cookie to remember user's choice and close the banner
    acceptCookies.addEventListener("click", function () {
        setCookie("acceptCookies", true, 365);
        cookieAlert.classList.remove("show");
        // dispatch the accept event
        window.dispatchEvent(new Event("cookieAlertAccept"))
    });

}

// Cookie functions from w3schools
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=None; Secure";
}


function convertToSlug(Text){
    return Text
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'')
        ;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Update already created chat room or add new chat room
$(document).on("click", ".edit-chatroom, .new-chatroom", function(){
    var edit_id = $(this).attr("data-edit-id");
    get_chat_room(edit_id);
});

$(".view-chatroom").on('click', function(e) {
    var room_id = $(this).attr('data-room');
    $('#chatroomList').modal('hide');
    get_chat_room(room_id);
});

function get_chat_room(edit_id){
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

            if(data.success == "false"){
                toastr.error(
                    data.message, '',
                    {
                        timeOut: 1500,
                        fadeOut: 1500,
                        onHidden: function () {
                            window.location.reload();
                        }
                    }
                );
            }else{
                $('.rooms-modal .modal-body').html(data);
                setTimeout(function(){ $('.rooms-modal').modal('show'); }, 500);
                $('#chatroomList').modal('hide');
                $('.dataTable').DataTable();
            }
        },
        complete: function(){
            loading(".card-room-users", "hide");
        }
    });
}

function userListbySearchTerm(term) {
    if (term.length >= 1) {
        var active_group = $("#active_group").val();
        if (active_group) {
            var response = $.ajax({
                url: "{{ url('ajax-users-by-name') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    term: term,
                    active_group: active_group,
                    csrftoken: '{{ csrf_token_ajax() }}',
                },
                async: false
            }).responseText;

            return JSON.parse(response);
        } else {
            return null;
        }
    } else {
        return null;
    }

}

// Update Chat Room information with ajax
$(document).on("click", '.update-chatroom', function(event) {
    var data = new FormData($('#chatroom-info')[0]);
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
                page_reload = true;
                if(data.info.new_room){
                    page_location = "{{ SITE_URL }}"+data.info.slug;
                    toastr["success"]("{{_('Successfully added')}}");
                }else{
                    toastr["success"]("{{_('Successfully updated')}}");
                }

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
                    toastr.error(
                        data.message, '',
                        {
                            timeOut: 1500,
                            fadeOut: 1500,
                            onHidden: function () {
                                window.location.reload();
                            }
                        }
                    );
                }
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

// Update and manage users in chat rooms (kick and unkick)
$(document).on("click", ".chatroom-user-restriction", function(e){
    e.preventDefault();
    var result = confirm("Are you sure?");
    if (result) {
        var current_row = $(this).closest('tr');
        var room_id = $('#room_id').val();
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
                    toastr["success"](data.message);
                }else{
                    toastr.error(
                        data.message, '',
                        {
                            timeOut: 1500,
                            fadeOut: 1500,
                            onHidden: function () {
                                window.location.reload();
                            }
                        }
                    );
                    // toastr["error"](data.message);
                }
            },
            complete: function(){
                loading(".card-room-users", "hide");
            }
        });
    }
});

// Update and manage users in chat rooms (kick and unkick)
$(document).on("click", ".chatroom-user-mod", function(e){
    e.preventDefault();
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
                    toastr.error(
                        data.message, '',
                        {
                            timeOut: 1500,
                            fadeOut: 1500,
                            onHidden: function () {
                                window.location.reload();
                            }
                        }
                    );
                    // toastr["error"](data.message);
                }
            },
            complete: function(){
                loading(".card-room-users", "hide");
            }
        });
    }
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


$(document).on('change', '#is_protected', function() {
    if(this.checked) {
        $('.pin-area').show();
        $('.public-view-area').hide();
    }else{
        $('.pin-area').hide();
        $('.public-view-area').show();
    }
});

$(document).on('keyup', '#name', function() {
    $('#slug').val(convertToSlug($(this).val()));
});

$( document ).ready(function() {
    // init date dropdown
    $(".dob").dateDropdowns();
    $('.dataTable').DataTable();
    $('.select2').select2({
        theme: 'bootstrap4'
    });

});

$(document).on("click", ".deactivate-user", function() {
    var r = confirm("{{_('Are you sure you want to deactivate your account? This action cannot be undone.')}}");
    var user_id = $(this).data('id');
    if (r == true) {
        $.ajax({
            url: "{{ url('ajax-deactivate-user') }}",
            data: {
                user_id: user_id,
                csrftoken: '{{ csrf_token_ajax() }}',
            },
            type: "POST",
            beforeSend: function() {
            },
            success: function(data) {
                if(data.success){
                    window.location.href = "{{ url('logout') }}";
                }else{
                    toastr.error(data.message);
                }
            },
            complete: function(){
            }
        });
    }
});

$(document).on('change', '#user_list_type', function() {
    if($(this).val() == 3) {
        $('.user-list-auth-roles').show();
    }else{
        $('.user-list-auth-roles').hide();
    }
});

$(document).on('change', '#hide_chat_list', function() {
    if($(this).val() == "1") {
        $('.chat-list-setting-area').hide();
    }else{
        $('.chat-list-setting-area').show();
    }
});