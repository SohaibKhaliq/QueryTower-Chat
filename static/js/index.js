(function($) {

    "use strict";

    // Settings Object
    var IDXSETTINGS = {
        'homepage_chat_room_limit': parseInt('{{SETTINGS.homepage_chat_room_limit?SETTINGS.homepage_chat_room_limit:6}}')
    }    

    //Search Chatroom
    function search_chatroom(){
        var created_by = $("input[name='room-choice']:checked").val();
        var order_by = $(".room-sort-select").val();
        if(created_by == 'undefiened'){
            created_by = 0;
        }
        var default_count = IDXSETTINGS.homepage_chat_room_limit;
        $('#chat_room_cont').val(default_count);
        var q = $('#search_chatroom').val();
        $.ajax({
            url: "{{ url('ajax-chatroom-search') }}",
            data: {
                q: q,
                created_by: created_by,
                order_by: order_by,
                csrftoken: '{{ csrf_token_ajax() }}'
            },
            type: "POST",
            beforeSend: function() {
                loading("#chat-room-loop", "show");
            },
            success: function(data) {
                $('#chat-room-loop').empty();

                if(data.html!=""){
                    $('#chat-room-loop').html(data.html);
                    $('#load-more').show();
                    $('#load-more-end').hide();
                }else{
                    $('#load-more').hide();
                    $('#load-more-end').show();
                }
            },
            complete: function(){
                loading("#chat-room-loop", "hide");
                $('[data-toggle="tooltip"]').tooltip();
            }
        });
    }
   

    $(document).ready(function() {

        
        // Scrolls to an offset anchor when a sticky nav link is clicked
        $('.nav-sticky a.nav-link[href*="#"]:not([href="#"])').on('click', function(){
            if (
                location.pathname.replace(/^\//, "") ==
                this.pathname.replace(/^\//, "") &&
                location.hostname == this.hostname
            ) {
                var target = $(this.hash);
                target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
                if (target.length) {
                    $("html, body").animate({
                            scrollTop: target.offset().top - 81
                        },
                        200
                    );
                    return false;
                }
            }
        });

        // Collapse Navbar

        // Add styling fallback for when a transparent background .navbar-marketing is scrolled
        var navbarCollapse = function() {
            if($(".navbar-marketing.bg-transparent.fixed-top").length === 0) {
                return;
            }
            if ($(".navbar-marketing.bg-transparent.fixed-top").offset().top > 0) {
                $(".navbar-marketing").addClass("navbar-scrolled");
            } else {
                $(".navbar-marketing").removeClass("navbar-scrolled");
            }
        };
        // Collapse now if page is not at top
        navbarCollapse();

        // Collapse the navbar when page is scrolled
        $(window).scroll(navbarCollapse);

        $(function () {
            $('[data-toggle="tooltip"]').tooltip();
        })

        $('.dataTable').DataTable();
        var page_reload = false;

        // Whenever suer click on Update button on settings page, call ajax with new settings
        $(".update-settings").on('click', function(e) {
            var update_type = $(this).val();
            var data = new FormData($('#'+$(this).val())[0]);
            data.append("update_type", $(this).val());
            {{ csrf_token }}

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
                        $('.settings-success').html("{{_('Successfully Updated')}}");
                        $('.settings-success').show();
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

            $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {

                $('.settings-success').hide();
                $('.settings-error').hide();
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

        $('.settings-modal, .rooms-modal').on('hidden.bs.modal', function () {
            if(page_reload){
                page_reload = false;
                window.location.reload();
            }
        });


        $('.color-picker').on('input', function() {
            $(this).siblings("input[type=text]").val($(this).val());
        });

        $('.color-input').on('input', function() {
            $(this).siblings('.color-picker').val($(this).val());
        });

        $('#search_chatroom').on('keyup', function() {
            search_chatroom();
        });

        $('#search_chatroom_btn').on('click', function() {
            search_chatroom();
        });

        $('#clear_search').on('click', function() {
            $('#search_chatroom').val('');
            search_chatroom();
        });

        $('.room-choice').on('click', function() {
            search_chatroom();
        });

        $('.room-sort-select').on('change', function() {
            search_chatroom();
        });

        //Load More Chatrooms
        $(document).on("click", '#load-more', function() {
            var chat_room_cont = $('#chat_room_cont').val();
            var order_by = $(".room-sort-select").val();
            var q = $('#search_chatroom').val();
            var created_by = $("input[name='room-choice']:checked").val();
            if(created_by == 'undefiened'){
                created_by = 0;
            }
            $.ajax({
                url: "{{ url('ajax-chatroom-load-more') }}",
                data: {
                    chat_room_cont : chat_room_cont,
                    csrftoken: '{{ csrf_token_ajax() }}',
                    q: q,
                    created_by: created_by,
                    order_by: order_by
                },
                type: "POST",
                beforeSend: function() {
                    loading("#chat-room-loop", "show");
                    $('.fa-spinner').show();
                },
                success: function(data) {
                    if(data.html!=""){
                        var default_count = IDXSETTINGS.homepage_chat_room_limit;
                        $('#chat_room_cont').val(parseInt(default_count)+parseInt(chat_room_cont));
                        $('#chat-room-loop').append(data.html);
                    }else{
                        $('#load-more').hide();
                        $('#load-more-end').show();
                    }
                    $('.fa-spinner').hide();
                },
                complete: function(){
                    loading("#chat-room-loop", "hide");
                    $('[data-toggle="tooltip"]').tooltip();
                }
            });
        });



        $('#selected-lang-toggle').html($('.selected-lang').html());

        $('.modal').on('show.bs.modal', function (e) {
            $('.modal .modal-dialog').addClass('animate__fadeIn');
            $('.modal .modal-dialog').removeClass('animate__fadeOut');
        });
        $('.modal').on('hide.bs.modal', function (e) {
            $('.modal .modal-dialog').addClass('animate__fadeOut');
            $('.modal .modal-dialog').removeClass('animate__fadeIn');
        });

    });
    // Doc Ready End

})(jQuery);
