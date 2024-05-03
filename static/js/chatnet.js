(function(){

"use strict";

var isMobile = false;
var lastTypedTime = new Date(0);
var chat_date = "";
var is_typing = 0;
var audio = new Audio('{{STATIC_URL}}/audio/chat_sound.mp3');
var ring = new Audio('{{STATIC_URL}}/audio/ring.mp3');
var can_scroll_up = true;
var can_scroll_down = false;
var chat_search_mode = false;
var room_user_search_mode = false;
var heartbeat_status = 0;
var updated_chats_heartbeat_status = 0;
var forward_msg_list = [];
var forward_user_list = [];
var forward_group_list = [];
var forward_chat_item = [];
var current_uppy_zone = '';
var previous_height = '';
var notification_count_status = 1;

// Auddio Recorder Variables
URL = window.URL || window.webkitURL;
var gumStream;
var recorder;
var input;
var encodingType;
var encodeAfterRecord = true; 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;
var recordingTime = 0;
var msg_forward_btn = "";
var emojione = false;

var in_call = false;
var call_started = false;
var call_status = 0;
var call_msg = "";
var call_id = "";
var activeRoom = "";

// User Object
const USER = {
    'id': parseInt('{{ USER.id }}'),
    'user_type': parseInt('{{ USER.user_type }}'),
    'dob': '{{ USER.dob }}',
    'timezone': '{{USER.timezone}}',
    'display_name': '{{USER.display_name}}',
    'user_name': '{{USER.user_name}}'
}

// Settings Object
const SETTINGS = {
    'typingDelayMilliSe': parseInt('{{SETTINGS.typing_status_check_seconds}}')*1000,
    'onlineCheckMilliSe': parseInt('{{SETTINGS.online_status_check_seconds}}')*1000,
    'chat_receive_seconds': parseInt('{{SETTINGS.chat_receive_seconds}}')*1000,
    'user_list_check_seconds': parseInt('{{SETTINGS.user_list_check_seconds}}')*1000,
    'chat_status_check_seconds': parseInt('{{SETTINGS.chat_status_check_seconds}}')*1000,
    'system_timezone': '{{SETTINGS.timezone}}',
    'system_timezone_offset': '{{SYSTEM_TIMEZONE_OFFSET}}',
    'tenor_api_key': '{{SETTINGS.tenor_api_key}}',
    'tenor_gif_limit': "{{SETTINGS.tenor_gif_limit|default('18')}}",
    'max_message_length': parseInt('{{SETTINGS.max_message_length?SETTINGS.max_message_length:1000}}'),
    'display_name_format': "{{ SETTINGS.display_name_format?SETTINGS.display_name_format:'fullname'}}",
    'send_files': parseInt('{{SETTINGS.enable_files?SETTINGS.enable_files:0}}'),
    'send_videos': parseInt('{{SETTINGS.enable_videos?SETTINGS.enable_videos:0}}'),
    'enable_images': parseInt('{{SETTINGS.enable_images?SETTINGS.enable_images:0}}'),
    'enable_audioclip': parseInt('{{SETTINGS.enable_audioclip?SETTINGS.enable_audioclip:0}}'),
    'enable_codes': parseInt('{{SETTINGS.enable_codes?SETTINGS.enable_codes:0}}'),
    'list_show_gender': parseInt('{{SETTINGS.list_show_gender}}'),
    'list_show_user_type': parseInt('{{SETTINGS.list_show_user_type}}'),
    'list_show_country': parseInt('{{SETTINGS.list_show_country}}'),
    'animate_css': parseInt('{{SETTINGS.animate_css}}'),
    'post_max_size': parseInt('{{SETTINGS.post_max_size}}'),
    'push_notifications': parseInt('{{SETTINGS.push_notifications?SETTINGS.push_notifications:0}}'),
    'push_provider': "{{SETTINGS.push_provider|default('firebase')}}",
    'radio': parseInt('{{SETTINGS.radio?SETTINGS.radio:0}}'),
    'is_authenticated': parseInt('{{IS_AUTHENTICATED?1:0}}'),
    'flood_control_time_limit': parseInt('{{SETTINGS.flood_control_time_limit?SETTINGS.flood_control_time_limit:3600}}'), 
    'flood_control_message_limit': parseInt('{{SETTINGS.flood_control_message_limit?SETTINGS.flood_control_message_limit:10000}}'), 
    'active_theme': '{{THEME}}',
    'lang':'{{LANG.code}}',
    'notification_count_seconds': 15000,
    'enable_badges': parseInt('{{SETTINGS.enable_badges}}'),
    
}
var uppy_lang = 'Uppy.locales.tr';

const disable_private_chats = $('#disable_private_chats').val();
const disable_group_chats = $("#disable_group_chats").val();
const hide_chat_list = $("#hide_chat_list").val();
const allow_guest_view = $("#allow_guest_view").val();

// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
    isMobile = true;
}


if ($('.chat-scroll').length > 0) {
    previous_height = $('.chat-scroll')[0].scrollHeight; 
}

moment.locale('{{LANG.code}}');

// Call Tenor Api & Get Emojis



function get_gifs(tenor_api_key, tenor_gif_limit, q) {
    loading(".gifs", "show");
    $('.gif-list').empty();
    if (q != "") {
        var api_url = `https://tenor.googleapis.com/v2/search?q=`+q+`&key=` + tenor_api_key + `&client_key=my_test_app&limit=` + tenor_gif_limit;
    } else {
        var api_url = `https://tenor.googleapis.com/v2/featured?key=` + tenor_api_key + `&limit=` + tenor_gif_limit;
    }
    $.ajax({
      url: api_url,
      success: function(data) {
          $.each(data.results, function(k, v) {
              var gif_url = v.media_formats['tinygif']['url'];
              var gif_li = `<div class="send-gif col-xs-6 col-md-2 send-gif " data-gif="` + gif_url + `"><img class="lazy gif-preview" src="{{STATIC_URL}}/img/loading.gif" data-src="` + gif_url + `"></div>`;
              $(gif_li).appendTo($('.gif-list'));
          });
      },complete: function(){
            loading(".gifs", "hide");
            lazyLoad();
      }
    });
}

// Play Chat pop sound
function play_chat_sound() {
    audio.play();
}


// Convert html chars
function htmlEncode(input){
    return he.escape(input);
}

function isHTML(content) {
    var htmlRegex = /<[^>]*>/;
    return htmlRegex.test(content);
}

function htmlDecode(html, decode=true) {
    if (decode) {
        var decoded = he.decode(html);
        if(isHTML(decoded)){
            if(isHTML(html)){
                return htmlEncode(html);
            }else{
                return html;
            }
        }else{
            return decoded;
        }
    }else{
        return html;
    }
}

// Convert text links to hyperlinks in chat
function linkParse(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3, replacePattern4, replacePattern5;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank"><span class="chat-link"><i class="fa fa-link"></i> $1</span></a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank"><span class="chat-link"><i class="fa fa-link"></i> $2</span></a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1"><span class="chat-link"><i class="fa fa-link"></i> $1</span></a>');

    //Match @ mentions - @Kimali Fernando-659 /@(\w+( \w+)*)-(\d*)/gim
    replacePattern4 = /@(\W*\w+( \W*\w+)*)-(\d*)/gim
    replacedText = replacedText.replace(replacePattern4, '<span class="mention" data-user="$3">@$1</span>');

    // Match # Hash - #gotabaya /#[a-zA-Z0-9_]/gim
    if ( inputText.indexOf('&#x') === -1 ) {
        replacePattern5 = /(#[^`~!@$%^&*\#()\-+=\\|\/\.,<>?\'\":;{}\[\]* ]+)/gim
        replacedText = (replacedText).replace(replacePattern5, '<span class="hashtag">$1</span>');
    }

    return replacedText;
}


// make youtube links as clickable and popup the video player
function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}


// Lazy load images and scroll resize
function lazyLoad(){
    $('.lazy').lazy({
        effect: "fadeIn",
        effectTime: 500,
        scrollDirection: 'vertical',
        appendScroll:$('.chat-scroll'),
    });
}


// restrict or unrestrict chat typing area
function restrictTypingArea(restrict_type, restrict_msg){
    if(restrict_type == 1){
        $('.type-blocked-overlay').show();
        $('.type-blocked-overlay').text(restrict_msg);
        $('#message_content').data("emojioneArea").disable();
        $('.message-files').css({"pointer-events": "none"});
        $(".message-gif, .message-sticker").popover('disable');
    }else{
        $('.type-blocked-overlay').hide();
        $('.type-blocked-overlay').text("Blocked User");
        $('#message_content').data("emojioneArea").enable();
        $('.message-files').css({"pointer-events": "unset"});
        $(".message-gif, .message-sticker").popover('enable');
    }
}


// new message save
function newMessage(message_data, message_type, decode=true){
    if (last_sent !==  undefined) {
        if(moment(last_sent).add(time_limit, 'seconds') < moment()){
            sent_count = 0;
        }
    }else{
        sent_count = 0;
    }
    
    if(sent_count == 0){
        last_sent = moment();
    }
    if(message_limit > sent_count){
        if (message_data === undefined) {
            var message_data = htmlEncode($("#message_content").val());
        }
        if (message_type === undefined) {
            var message_type = 1;
        }
        var chat_type = "private";
        if ($('#active_user').val() == ""){
            chat_type = "group";
        }
        var random_id = Math.random();
        if(message_data != ""){
            var msg_obj = {};
            msg_obj['sender_id'] = USER.id;
            msg_obj['status'] = 1;
            msg_obj['type'] = message_type;
            msg_obj['chat_type'] = chat_type;
            msg_obj['avatar'] = "{{USER.avatar}}";
            msg_obj['user_type'] = "{{USER.user_type}}";
            msg_obj['message'] = message_data;
            msg_obj['random_id'] = random_id;
            msg_obj['id'] = "";
            msg_obj['time'] = moment().format('YYYY-MM-DD HH:mm:ss');
            if (message_data != "") {
                createMessage(msg_obj, false, true, decode);
                $('#message_content').val(null);
                $('.emojionearea-editor').empty();
                lazyLoad();
                if (message_type==7) {
                    GreenAudioPlayer.init({
                        selector: '.cn-player',
                        stopOthersOnPlay: true,
                    });
                }else if(message_type==10){
                    if(SETTINGS.enable_codes){
                        Prism.highlightAll();
                    }
                }else if(message_type==8){
                    if(JSON.parse(message_data)['new_message']['new_type'] == 10){
                        if(SETTINGS.enable_codes){
                            Prism.highlightAll();
                        } 
                    }
                }
                
            }
    
            var active_user = $("#active_user").val();
            var active_group = $("#active_group").val();
            var active_room = $("#active_room").val();
            var chat_meta_id = $("#chat_meta_id").val();
            if (active_user) {
                active_group = null;
            }
            $.ajax({
                url: "{{ url('ajax-save-message') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    active_user: active_user,
                    active_group: active_group,
                    active_room: active_room,
                    chat_meta_id: chat_meta_id,
                    message_content: message_data,
                    message_type: message_type,
                    random_id: random_id,
                },
                success: function(data) {
                    $("[data-random-id='" + data.random_id + "']").attr("id",data.id);
                    $("[data-random-id='" + data.random_id + "']").find('.forward-list-check').attr("id",data.id+'_check');
                    $("[data-random-id='" + data.random_id + "']").find('.message-time').html(moment(data.time+SETTINGS.system_timezone_offset).tz(USER.timezone).format('hh:mm A'));
                    $("[data-random-id='" + data.random_id + "']").find('.message-status').html('<i class="fa fa-check-double"></i>');
                    if (data.preview !== null) {
                        if (message_type == 1) {
                            var json_preview = JSON.parse(data.preview)
                            $("[data-random-id='" + data.random_id + "']").find('.message-html').append(getLinkPreview(json_preview));
                            lazyLoad();
                            $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight);
                        }
                    }
    
                    if (data.profanity_filtered !== null) {
                        $("[data-random-id='" + data.random_id + "']").find('.chat-txt').text(data.profanity_filtered);
                    }

                    if ($.inArray(message_type, [2, 5, 6]) > -1) {
                        getActiveRecentMedia();
                    }
                }
            });
        }
        sent_count++;
    }else{
        toastr.error(
            "{{_('Hey, Slow down!')}}", '',
            {
                timeOut: 1500,
                fadeOut: 1500,
            }
        );
    }
	
	setChatCookie('sent_count', sent_count);

}


// get sticker functions
function get_strickers(){
    $.ajax({
        url: "{{ url('ajax-get-stickers') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}'
        },
        beforeSend: function() {
            loading(".strickers","show");
        },
        success: function(data) {
            if (Object.keys(data.stickers).length > 0) {
                var sticker_set_count = 1;
                $.each(data.stickers, function( index, obj ) {
                    if(sticker_set_count == 1){
                        var act_class = 'active';
                        var act_class_content = 'active show';
                    }else{
                        var act_class = '';
                        var act_class_content = '';
                    }
                    var tab_html =
                    `<li class="nav-item">
                      <a class="nav-link `+act_class+`" id="pills-tab-`+sticker_set_count+`" data-toggle="pill" href="#sticker-pills-`+sticker_set_count+`" role="tab" >`+index+`</a>
                    </li>`;
                    $('.sticker-nav').append(tab_html);
                    var sticker_list = '';
                    $.each(obj, function( index, sticker ) {
                        var sticker_url = '{{ MEDIA_URL }}/stickers/' + sticker;
                        var sticker_html = `<div class="send-sticker" data-sticker="`+sticker+`"><img src="`+sticker_url+`" /></div>`;
                        sticker_list += (sticker_html);
                    });
                    var tab_content_html =
                    `<div class="tab-pane fade  `+act_class_content+`" id="sticker-pills-`+sticker_set_count+`" role="tabpanel" >
                        `+ sticker_list +`
                    </div>`
                    $('.sticker-tab-content').append(tab_content_html);
                    sticker_set_count++;
                });
            }else{
                $('.sticker-tab-content').append('<p class="text-center">{{_("No Stickers Found")}}</p>');
            }
        },complete: function(){
            loading(".strickers","hide");
        }

    });
}


// check user is typing
function refreshTypingStatus() {
    if ($('#message_content').data("emojioneArea").getText().length == 0 || new Date().getTime() - lastTypedTime.getTime() > SETTINGS.typingDelayMilliSe) {
        is_typing = 0;
    } else {
        is_typing = 1;
    }
}


// update user last type time
function updateLastTypedTime() {
    lastTypedTime = new Date();
}


// get selected chat information
function getActiveInfo(user_show=false, load_panel=true){

    if (user_show == false) {
        var active_user = $("#active_user").val();
        $('.close-selected-user, .start-chat').hide();
        $('.selected-chat-actions').show();
    }else{
        var active_user = user_show;
        $('.close-selected-user').show();
        $('.start-chat').css('display', 'inline-flex');
        $('.selected-chat-actions').hide();
    }
    var active_group = $("#active_group").val();
    var active_room = $("#active_room").val();
    if (active_user=="") {
        var selected_mode = "group";
    }else{
        var selected_mode = "user";
    }
    $.ajax({
        url: "{{ url('ajax-get-active-info') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            active_group: active_group,
            active_room: active_room,
            active_user: active_user,
        },
        beforeSend: function() {
            loading(".selected-chat-col","show");
        },
        success: function(data) {
            $('.results').empty();
            $('#search-query').val('');
            if (data.info_type == "user") {
                if(load_panel){
                    load_current_panel('.active-user-info');
                }
                $('.active-group-action').hide();
                $('.launch-call').show();
                $('.active-user-action').show();
                $('.active-user-dob').html(data.info.dob);
                if (SETTINGS.display_name_format == 'username') {
                    var display_name = data.info.user_name;
                }else{
                    var display_name = data.info.first_name + ' ' + data.info.last_name;
                }
                $('.active-user-title, .active-user-name').html(display_name);
                if(user_show==false){

                    if (SETTINGS.display_name_format == 'username') {
                        $('.chat-title, .active-user-title, .active-user-name').html(""+display_name);
                        $('.chat-slug').empty();
                    }else{
                        $('.chat-title, .active-user-title, .active-user-name').html(display_name);
                        $('.chat-slug').html("@"+data.info.user_name);
                    }

                }

                var gender = "Other";
                var country = "N/A";
                if(data.info.sex == 1){
                    gender = "<i class='fa fa-gender fa-mars'></i> {{_('Male')}} ";
                }else if(data.info.sex == 2){
                    gender = "<i class='fa fa-gender fa-venus'></i> {{_('Female')}}";
                }else{
                    gender = "<i class='fa fa-gender fa-genderless'></i> {{_('Other')}}";
                }

                if(data.info.country){
                    country = '<span class="flag-icon flag-icon-'+data.info.country.toLowerCase()+'"></span> ' + data.info.country;
                }

                $('.active-user-gender').html(gender);
                $('.active-user-country').html(country);

                var avatar_src = getUserAvatar(data.info, display_name);
                $(".active-user-avatar").attr("src", avatar_src);

                if(data.info.about){
                    $('.active-user-about').show();
                    $('.active-user-about').html(data.info.about);
                }else{
                    $('.active-user-about').hide();
                }
                $('.active-user-favourite').attr('data-is-favourite', data.info.is_favourite);
                $('.active-user-mute').attr('data-is-muted', data.info.is_muted);
                $('.active-user-block').attr('data-is-blocked', data.info.blocked_by_you);
                $('.active-user-info').find('.init-report').attr('data-report-for', active_user);
                $('.active-user-info').find('.init-report').attr('data-report-header', '{{_("User")}} - ' + display_name);

                if(data.info.is_favourite){
                    $('.active-user-favourite .icon').html('<i class="fas fa-heart"></i>');
                    $('.active-user-favourite').attr('title', "{{_('Remove from Favorites')}}");
                    $('.active-user-favourite .action-title').html("{{_('Remove Favorite')}}");
                    
                }else{
                    $('.active-user-favourite .icon').html('<i class="far fa-heart"></i>');
                    $('.active-user-favourite').attr('title', "{{_('Add to Favorites')}}");
                    $('.active-user-favourite .action-title').html("{{_('Make Favorite')}}");
                }

                if(user_show==false){
                    if(data.info.available_status == 1){
                        if(data.info.blocked_by_you){
                            restrictTypingArea(data.info.blocked_by_you, "{{_('Blocked by you')}}");
                        }else if (data.info.blocked_by_him) {
                            restrictTypingArea(data.info.blocked_by_him, "{{_('Blocked by user')}}");
                        }else{
                            restrictTypingArea(0, '');
                        }
                    }else{
                        restrictTypingArea(1, "{{_('User is deactivated')}}");
                    }
                }


                if(data.info.blocked_by_you){
                    $('.active-user-block .icon').html('<i class="fas fa-ban"></i>');
                    $('.active-user-block').attr('title', "{{_('Unblock')}}");
                    $('.active-user-block .action-title').html("{{_('Unblock')}}");
                }else{
                    $('.active-user-block .icon').html('<i class="far fa-circle"></i>');
                    $('.active-user-block').attr('title', "{{_('Block')}}");
                    $('.active-user-block .action-title').html("{{_('Block')}}");
                }

                if(data.info.is_muted){
                    $('.active-user-mute .icon').html('<i class="fas fa-bell-slash"></i>');
                    $('.active-user-mute').attr('title', "{{_('Unmute')}}");
                    $('.active-user-mute .action-title').html("{{_('Unmute')}}");
                }else{
                    $('.active-user-mute .icon').html('<i class="fas fa-bell"></i>');
                    $('.active-user-mute').attr('title', "{{_('Mute')}}");
                    $('.active-user-mute .action-title').html("{{_('Mute')}}");
                }

                if (SETTINGS.enable_badges) {
                    $('.user-badge').hide();
                    if(data.info.badges){
                        $.each(JSON.parse(data.info.badges), function(bdg_idx, bdg_obj) {
                            $('#badge-'+bdg_obj).css('display', 'block');
                        });
                    }
                }

            }else if (data.info_type == "group") {
                restrictTypingArea(0, '');
                if(load_panel){
                    load_current_panel('.active-group-info');
                }
                $('.active-user-action').hide();
                $('.launch-call').hide();
                $('.active-group-action').show();
                $(".active-group-cover").attr("src", data.info.cover_url);
                $('.active-group-mute').attr('data-is-muted', data.info.is_muted);
                $('.chat-title, .active-group-name').html(data.info.room_data.name);
                if (data.info.slug == 'general') {
                    $('.chat-slug').html("#"+data.info.room_data.slug);
                }else{
                    $('.chat-slug').html("#"+data.info.slug);
                }

                $('.active-group-info').find('.init-report').attr('data-report-for', active_room);
                $('.active-group-info').find('.init-report').attr('data-report-header', '{{_("Room")}} - ' + data.info.room_data.name);

                if(data.info.is_muted){
                    $('.active-group-mute').attr('title', "{{_('Unmute')}}");
                    $('.active-group-mute .icon').html('<i class="fas fa-bell-slash"></i>');
                    $('.active-group-mute .action-title').html("{{_('Unmute')}}");
                }else{
                    $('.active-group-mute').attr('title', "{{_('Mute')}}");
                    $('.active-group-mute .icon').html('<i class="fas fa-bell"></i>');
                    $('.active-group-mute .action-title').html("{{_('Mute')}}");
                }

                var group_users = ``;
                $.each(data.group_users, function( index, obj ) {
                    var sex = ``;
                    var user_type = ``;
                    var country = ``;

                    if (SETTINGS.display_name_format == 'username') {
                    	var display_name = obj.user_name;
                    }else{
                    	var display_name = obj.first_name + ' ' + obj.last_name;
                    }

                    var img_src = getUserAvatar(obj, display_name);

                    if (SETTINGS.list_show_gender) {
                        if (obj.sex != "") {
                            if (obj.sex == 1) {
                                sex = '<i class="fas fa-gender fa-mars"></i>';
                            }else if(obj.sex == 2){
                                sex = '<i class="fas fa-gender fa-venus"></i>';
                            }else if(obj.sex == 3){
                                sex = '<i class="fas fa-gender fa-genderless"></i>';
                            }
                        }
                    }

                    if (SETTINGS.list_show_user_type) {
                        if (obj.user_type != "") {
                            if (obj.user_type == 1) {
                                user_type = "<span class='user-type-badge admin'>{{_('ADMIN')}}</span>";
                            }else if(obj.user_type == 4){
                                user_type = "<span title='{{_('Global Moderator')}}' class='user-type-badge mod'>{{_('MOD')}}</span>";
                            }else if(obj.user_type == 2){
                                var active_room_created_by = $('#active_room_created_by').val();
                                if(active_room_created_by == obj.id){
                                    user_type = "<span title='{{_('Room Creator')}}' class='user-type-badge creator'>{{_('CREATOR')}}</span>";
                                }else if(obj.is_mod == 1){
                                    user_type = "<span title='{{_('Room Moderator')}}' class='user-type-badge room-mod'>{{_('MOD')}}</span>";
                                }
                            }
                        }
                    }

                    if (SETTINGS.list_show_country) {
                        if (obj.country !== undefined && obj.country !== null) {
                            country = '<span class="flag-icon flag-icon-'+obj.country.toLowerCase()+'"></span>';
                        }
                    }

                    var each_user = '<div class="row group-user" data-user-id="'+obj.id+'"><div class="col-12"><img class="img-profile mr-2" src='+img_src+'><div class="grp-user-name">' + display_name + `</div></span> ` + sex + ` ` + country + ` `+ user_type+ '</div></div>';

                    group_users = group_users + each_user;
                });
                $('#group-users-tab').html(group_users);
            }
            createActiveRecentMedia(data, selected_mode);
            
        },complete: function(){
            loading(".selected-chat-col","hide");
            $('.chat-info-action').tooltip();
            $('.user-badge').tooltip();
        }
    });
}

// get selected chat information
function getActiveRecentMedia(user_show = false) {
    var active_user = $("#active_user").val();
    var active_room = $("#active_room").val();
    var active_group = $("#active_group").val();
    if (active_room == "") {
        var selected_mode = "user";
    } else {
        var selected_mode = "group";
    }
    $.ajax({
        url: "{{ url('ajax-get-active-recent-media') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            active_room: active_room,
            active_user: active_user,
            active_group: active_group,
        },
        beforeSend: function () {
            loading(".recent-items", "show");
        },
        success: function (data) {
            createActiveRecentMedia(data, selected_mode);
        }, complete: function () {
            loading(".recent-items", "hide");
        }
    });
}

function createActiveRecentMedia(data, selected_mode) {
    var img_count = 0;
    var recent_img_chat = ``;
    try {
        $.each(data.shared_photos, function(all_img_idx, all_img_obj) {
 
            if ("content" in JSON.parse(all_img_obj)) {
                var decode_all_img_obj = JSON.parse(all_img_obj)['content']; // this is new format
            } else {
                var decode_all_img_obj = JSON.parse(all_img_obj); // this is old format
            }
            $.each(decode_all_img_obj, function(img_idx, img_obj) {
                if(img_count < 12){
                    var image_size_str = img_obj.split('_');
                    var image_size = "600x600";
                    if (image_size_str[1] !== undefined) {
                        image_size = image_size_str[1].substring(0, image_size_str[1].indexOf("."))
                    }

                    var each_img = `<figure class="col-3 recent-img">
                                    <a  href="{{MEDIA_URL}}/chats/images/large/`+img_obj+`" data-size="`+image_size+`">
                                        <img class="img-responsive" src="{{MEDIA_URL}}/chats/images/thumb/`+img_obj+`" />
                                    </a>
                                </figure>`;
                    recent_img_chat = recent_img_chat + each_img;
                    img_count++;
                }
            });
        });
        $('#recent-media-'+selected_mode+' .row').html(recent_img_chat);
        initPhotoSwipeFromDOM('#recent-media-'+selected_mode+' .row');
    } catch (error) {
        console.log("Recent Media: Image Decoding Error: " + error);
    }

    var file_count = 0;
    var recent_file_chat = ``;
    try {
        $.each(data.shared_files, function(all_file_idx, all_file_obj) {
            if ("content" in JSON.parse(all_file_obj)) {
                var decode_all_file_obj = JSON.parse(all_file_obj)['content']; // this is new format
            } else {
                var decode_all_file_obj = JSON.parse(all_file_obj); // this is old format
            }
            $.each(decode_all_file_obj, function(file_idx, file_obj) {
                if(file_count < 10){
                    var file_icon = getFileIcon(file_obj.extenstion, 'file-icon');
                    try {
                        var file_name  = file_obj.name.split('.')[0]+'.'+file_obj.extenstion;
                    } catch (error) {
                        var file_name  = file_obj.name;
                    }
                    var each_file = `<div class="chat-files-block">
                        <div class="file-section">
                            <a href="javascript:void(0)" class="file-header">
                                `+file_icon+`
                                <div class="file-description">
                                    <span class="file-title" dir="auto">`+file_name+`</span>
                                    <div class="file-meta">
                                        <div class="file-meta-entry">
                                            <div class="file-meta-swap">`+file_obj.size+` `+file_obj.extenstion+` file</div>
                                        </div>
                                    </div>
                                </div>

                            </a>
                            <div class="file-actions">
                                <a href="{{MEDIA_URL}}/chats/files/`+file_obj.name+`" download="`+file_name+`" class="file-action-buttons">
                                    <i class="fas fa-download file-download-icon"  aria-hidden="true"></i>
                                </a>
                            </div>

                        </div>
                    </div>`;
                    recent_file_chat = recent_file_chat + each_file;
                    file_count++;
                }
            });
        });
        $('#recent-files-'+selected_mode+' .row').html(recent_file_chat);
    } catch (error) {
        console.log("Recent Media: File Decoding Error");
    }

    var recent_links_chat = ``;
    try {
        $.each(data.shared_links, function(all_links_idx, link_obj) {
            link_obj = JSON.parse(link_obj)
            if (!link_obj.image) {
                var img_link = '{{STATIC_URL}}/img/default-image.png';
            }else{
                var img_link = link_obj.image;
            }
            var each_link = `<div class="chat-files-block">
                <div class="file-section">
                    <a href="`+link_obj.url+`" target="_blank" class="file-header">
                        <img class="recent-link-preview" src="`+img_link+`" />
                        <div class="file-description">
                            <span class="file-title" dir="auto">`+link_obj.title+`</span>
                            <div class="file-meta">
                                <div class="file-meta-entry">
                                    <div class="file-meta-swap">`+link_obj.message+` file</div>
                                </div>
                            </div>
                        </div>

                    </a>
                    <div class="file-actions">
                        <a href="`+link_obj.url+`" target="_blank" class="file-action-buttons">
                            <i class="fas fa-external-link-alt file-download-icon"  aria-hidden="true"></i>
                        </a>
                    </div>

                </div>
            </div>`;
            recent_links_chat = recent_links_chat + each_link;
        });
        $('#recent-links-'+selected_mode+' .row').html(recent_links_chat);
    } catch (error) {
        console.log("Recent Media: Links Decoding Error");
    }
}

function forward_list_create(forward_msg_id){
    if($('#'+forward_msg_id+"_check").is(':checked')) {
        if($.inArray(parseInt(forward_msg_id), forward_msg_list) == -1){
            $('#'+forward_msg_id).addClass('selected');
            forward_msg_list.push(parseInt(forward_msg_id));
        }
    }else{
        if($.inArray(parseInt(forward_msg_id), forward_msg_list) > -1){
            $('#'+forward_msg_id).removeClass('selected');
            forward_msg_list.splice(forward_msg_list.indexOf(parseInt(forward_msg_id)), 1);
        }
    }

    $('.forward-selection-name').html(forward_msg_list.length + ' {{_("selected")}}');
    if(forward_msg_list.length == 0){
        $('.forward-selected').attr("disabled", true);
    }else{
        $('.forward-selected').attr("disabled", false);
    }
}

function destroy_forward_selection(){
    $('.forward-check').addClass('hidden');
    $('.forward-selection').addClass('hidden');
    $('.forward-list-check').prop('checked', false);
    $('.forward-actions').addClass('hidden');
    $('.chats').removeClass('forwarding');
    $('.forward-room-user-search').val("");
    forward_msg_list = [];
    forward_group_list = [];
    forward_user_list = [];
    forward_chat_item = [];
    if(isMobile==false){
        $('#message_content').data("emojioneArea").editor.focus();
    }
    
}

// load selected room chat or individual chats
function loadChats(active_user, active_group, active_room, chat_id=false){
    can_scroll_up = false;
    can_scroll_down = false;
    var load_chats = true;
    var joined_room = $('#joined_room').val();
    if(disable_group_chats == 1 && active_user == ''){
        load_chats = false;
        $('.type-message').hide();
        $('.chat-scroll').hide();
        $('.panel-content-right').hide();
        $('.non-chat-select').show();
    }else if(allow_guest_view){
        if(joined_room){
            $('.type-message').show();
            $('.chat-scroll').show();
            $('.panel-content-right').show();
        }else{
            $('.type-message').hide();
            $('.chat-scroll').show();
            $('.panel-content-right').show();
        }
    }else{
        if(joined_room){
            $('.type-message').show();
            $('.chat-scroll').show();
            $('.panel-content-right').show();
            $('.non-chat-select').hide();
        }else{
            $('.type-message').hide();
            $('.chat-scroll').show();
            $('.panel-content-right').show();
        }
    }

    $(".chats").empty();
    $("#active_user").val(active_user);
    $("#active_group").val(active_group);
    $("#active_room").val(active_room);
    if(active_user){
        $('.room-notice').hide();
        if($('.general-notice').length){
            $('.general-notice').show();
        }
    }else{
        if($('.room-notice').length){
            $('.room-notice').show();
            $('.general-notice').hide();
        }else if($('.general-notice').length){
            $('.general-notice').show();
        }
    }

    if(load_chats){
        $.ajax({
            url: "{{ url('ajax-load-chats') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                active_user: active_user,
                active_group: active_group,
                active_room: active_room,
                chat_id: chat_id
            },
            beforeSend: function() {
                heartbeat_status = 0;
                updated_chats_heartbeat_status = 0;
                loading(".messages","show");
            },
            success: function(data) {
                $("#last_chat_id").val(0);
                $("#is_mod").val(data.is_mod);
                $.each(data.chats, function( index, obj ) {
                    createMessage(obj,'none');
                    $("#last_chat_id").val(obj.id);
                });
                $("#chat_meta_id").val(data.chat_meta_id);
                $("#last_updated_chat_time").val(data.last_updated_chat_time);
                $("#active_user").val(data.active_user);
            },complete: function(){
                if (chat_id) {
                    var url = new URL(window.location.href);
                    var view_chat = url.searchParams.get("view-chat");
                    if(view_chat){
                        setTimeout( function(){
                            var highlight_class = '#'+chat_id + ' .message-data';
                            $(highlight_class).css('animation', 'flash 2s ease infinite');
                            $("#" + chat_id)[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setTimeout( function(){$( highlight_class ).removeAttr('style'); }, 2000);
                            can_scroll_down = true;
                        }, 2000);
                        getActiveInfo();
                    }else{
                        var highlight_class = '#'+chat_id + ' .message-data';
                        $(highlight_class).css('animation', 'flash 2s ease infinite');
                        $("#" + chat_id)[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout( function(){$( highlight_class ).removeAttr('style'); }, 2000);
                        can_scroll_down = true;
                    }
                    
                }else{
                    $('.chat-info-action').tooltip('dispose');
                    getActiveInfo();
                    $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight);
                }
                loading(".messages","hide");
                can_scroll_up = true;
                lazyLoad();
                GreenAudioPlayer.init({
                    selector: '.cn-player',
                    stopOthersOnPlay: true,
                });
                if(SETTINGS.enable_codes){
                    Prism.highlightAll();
                }
                heartbeat_status = 1;
                updated_chats_heartbeat_status = 1;
                if(isMobile==false){
                    $('#message_content').data("emojioneArea").editor.focus();
                }
            }

        });
    }else{
        loading(".messages","hide");
    }
}


function getLinkPreview(json_msg){
    if (json_msg.image) {
        var preview_image = (json_msg.image);
    }else{
        var preview_image = `{{STATIC_URL}}/img/default-image.png`;
    }
    if (json_msg.title) {
        var preview_title = `<b>`+json_msg.title+`</b>`;
    }else{
        var preview_title = ``;
    }
    if (json_msg.description) {
        var preview_description = `<div class="link-meta-desc">`+json_msg.description+`</div>`;
    }else{
        var preview_description = ``;
    }
    var link_class = '';
    var a = document.createElement('a');
    a.href = json_msg.url;
    var hostname = a.hostname;
    if (hostname == 'www.youtube.com' || hostname == 'youtube.com' || hostname == 'youtu.be') {
        link_class = 'video-link';
    }
    if (json_msg.code) {
        var code = json_msg.code;
        link_class = 'video-link';
    } else{
        var code = '';
    }
    if(preview_title != ''){
        var link_preview = `<div class="chat-link-block">` +
            `<a target="_blank" href="`+json_msg.url+`" data-code="`+code+`">` +
                `<div class="link-preview `+link_class+`">` +

                        `<img class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="`+preview_image+`" />` +
                        `<div class="link-meta">` +
                            preview_title +
                            preview_description +
                        `</div>` +

                `</div>`+
            `</a>` +
        `</div>`;
    }else{
        var link_preview = ``;
    }

    return link_preview;
}

// message create and append to the chat container
function createMessage(obj, direction="down", save_message=false, decode=true){
    var sender_div = "";
    var is_group = "";
    var msg_delete_btn = "";
    var sent_animation = '';
    var replies_animation = '';
    var active_room_created_by = $('#active_room_created_by').val();
    var is_mod = $('#is_mod').val();
    var msg_reply_btn = ``;
    var forward_checkbox_hidden = "hidden";
    var msg_forward_btn = "";
    var forward_checked = "";
    var deleted = "";
    var msg_report_btn = true;
    var is_view_as = "{{VIEW_AS}}";
    var start_chat = false;
    var reaction_class = "";
    var current_reactions = "";

    if (SETTINGS.animate_css){
     sent_animation = ' animate__animated {{ SETTINGS.sent_animation }} ';
     replies_animation = ' animate__animated {{ SETTINGS.replies_animation }}';
    }
    if (obj.sender_id == USER.id) {
        var message_class_name = "sent" + sent_animation;
        var msg_status = '<i class="fa fa-check-double"></i>';
        var msg_status_class = '';
        if (obj.status == 2) {
            msg_status_class = 'read';
        }
        if (obj.status != 3) {
            msg_delete_btn = `<i class="fa fa-trash-alt message-delete" data-chat-type="`+obj.chat_type+`" title="{{_('Delete')}}"></i>`;
        }

        if (SETTINGS.display_name_format == 'username') {
        	var display_name = '{{ USER.user_name }}';
        }else{
        	var display_name = '{{ USER.first_name }}';
        }
    }else{
        var message_class_name = "replies" + replies_animation;
        var msg_status = '';
        var msg_status_class = '';
        if (SETTINGS.display_name_format == 'username') {
        	var display_name = obj.user_name;
        }else{
        	var display_name = obj.first_name + ' ' + obj.last_name;
        }
        if(obj.chat_type == "group"){
            start_chat = true;
            is_group = "grp";
            sender_div = "<small class='sender-name' data-user-id='"+obj.sender_id+"'>"+display_name +" </small>";
        }

        //check delete access
        var delete_access = false;
        if(USER.user_type == 1){
            delete_access = true;
        }else if(USER.user_type == 4 && obj.user_type != 1){
            delete_access = true;
        }else if(USER.id == active_room_created_by && (obj.user_type != 1 && obj.user_type != 4)){
            delete_access = true;
        }else if(is_mod == 1 && (obj.user_type != 1 && obj.user_type != 4 && obj.sender_id != active_room_created_by)){
            delete_access = true;
        }else if(is_view_as != ""){
            delete_access = true;
        }

        if (delete_access && obj.status != 3){
            msg_delete_btn = `<i class="fa fa-trash-alt message-delete" data-chat-type="`+obj.chat_type+`" title="{{_('Delete')}}"></i>`;
        }
    }

    if(!obj.random_id){
        obj.random_id = "";
    }

    var img_src = getUserAvatar(obj, display_name);

    var msg = "";

    if(obj.status != 3){
        msg = messageHtml(obj, decode);
        msg_forward_btn = `<i class="fa fa-share message-forward" title="{{_('Forward')}}"></i>`;
        if (!$('.forward-selection').hasClass("hidden")) {
            forward_checkbox_hidden = "";
        }

        if($.inArray(obj.id, forward_msg_list) > -1){
            forward_checked = "checked";
        }
        msg_reply_btn = `<i class="fa fa-reply message-reply" data-chat-type="`+obj.chat_type+`" title="{{_('Reply')}}"></i>`;

    }else{
        deleted = "deleted";
        msg_status = "";
        msg = `<div class="chat-txt deleted"><i class="fa fa-ban"></i> {{_('This message was deleted')}}</div>`;
        msg_forward_btn = ``;
        msg_reply_btn = ``;
    }

    if(obj.reactions){
        reaction_class = "has-reactions";
        current_reactions = createReactionList(obj.reactions);
    }

    var new_chat_date = moment(obj.time+SETTINGS.system_timezone_offset).tz(USER.timezone).format('dddd, MMM D, YYYY');
    var chat_actions = '';
    if(obj.chat_type == 'group'){
        var joined_room = $('#joined_room').val();
    }else{
        var joined_room = true;
    }
    
    if (SETTINGS.is_authenticated == true && joined_room == true) {
        //chat_actions = ` <div class="chat-actions"> `+ msg_delete_btn +` `+ msg_reply_btn +` `+ msg_forward_btn +` </div>` ;
        chat_actions = `<div class="chat-actions">
                            <div class="btn-group show-actions " 
                                data-delete="`+ (msg_delete_btn ? true : false) + `" 
                                data-reply="` + (msg_reply_btn ? true : false) + `" 
                                data-fwd="` + (msg_forward_btn ? true : false) +  `"
                                data-report="` + (msg_report_btn ? true : false) +  `"
                                data-start-chat="` + start_chat + `"
                                data-chat-type="`+ obj.chat_type + `" 
                                data-id="` + obj.id + `" >
                                <i class="fas fa-ellipsis-v " data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ></i>
                                <div class="dropdown-menu "></div>
                            </div>
                            <div class="chat-reactions reactions">
                                <a class="reaction-btn" data-active-reaction="` + obj.my_reaction + `">
                                    <i class="far fa-smile"></i>
                                    <div class="reaction-box"></div>
                                </a>
                            </div>
                        </div>`;
    }
    var msg_content = `<div class="cht `+message_class_name+`" id="`+obj.id+`" data-random-id="`+obj.random_id+`" data-msg-type="`+obj.type+`" data-date="`+new_chat_date+`">
                            <div class="forward-check `+forward_checkbox_hidden+` `+deleted+`">
                                <input class="forward-list-check" `+forward_checked+` type="checkbox" id="`+obj.id+`_check" name="forward_message_list" />
                            </div>
                            <img class="avatar " src="`+img_src+`"  />
                            <div class="message-data `+is_group+` ` + reaction_class +` ">
                                `+sender_div+`
                                <div class="message-html">`+ msg +`</div>
                                <span class="current-chat-reactions">
                                    `+ current_reactions +`
                                </span>
                            </div>
                           `+chat_actions+`
                            <span class="message-meta">
                                <span class="message-time">`+ moment(obj.time+SETTINGS.system_timezone_offset).tz(USER.timezone).format('hh:mm A') +`</span>
                                <span class="message-status `+msg_status_class+`">`+ msg_status +`</span>
                            </span>
                        </div>`;

    if(direction=='up'){
        $(msg_content).prependTo($('.messages .chats'));
    }else{
        $(msg_content).appendTo($('.messages .chats'));
    }
    $(".messages  .chats").find(`[data-printed-date='`+new_chat_date+`']`).remove();
    $(".messages  .chats").find(`[data-date='`+new_chat_date+`']:first`).before(`<div class="new-date" data-printed-date="`+new_chat_date+`"><p>`+new_chat_date+`</p></div>`);

    initPhotoSwipeFromDOM('.chat-gallery');

    var scrolled_size = $('.chat-scroll')[0].scrollHeight - $('.chat-scroll').scrollTop() - $('.chat-scroll').height();
    
    if(save_message){
        $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight);
    }else if (direction=='up') {
        $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight - previous_height);
    }else if(direction=='down'){
        $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight);
    }else if(direction=='none'){
        // no scroll
    }else if(scrolled_size < 350){
        $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight);
    }
    chat_date = new_chat_date;
    if(isMobile==false){
        $('#message_content').data("emojioneArea").editor.focus();
    }
}

function createReactionList(reaction_obj){
    var reaction_obj = JSON.parse(reaction_obj);

    let sort_array = [];
    var reaction_count = 0;
    for (var reaction_type in reaction_obj) {
        reaction_count += reaction_obj[reaction_type];
        sort_array.push([reaction_type, reaction_obj[reaction_type]]);
    }
    sort_array.sort((a,b) =>  b[1] - a[1]);

    if(reaction_count > 0){
        var current_reactions = `<div class="current-reacts">`
                                +`<span class="current-reacts-count">`+reaction_count+`</span>`
                                + (typeof sort_array[2] === 'undefined' ? '' : reactionHtml(sort_array[2][0]))
                                + (typeof sort_array[1] === 'undefined' ? '' : reactionHtml(sort_array[1][0]))  
                                + (typeof sort_array[0] === 'undefined' ? '' : reactionHtml(sort_array[0][0]))
                            +`</div>`;
    }else{
        var current_reactions = '';
    }
    return current_reactions;
} 

function reactionHtml(reaction_type){
    var reaction_html;
    switch(reaction_type) {
        case "1":
            reaction_html = '<span class="current-react current-react-1"></span>';
            break;
        case "2":
            reaction_html = '<span class="current-react current-react-2"></span>';
            break;
        case "3":
            reaction_html = '<span class="current-react current-react-3"></span>';
            break;
        case "4":
            reaction_html = '<span class="current-react current-react-4"></span>';
            break;
        case "5":
            reaction_html = '<span class="current-react current-react-5"></span>';
            break;
        case "6":
            reaction_html = '<span class="current-react current-react-6"></span>';
            break;
        case "7":
            reaction_html = '<span class="current-react current-react-7"></span>';
            break;
        default:
            reaction_html = "";
    }
    return reaction_html;
}

function messageHtml(obj, decode=true){
    var msg = "";
    if(obj.type == 1){
        msg = (window.emojione.shortnameToImage(linkParse(htmlDecode(obj.message, decode))));
        msg = `<div class="chat-txt">`+msg+`</div>`;
    }else if(obj.type == 2){

        if ("content" in JSON.parse(obj.message)) {
            var obj_message = JSON.parse(obj.message)['content']; // this is new format
            var caption = JSON.parse(obj.message)['caption'];
        } else {
            var obj_message = JSON.parse(obj.message); // this is old format
            var caption = "";
        }

        var images = obj_message;
        if (images.length > 2) {
            msg = `<div class="chat-img-grp chat-gallery" data-pswp-uid="1">`;
            var n = 1;
            var more_overlay = "";
            var each_img = "";
            $.each(obj_message, function(img_idx, img_obj) {
                var image_size_str = img_obj.split('_');
                var image_size = "600x600";
                if (image_size_str[1] !== undefined) {
                    image_size = image_size_str[1].substring(0, image_size_str[1].indexOf("."))
                }
                if (n > 3) {
                    var cls = "chat-img d-none";
                }else if (n == 3) {
                    if (images.length - 2 != 1)  {
                        var cls = "chat-img more";
                        more_overlay = `<span class="more-ovrlay">+`+(images.length - 3).toString()+`</span>`;
                    }else{
                        var cls = "chat-img";
                    }
                }else{
                    var cls = "chat-img";
                }
                each_img = `<figure class="`+cls+`">
                                <a href="{{MEDIA_URL}}/chats/images/large/`+img_obj+`" data-size="`+image_size+`">
                                    <img class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="{{MEDIA_URL}}/chats/images/thumb/`+img_obj+`" />
                                    `+more_overlay+`
                                </a>
                            </figure>`;
                msg = msg + each_img;
                n++;
            });
            msg = msg + "</div>";
        }else if (images.length == 2) {
            msg = `<div class="chat-img-duo chat-gallery" data-pswp-uid="1"">`;
            $.each(obj_message, function(img_idx, img_obj) {
                var image_size_str = img_obj.split('_');
                var image_size = "600x600";
                if (image_size_str[1] !== undefined) {
                    image_size = image_size_str[1].substring(0, image_size_str[1].indexOf("."))
                }
                each_img = `<figure >
                                <a href="{{MEDIA_URL}}/chats/images/large/`+img_obj+`" data-size="`+image_size+`">
                                    <img class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="{{MEDIA_URL}}/chats/images/thumb/`+img_obj+`" />
                                </a>
                            </figure>`;
                msg = msg + each_img;
            });
            msg = msg + "</div>";
        }else{
            msg = `<div class="chat-img-sgl chat-gallery" data-pswp-uid="1"">`;
            $.each(obj_message, function(img_idx, img_obj) {
                var image_size_str = img_obj.split('_');
                var image_size = "600x600";
                if (image_size_str[1] !== undefined) {
                    image_size = image_size_str[1].substring(0, image_size_str[1].indexOf("."))
                }
                var image_size_px = image_size.split('x');
                if(image_size_px[0] >= 150){
                    var thumb_width = '220px';
                }else{
                    var thumb_width = image_size_px[0]+'px';
                }
                if(image_size_px[1] >= 150){
                    var thumb_height = '220px';
                }else{
                    var thumb_height = image_size_px[0]+'px';
                }

                var imgext = img_obj.split(".");
                each_img = `<figure class="`+imgext[1]+`">
                                <a href="{{MEDIA_URL}}/chats/images/large/`+img_obj+`" data-size="`+image_size+`">
                                    <img width="`+thumb_width+`" height="`+thumb_height+`" class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="{{MEDIA_URL}}/chats/images/thumb/`+img_obj+`" src="" />
                                </a>
                            </figure>`;
                msg = msg + each_img;
            });
            msg = msg + "</div>";
        }
        if (caption) {
            msg = msg + "<div class='file-caption'>" + linkParse(caption) + "</div>";
        }

    }else if(obj.type == 3){
        msg = `<div class="chat-gif"> <img class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="`+obj.message+`" /> </div>`;
    }else if (obj.type == 4){
        msg = `<div class="chat-sticker"> <img  class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="{{MEDIA_URL}}/stickers/`+encodeURI(obj.message)+`" /> </div>`;
    }else if(obj.type == 5){
        var json_msg = JSON.parse(obj.message);
        var original_msg = (window.emojione.shortnameToImage(linkParse(htmlDecode(json_msg.message))));
        msg =`<div class="chat-txt">`+original_msg+`</div>`;
        msg =  msg + getLinkPreview(json_msg);
    }else if(obj.type == 6){
        if ("content" in JSON.parse(obj.message)) {
            var obj_message = JSON.parse(obj.message)['content']; // this is new format
            var caption = JSON.parse(obj.message)['caption'];
        } else {
            var obj_message = JSON.parse(obj.message); // this is old format
            var caption = "";
        }

        $.each(obj_message, function(file_idx, file_obj) {
            try {
                var file_name  = file_obj.name.split('.')[0]+'.'+file_obj.extenstion;
                var file_ext  = file_obj.extenstion;
            } catch (error) {
                var file_name  = file_obj.name;
                var file_ext  = '';
            }
            var file_icon = getFileIcon(file_ext, 'file-icon');
            var each_file = `<div class="chat-files-block">
                <div class="file-section">
                    <a href="javascript:void(0)" class="file-header">
                        `+file_icon+`
                        <div class="file-description">
                            <span class="file-title" dir="auto">`+file_name+`</span>
                            <div class="file-meta">
                                <div class="file-meta-entry">
                                    <div class="file-meta-swap">`+file_obj.size+` `+file_obj.extenstion+` {{_('file')}}</div>
                                </div>
                            </div>
                        </div>

                    </a>
                    <div class="file-actions">
                        <a href="{{MEDIA_URL}}/chats/files/`+file_obj.name+`" download="`+file_name+`" class="file-action-buttons">
                            <i class="fas fa-download file-download-icon"  aria-hidden="true"></i>
                        </a>
                    </div>

                </div>
            </div>`;
            msg = msg + each_file;
        });
        if (caption) {
            msg = msg + "<div class='file-caption'>" + linkParse(caption) + "</div>";
        }

    }else if(obj.type == 7){
        var json_msg = JSON.parse(obj.message);
        msg =
           `<div class="chat-audio">
                <i class="fa fa-microphone-alt audio-icon"></i>
                <div class="cn-player">
                    <audio crossorigin>
                        <source src="{{MEDIA_URL}}/chats/audio/`+json_msg.name+`" type="audio/mpeg">
                    </audio>
                </div>
            </div>`;
    }else if(obj.type == 8){
        var json_msg = JSON.parse(obj.message);
        var msg_obj = {};
        msg_obj['type'] = json_msg.new_message.new_type;
        if(json_msg.new_message.new_type == 5 || json_msg.new_message.new_type == 10){
            msg_obj['message'] = JSON.stringify(json_msg.new_message.new_content);
        }else{
            msg_obj['message'] = json_msg.new_message.new_content;
        }

        msg_obj['id'] = "";
        var new_msg = messageHtml(msg_obj, decode);

        var replied_data = JSON.parse(repliedMessage(json_msg.reply_message.reply_content, json_msg.reply_message.reply_type));

        var current_message = replied_data['current_message'];
        var current_preview = replied_data['current_preview'];

        if(json_msg.reply_message.reply_from_id == USER.id){
            var replied_to = "{{_('Your chat')}}";
        }else{
            var replied_to = json_msg.reply_message.reply_from + "'s {{_('chat')}}";
        }
        var reply_msg = `<div class="replied-to" data-chat-id="`+json_msg.reply_message.reply_id+`">
            <span class="replied-border"></span>
            <div class="replied-content">
                <div class="replied-content-data">
                    <div class="replied-user" >`+replied_to+`</div>
                    <div class="replied-html">
                        `+ htmlDecode(current_message)+`
                    </div>
                </div>
            </div>
            <div class="replied-preview">
                `+current_preview+`
            </div>
        </div>`;

        msg = `<div class="chat-replied-bubble">`+ reply_msg + new_msg + `</div>`;
    }else if(obj.type == 9){
        var json_msg = JSON.parse(obj.message);
        var msg_obj = {};
        msg_obj['type'] = json_msg.type;
        if(json_msg.type == 10){
            msg_obj['message'] = JSON.stringify(json_msg.message);
        }else{
            msg_obj['message'] = json_msg.message;
        }
        
        var new_msg = messageHtml(msg_obj);
        msg = `<div class="chat-fwd"><span class="fwd-label"><i class="fa fa-share"></i> {{_('Forwarded')}} </span>` + new_msg + `</div>`;
    }else if(obj.type == 10){
        
        try {
            var json_msg = JSON.parse(obj.message);
            msg = '<div class="chat-code line-numbers"><pre class="language-'+json_msg['lang']+'">' +
            '<code>'+json_msg['code']+'</code></pre><div class="code-caption"><div class="code-lang">'+json_msg['lang']+'</div><div class="code-title">'+json_msg['caption']+'</div></div></div>';
        } catch (error) {
            console.log(error);
            msg = '<div class="chat-code">#FAILED</div>';
        }
        
    }else if(obj.type == 11){
        if ("content" in JSON.parse(obj.message)) {
            var obj_message = JSON.parse(obj.message)['content']; // this is new format
            var caption = JSON.parse(obj.message)['caption'];
        } 
        $.each(obj_message, function (file_idx, file_obj) {
            var thumb_file = '{{MEDIA_URL}}/chats/videos/' +file_obj.name.split('.').slice(0, -1).join('.') + '.png';
            var default_thumb_file = '{{STATIC_URL}}/img/default_video.jpg';
            var video_file = '{{MEDIA_URL}}/chats/videos/' +file_obj.name;
            var each_file = `<div class="chat-video-block" data-video="`+video_file+`">
                <div class="video-section">
                    <a class="video-link" href="javascript:void(0);" >
                        <img class="video-thumb" src="`+thumb_file+`" onerror="this.src='`+default_thumb_file+`'" />
                    </a>
                </div>
            </div>`;
            msg = msg + each_file;
        });
        if (caption) {
            msg = msg + "<div class='file-caption'>" + linkParse(caption) + "</div>";
        }
    }   

    return msg;
}

function repliedMessage(current_message, current_message_type){
    var replied_html = "";
    var replied_preview = "";
    if(current_message_type == 1){ // text message
        replied_html = (window.emojione.shortnameToImage(linkParse(htmlDecode(current_message, true))));
    }else if (current_message_type == 2) { // image message
        if ("content" in JSON.parse(current_message)) {
            var images = JSON.parse(current_message)['content']; // this is new format
        } else {
            var images = JSON.parse(current_message); // this is old format
        }
        if (images.length > 1) {
            replied_html = "<i class='fa fa-image'></i> "+images.length+" {{_('Images')}}";
        }else{
            replied_html = "<i class='fa fa-image'></i> {{_('Image')}}";
        }
        replied_preview = `<img class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="{{MEDIA_URL}}/chats/images/thumb/`+images[0]+`" />`;
    }else if (current_message_type == 3) { // gif message
        replied_html = "<i class='fa fa-image'></i> {{_('GIF')}}";
        replied_preview = `<img class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="`+current_message+`" />`;
    }else if (current_message_type == 4) { // sticker message
        replied_html = "<i class='fa fa-smile'></i> {{_('Sticker')}}";
        replied_preview = `<img  class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="{{MEDIA_URL}}/stickers/`+encodeURI(current_message)+`" />`;
    }else if (current_message_type == 5) { // url message
        replied_html = (window.emojione.shortnameToImage(linkParse(htmlDecode(JSON.parse(current_message)['message']))));
        replied_preview = `<img class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="`+JSON.parse(current_message)['image']+`" />`;
    }else if (current_message_type == 6) { // file message
        var files = JSON.parse(current_message);
        if (files.length > 1) {
            replied_html = "<i class='fa fa-file-alt'></i> "+files.length+" {{_('Files')}}";
        }else{
            replied_html = "<i class='fa fa-file-alt'></i> {{_('File')}}";
        }
    }else if (current_message_type == 7) { // audio message
        if(JSON.parse(current_message)['duration'] === undefined){
            var duration = "";
        }else{
            var duration = JSON.parse(current_message)['duration'];
        }
        replied_html = "<i class='fa fa-microphone-alt'></i> "+duration+" {{_('Audio Message')}}";
    }else if (current_message_type == 8) { // reply message
        var replied_data = JSON.parse(repliedMessage(JSON.parse(current_message)['new_message'], JSON.parse(current_message)['new_message_type']));
        var replied_html = replied_data['current_message'];
        var replied_preview = replied_data['current_preview'];
    }else if (current_message_type == 10){ // code message, type = 9 is forward message
        var code_lang = JSON.parse(current_message)['lang'];
        var replied_html = "<i class='fa fa-code'></i> "+code_lang+" {{_('code')}}";
    }else if (current_message_type == 11) { // video message
        replied_html = "<i class='fa fa-video'></i> {{_('Video')}}";
    }

    var msg_obj = {};
    msg_obj['current_message'] = replied_html;
    msg_obj['current_preview'] = replied_preview;
    return JSON.stringify(msg_obj);
}

// change user restrictions
function changeActiveUserRestriction(restriction_type, current_status){
    $('.chat-info-action').tooltip('dispose');
    var chat_meta_id = $("#chat_meta_id").val();
    $.ajax({
        url: "{{ url('ajax-active-user-restriction') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            restriction_type: restriction_type,
            current_status: current_status,
            chat_meta_id: chat_meta_id,
        },
        success: function(data) {
            if(data.success){
                getActiveInfo(false, false);
                if(data.type == "is_blocked"){
                    restrictTypingArea(data.status, "{{_('Blocked by you')}}");
                }
            }
            
        }
    });
}


// load active users
function loadActiveUsers(){
    var active_room = $("#active_room").val();
    var user_list_sec = $(".list-section.active").attr('id');
    $.ajax({
        url: "{{ url('ajax-online-list') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            active_room: active_room,
            user_list_section: user_list_sec,
        },
        success: function(data) {
            if(user_list_sec == 'dm'){
                $('.dm-list').empty();
                if ('dm_list' in data) {

                    $.each(data.dm_list, function( index, obj ) {
                        var chat_li = createOnlineUser(obj);
                        $('.dm-list').append(chat_li);
                    });

                    if(parseInt($('#dm_user_count').val()) > 21){
                        $('.load-more-dm-users').show();
                    }
                }
            }else{
                $('.online-list').empty();
                $('.fav-list').empty();
                if ('default_group' in data) {
                    var unread_count_html = "";
                    var group_mute_icon = "";
                    if(data.default_group.unread_count > 0){
                        if (data.default_group.unread_count > 9) {
                            var unread_cnt = '9+';
                        }else{
                            var unread_cnt = data.default_group.unread_count;
                        }
                        unread_count_html = `<span class="badge badge-danger badge-counter">` + unread_cnt + `</span>`;
                    }
                    if(data.default_group.is_muted){
                        group_mute_icon = `<i class="fas fa-bell-slash"></i>`;
                    }
                    var group_li =
                    `<div id="" class="recent-chat chat-item group-item" data-user-id="">
                        <div class="user-list-item ">
                            <div class="user-avatar">
                                <img class="img-profile mr-2" src="` + data.default_group.cover_url + `">
                            </div>
                            <div class="user-info">
                                <div class="chat-name">` + data.default_group.room_data.name + ` ` + group_mute_icon + `</div>
                                <div class="chat-preview">
                                    ` + data.default_group.room_data.name + ` {{_('Chat Room')}}
                                </div>
                            </div>
                            <div class="chat-meta">` + unread_count_html + `</div>
                        </div>
                    </div><hr class="group-sep">`;

                    $('.online-list').append(group_li);

                }


                if ('list' in data) {

                    $.each(data.list, function( index, obj ) {

                        var chat_li = createOnlineUser(obj);
                        $('.online-list').append(chat_li);
                        if(obj.is_favourite && !obj.blocked_by_you){
                            $('.fav-list').append(chat_li);
                        }
                    });

                    if(parseInt($('#chat_room_user_count').val()) > 21){
                        $('.load-more-users').show();
                    }
                }
            }

            if(data.unread_dm_total > 0){
                $('.dm-all-unread').html(data.unread_dm_total);
                $('.dm-all-unread').show();
            }else{
                $('.dm-all-unread').hide();
            }
        },
        complete: function(){
            if(user_list_sec == 'dm'){
                $('.refresh-dm-list').hide();
            }else{
                $('.refresh-user-list').hide();
            }
        }
    });
}


// change group restrictions
function changeActiveGroupRestriction(restriction_type, current_status){
    $('.chat-info-action').tooltip('dispose');
    var chat_meta_id = $("#chat_meta_id").val();
    $.ajax({
        url: "{{ url('ajax-active-group-restriction') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            restriction_type: restriction_type,
            current_status: current_status,
            chat_meta_id: chat_meta_id,
        },
        success: function(data) {
            if(data.success){
                getActiveInfo(false, false);
            }
        }
    });
}


// load more chats
function load_more_chats(direction){
    var active_user = $("#active_user").val();
    var active_group = $("#active_group").val();
    var active_room = $("#active_room").val();

    $.ajax({
        url: "{{ url('ajax-load-more-chats') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            active_user: active_user,
            active_group: active_group,
            active_room: active_room,
            direction: direction
        },
        beforeSend: function() {
            loading(".messages","show");
        },
        success: function(data) {
            $.each(data.chats, function( index, obj ) {
                if (direction=='down') {
                    direction='none';
                }
                createMessage(obj, direction);
            });

        },complete: function(){
            loading(".messages","hide");
            lazyLoad();
            GreenAudioPlayer.init({
                selector: '.cn-player',
                stopOthersOnPlay: true,
            });
        }

    });
}

function getFileIcon(ext, custom_cls=""){
    var icon = "";
    if (ext == "pdf") {
        icon = `<i class="far fa-file-pdf pdf-icon `+custom_cls+`"></i>`;
    } else if (ext.indexOf("doc") != -1) {
        icon = `<i class="far fa-file-word word-icon `+custom_cls+`"></i>`;
    } else if (ext.indexOf("xls") != -1) {
        icon = `<i class="far fa-file-excel excel-icon `+custom_cls+`"></i>`;
    } else if (ext.indexOf("ppt") != -1) {
        icon = `<i class="far fa-file-powerpoint powerpoint-icon `+custom_cls+`"></i>`;
    } else if (ext == "zip") {
        icon = `<i class="far fa-file-archive common-icon `+custom_cls+`"></i>`;
    } else if ($.inArray(ext, ['jpg', 'jpeg', 'png', 'gif']) >= 0) {
        icon = `<i class="far fa-file-image common-icon `+custom_cls+`"></i>`;
    } else {
        icon = `<i class="far fa-file-alt common-icon `+custom_cls+`"></i>`;
    }

    return icon;
}


function startRecording() {
	console.log("startRecording() called");
    $('.mic-icon').tooltip('dispose');
    $('.mic-icon').tooltip({
        title: "{{_('Starting...')}}",
        placement:"right",
        trigger:"manual",
    }).tooltip('show');
    var constraints = { audio: true, video:false }
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing WebAudioRecorder...");
		audioContext = new AudioContext();
		gumStream = stream;
		input = audioContext.createMediaStreamSource(stream);
		recorder = new WebAudioRecorder(input, {
		    workerDir: "{{STATIC_URL}}/vendor/web-audio-recorder/",
            encoding: 'mp3',
    		numChannels:2,
		    onEncoderLoading: function(recorder, encoding) {
		        console.log("Loading "+encoding+" encoder...");
		    },
		    onEncoderLoaded: function(recorder, encoding) {
		        console.log(encoding+" encoder loaded");
		    }
		});

		recorder.onComplete = function(recorder, blob) {
			console.log("Encoding complete");
            $('.message-audio').removeClass('recording-started');
            $('.mic-icon').tooltip('dispose');
            $('.mic-icon').tooltip({
                title: "{{_('Sending...')}}",
                placement:"right",
                trigger:"manual",
            }).tooltip('show');
            var reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onload = function(event){

               var fd = {};
               fd["data"] = event.target.result;
               fd["csrftoken"] = '{{ csrf_token_ajax() }}';
               fd["recordingTime"] = recordingTime;
                $.ajax({
                    type: 'POST',
                    url: "{{ url('ajax-send-audio') }}",
                    data: fd,
                    success: function(data) {
                        if (data) {
                            if ($('.reply-msg-row').hasClass('reply-msg-row-show')) {
                                var new_msg_data = {}
                                new_msg_data['new_content'] = JSON.stringify(data);
                                new_msg_data['new_type'] = 7;

                                var msg_data = {};
                                msg_data['reply_message'] = JSON.parse($('.reply-msg-row').data('reply-content'));
                                msg_data['new_message'] = new_msg_data;
                                $(".close-reply-msg").trigger("click");
                                newMessage(JSON.stringify(msg_data), 8);

                            }else{
                                newMessage(JSON.stringify(data), 7);
                            }

                        }
                    },
                    complete: function(){
                        $('.mic-icon').tooltip('dispose');
                    }
                });
            };
		}

		recorder.setOptions({
            timeLimit:120,
            encodeAfterRecord:encodeAfterRecord,
            ogg: {quality: 0.5},
            mp3: {bitRate: 160}
	    });

		recorder.startRecording();
		console.log("Recording started");
        $('.message-audio').addClass('recording-started');
        $('.mic-icon').tooltip('dispose');
        $('.mic-icon').tooltip({
            placement:"right",
            trigger:"manual",
            html:true,
            sanitize:false,
            title:'<span class="rec-controlls"><i class="fa text-danger fa-times-circle rec-cancel"></i> <label id="minutes">00</label>:<label id="seconds">00</label> <i class="fa text-success fa-check-circle rec-stop"></i></span>'
        }).tooltip('show');

        $('.mic-icon').on('shown.bs.tooltip', function () {
            var minutesLabel = document.getElementById("minutes");
            var secondsLabel = document.getElementById("seconds");
            var totalSeconds = 0;
            setInterval(setTime, 1000);
            function setTime() {
              ++totalSeconds;
              secondsLabel.innerHTML = pad(totalSeconds % 60);
              minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
            }
            function pad(val) {
              var valString = val + "";
              if (valString.length < 2) {
                return "0" + valString;
              } else {
                return valString;
              }
            }
        });

	}).catch(function(err) {
        console.log(err);
        $('.message-audio').removeClass('recording');
        $('.message-audio').removeClass('recording-started');
	});

}

function stopRecording() {
	console.log("stopRecording() called");
    $('.mic-icon').tooltip('dispose');
    $('.mic-icon').tooltip({
        title: "{{_('Encoding...')}}",
        placement:"right",
        trigger:"manual",
    }).tooltip('show');
	//stop microphone access
	gumStream.getAudioTracks()[0].stop();
    recordingTime = recorder.recordingTime();
	//tell the recorder to finish the recording (stop recording + encode the recorded audio)
	recorder.finishRecording();
	console.log('Recording stopped');
}

function cancelRecording() {
	console.log("cancelRecording() called");
	gumStream.getAudioTracks()[0].stop();
	recorder.cancelRecording();
    $('.message-audio').removeClass('recording-started');
    $('.mic-icon').tooltip('dispose');
	console.log('Recording cancelled');
}



function chatSearch(){
    var q = $("#search-query").val();
    var active_user = $("#active_user").val();
    var active_group = $("#active_group").val();
    var active_room = $("#active_room").val();
    if (q && q.length >= 1) {
        $.ajax({
            url: "{{ url('ajax-chat-search') }}",
            type: "POST",
            dataType: 'json',
            data: {
                q: q,
                csrftoken: '{{ csrf_token_ajax() }}',
                active_user: active_user,
                active_group: active_group,
                active_room: active_room
            },
            beforeSend: function() {
                $('.results').empty();
                loading(".search-panel","show");
            },
            success: function(data) {
                $.each(data.chats, function( index, obj ) {
                    var res_chat_time = moment(obj.time+SETTINGS.system_timezone_offset).tz(USER.timezone).fromNow();
                    res_chat_time = res_chat_time + " - " + moment(obj.time+SETTINGS.system_timezone_offset).tz(USER.timezone).format('YYYY-MM-DD HH:mm A');
                    if (obj.sender_id == USER.id) {
                        var res_name = 'You';
                    }else{
                        if (SETTINGS.display_name_format == 'username') {
                        	var display_name = obj.user_name;
                        }else{
                        	var display_name = obj.first_name;
                        }
                        var res_name = display_name;
                    }
                    var res_msg = "";
                    if (obj.type==1) {
                        res_msg = linkParse(htmlDecode(obj.message, true));
                    }else if(obj.type == 2){
                        res_msg = "<i class='fa fa-image'></i> {{_('Shared an Image')}}";
                    }else if(obj.type == 3){
                        res_msg = "<i class='fa fa-image'></i> {{_('Shared a GIF')}}";
                    }else if(obj.type == 4){
                        res_msg = "<i class='fa fa-smile'></i> {{_('Shared a Sticker')}}";
                    }else if(obj.type == 5){
                        res_msg = "<i class='fa fa-link'></i> {{_('Shared a Link')}}";
                    }else if(obj.type == 6){
                        res_msg = "<i class='fa fa-file-alt'></i> {{_('Sent a File')}}";
                    }else if(obj.type == 7){
                        res_msg = "<i class='fa microphone-alt'></i> {{_('Sent an Audio Message')}}";
                    }else if(obj.type == 8){
                        if(JSON.parse(obj.message)['new_message']['new_type'] == 1){
                            res_msg = "Reply : "+JSON.parse(obj.message)['new_message']['new_content'];
                        }else if(JSON.parse(obj.message)['new_message']['new_type'] == 2){
                            res_msg = "Reply : <i class='fa fa-image'></i> {{_('Shared an Image')}}";
                        }else if(JSON.parse(obj.message)['new_message']['new_type'] == 3){
                            res_msg = "Reply : <i class='fa fa-image'></i> {{_('Shared a GIF')}}";
                        }else if(JSON.parse(obj.message)['new_message']['new_type'] == 4){
                            res_msg = "Reply : <i class='fa fa-smile'></i> {{_('Shared a Sticker')}}";
                        }else if(JSON.parse(obj.message)['new_message']['new_type'] == 5){
                            res_msg = "Reply : <i class='fa fa-link'></i> {{_('Shared a Link')}}";
                        }else if(JSON.parse(obj.message)['new_message']['new_type'] == 6){
                            res_msg = "Reply : <i class='fa fa-file-alt'></i> {{_('Sent a File')}}";
                        }else if(JSON.parse(obj.message)['new_message']['new_type'] == 7){
                            res_msg = "Reply : <i class='fa microphone-alt'></i> {{_('Sent an Audio Message')}}";
                        }else if(JSON.parse(obj.message)['new_message']['new_type'] == 10){
                            res_msg = "Reply : <i class='fa fa-code'></i> {{_('Sent a Code')}}";
                        }else if(JSON.parse(obj.message)['new_message']['new_type'] == 11){
                            res_msg = "Reply : <i class='fa fa-video'></i> {{_('Sent a Video')}}";
                        }
                    }else if(obj.type == 9){
                        res_msg = "<i class='fa fa-share'></i> {{_('Forwarded Message')}}";
                    }else if(obj.type == 10){
                        res_msg = "<i class='fa fa-code'></i> " +JSON.parse(obj.message)['lang']+ " {{_('Code')}}";
                    }else if(obj.type == 11){
                        res_msg = "<i class='fa fa-video'></i> {{_('Sent a Video')}}";
                    }
                    var result =
                    `<li class="result" data-chat-id="`+obj.id+`">
                        <div>
                            <p class="res-chat-time">`+res_chat_time+`</p>
                            <p class="res-chat-txt"><small><i><b>`+res_name+`:</b></i></small> `+res_msg+`</p>
                        </div>
                    </li>`;
                    $('.results').append(result);
                });

            },complete: function(){
                loading(".search-panel","hide");
            }
        });
    }else{
        $('.results').empty();
    }
}

function createOnlineUser(obj){


    var list_user_timezone = obj.timzone;
    var user_status_class = "offline";

    if(obj.online_status>0){
        if(obj.user_status == 1){
            user_status_class = "online";
        }else if(obj.user_status == 2){
            user_status_class = "offline";
        }else if(obj.user_status == 3){
            user_status_class = "busy";
        }else if(obj.user_status == 4){
            user_status_class = "away";
        }
    }else{
        user_status_class = "offline";
    }

    var last_msg = "Blocked";
    var last_message_time = "";
    var space_dot = "";
    var unread_count = "";
    var unread_count_html = "";
    var mute_icon = "";
    var sex = "";
    var country = "";
    var user_type = "";

    if (SETTINGS.list_show_gender){
        if (obj.sex != "") {
            if (obj.sex == 1) {
                sex = '<i class="fas fa-gender fa-mars"></i>';
            }else if(obj.sex == 2){
                sex = '<i class="fas fa-gender fa-venus"></i>';
            }else if(obj.sex == 3){
                sex = '<i class="fas fa-gender fa-genderless"></i>';
            }
        }
    }

    if (SETTINGS.list_show_user_type){
        if (obj.user_type != "") {
            if (obj.user_type == 1) {
                user_type = "<span class='user-type-badge admin'>{{_('ADMIN')}}</span>";
            }else if(obj.user_type == 4){
                user_type = "<span class='user-type-badge mod'>{{_('MOD')}}</span>";
            }else if(obj.user_type == 2){
                var active_room_created_by = $('#active_room_created_by').val();
                if(active_room_created_by == obj.user_id){
                    user_type = "<span class='user-type-badge creator'>{{_('CREATOR')}}</span>";
                }else if(obj.is_mod == 1){
                    user_type = "<span class='user-type-badge room-mod'>{{_('MOD')}}</span>";
                }
            }
        }
        
    }

    
    if (SETTINGS.list_show_country){
        if (obj.country !== undefined && obj.country !== null) {
            country = '<span class="flag-icon flag-icon-'+obj.country.toLowerCase()+'"></span>';
        }
    }

    if(!obj.blocked_by_him && !obj.blocked_by_you){
        if(obj.last_message_status == 3){
            last_msg = "<i class='fa fa-ban'></i> {{_('Deleted')}}";
        }else if(obj.last_message_type == 1){
            if(emojione){
                last_msg = (window.emojione.shortnameToImage(linkParse(htmlDecode(obj.last_message, true))));
            }else{
                last_msg = linkParse(htmlDecode(obj.last_message, true));
            }
        }else if(obj.last_message_type == 2){
            last_msg = "<i class='fa fa-image'></i> {{_('Image')}}";
        }else if(obj.last_message_type == 3){
            last_msg = "<i class='fa fa-image'></i> {{_('GIF')}} ";
        }else if(obj.last_message_type == 4){
            last_msg = "<i class='fa fa-smile'></i> {{_('Sticker')}}";
        }else if(obj.last_message_type == 5){
            last_msg = "<i class='fa fa-link'></i> {{_('Link')}}";
        }else if(obj.last_message_type == 6){
            last_msg = "<i class='fa fa-file-alt'></i> {{_('File')}}";
        }else if(obj.last_message_type == 7){
            last_msg = "<i class='fa microphone-alt'></i> {{_('Audio')}} ";
        }else if(obj.last_message_type == 8){
            last_msg = "<i class='fa fa-reply'></i> {{_('Reply Message')}} ";
        }else if(obj.last_message_type == 9){
            last_msg = "<i class='fa fa-share'></i> {{_('Forwarded Message')}} ";
        }else if(obj.last_message_type == 10){
            var code_lang = JSON.parse(obj.last_message)['lang'];
            var last_msg = "<i class='fa fa-code'></i> "+code_lang+" {{_('code')}}";
        }else if(obj.last_message_type == 11){
            last_msg = "<i class='fa fa-video'></i> {{_('Video')}} ";
        }else{
            if (SETTINGS.display_name_format == 'username') {
            	var display_name = obj.user_name;
            }else{
            	var display_name = obj.first_name;
            }
            last_msg = "{{_('Say hi to')}} " + display_name ;
        }

        last_message_time = "";
        space_dot = "";
        if(obj.last_message_time > 0){
            last_message_time = moment(obj.last_message_time+SETTINGS.system_timezone_offset).tz(USER.timezone).fromNow();
            space_dot = "·";
        }

        unread_count = 0;
        if(obj.unread_count ){
            unread_count = obj.unread_count;
        }

        unread_count_html = "";
        if(unread_count > 0){
            if (unread_count > 9) {
                unread_count = '9+';
            }
            unread_count_html = `<span class="badge badge-danger badge-counter">` + unread_count + `</span>`;
        }
    }else if(obj.blocked_by_you){
        last_msg = "{{_('Blocked by you')}}";
    }else if(obj.blocked_by_him){
        last_msg = "{{_('Blocked by user')}}";
    }

    if(obj.is_muted){
        mute_icon = '<i class="fas fa-bell-slash"></i>';
    }

    if (SETTINGS.display_name_format == 'username') {
        var display_name = obj.user_name;
    }else{
        var display_name = obj.first_name + ' ' + obj.last_name;
    }

    var img_src = getUserAvatar(obj, display_name);

    var user_options = '';
    if (SETTINGS.is_authenticated == true  && disable_private_chats==false) {
        user_options = `<div class="user-options">
        <div class="dropdown">
        <a data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fas fa-ellipsis-v"></i>
        </a>
        <div class="dropdown-menu" >
            <a class="dropdown-item view-profile" data-user-id="` + obj.user_id + `" href="#">{{_('View Profile')}}</a>
        </div>
        </div>
        </div>`;
    }
    

    var chat_li =
    `<div id="" class="recent-chat chat-item" data-user-id="` + obj.user_id + `" data-user-name="` + obj.user_name + `">
        <div class="user-list-item ">
            <div class="user-avatar">
                <div class="online-status ` + user_status_class + `"><i class="fa fa-circle"></i></div>
                <img class="img-profile mr-2" src="`+img_src+`">
            </div>
            <div class="user-info">
                <div class="chat-name"><span class="chat-name-text">` + display_name + `</span> ` + sex + ` ` + country + ` `+ user_type+ ` `+ mute_icon+ ` </div>
                <div class="chat-preview">
                    <span class="chat-is-read">` + last_msg + `</span>
                    <div aria-hidden="true" class="spacer-dot">` + space_dot + `</div>
                    <abbr class="chat-time" data-utime="">` + last_message_time + `</abbr>
                </div>
                `+user_options+`
            </div>
            <div class="chat-meta">` + unread_count_html + `</div>
        </div>
    </div>`;

    return chat_li;
}

function createForwardUser(obj){

    var list_user_timezone = obj.timzone;
    var user_status_class = "offline";
    var user_status_class_html = "{{_('offline')}}";

    if(obj.online_status>0){
        if(obj.user_status == 1){
            user_status_class = "online";
            user_status_class_html = "{{_('online')}}";
        }else if(obj.user_status == 2){
            user_status_class = "offline";
            user_status_class_html = "{{_('offline')}}";
        }else if(obj.user_status == 3){
            user_status_class = "busy";
            user_status_class_html = "{{_('busy')}}";
        }else if(obj.user_status == 4){
            user_status_class = "away";
            user_status_class_html = "{{_('away')}}";
        }
    }else{
        user_status_class = "offline";
    }

    var sex = "";
    var country = "";
    var user_type = "";

    if (SETTINGS.list_show_gender){
        if (obj.sex != "") {
            if (obj.sex == 1) {
                sex = '<i class="fas fa-gender fa-mars"></i>';
            }else if(obj.sex == 2){
                sex = '<i class="fas fa-gender fa-venus"></i>';
            }else if(obj.sex == 3){
                sex = '<i class="fas fa-gender fa-genderless"></i>';
            }
        }
    }

    
    if (SETTINGS.list_show_user_type){
        if (obj.user_type != "") {
            if (obj.user_type == 1) {
                user_type = "<span class='user-type-badge admin'>{{_('ADMIN')}}</span>";
            }else if(obj.user_type == 4){
                user_type = "<span title='{{_('Global Moderator')}}' class='user-type-badge mod'>{{_('MOD')}}</span>";
            }else if(obj.user_type == 2){
                var active_room_created_by = $('#active_room_created_by').val();
                if(active_room_created_by == obj.user_id){
                    user_type = "<span title='{{_('Room Creator')}}' class='user-type-badge creator'>{{_('CREATOR')}}</span>";
                }else if(obj.is_mod == 1){
                    user_type = "<span title='{{_('Room Moderator')}}' class='user-type-badge room-mod'>{{_('MOD')}}</span>";
                }
            }
        }
    }

    
    if (SETTINGS.list_show_country){
        if (obj.country !== undefined && obj.country !== null) {
            country = '<span class="flag-icon flag-icon-'+obj.country.toLowerCase()+'"></span>';
        }
    }

    if (SETTINGS.display_name_format == 'username') {
        var display_name = obj.user_name;
    }else{
        var display_name = obj.first_name + ' ' + obj.last_name;
    }

    var img_src = getUserAvatar(obj, display_name);


    var checked = "";
    if($.inArray(obj.user_id, forward_user_list) > -1){
        checked = "checked";
    }

    if(obj.blocked_by_him || obj.blocked_by_you){
        var chat_li = "";
    }else{
        var chat_li =
        `<label id="" class="recent-chat " for="` + obj.user_id + `_0_chat" data-id="` + obj.user_id + `" data-name="` + display_name + `">
            <div class="channel-check">
                <input class="chat-list-check" `+checked+` type="checkbox" id="` + obj.user_id + `_0_chat" data-is-group=0 data-id="` + obj.user_id + `" data-name="` + display_name + `" name="forward_chat_list" />
            </div>
            <div class="user-list-item ">
                <div class="user-avatar">

                    <img class="img-profile mr-2" src="`+img_src+`">
                </div>
                <div class="user-info">
                    <div class="chat-name"><span class="chat-name-text">` + display_name + `</span> ` + sex + ` ` + country + ` `+ user_type+ ` </div>
                    <div class="chat-preview">
                        <span class="chat-is-read ` + user_status_class + `"><i class="fa fa-circle"></i> ` + user_status_class_html + `</span>
                        <div aria-hidden="true" class="spacer-dot"></div>
                        <abbr class="chat-time" data-utime=""></abbr>
                    </div>
                </div>
            </div>
        </label>`;
    }

    return chat_li;
}

function roomUserSearch(){
    if($('.forward-modal').is(':visible')){
        forwardRoomUserSearch();
    }else{
        room_user_search_mode = true;
        var search_from = $(".list-section.active").attr('id');

        var q = $(".room-user-search").val();
        var active_room = $("#active_room").val();
        if (q && q.length >= 1) {
            $.ajax({
                url: "{{ url('ajax-room-user-search') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    q: q,
                    csrftoken: '{{ csrf_token_ajax() }}',
                    active_room: active_room,
                    search_from: search_from,
                },
                beforeSend: function() {
                    loading(".online-list","show");
                },
                success: function(data) {
                    if (search_from == 'room') {
                        $(".online-list").empty();
                        if ('list' in data) {
                            $.each(data.list, function( index, obj ) {
                                var chat_li = createOnlineUser(obj);
                                $('.online-list').append(chat_li);
                            });
                        }
                    }else if (search_from == 'fav'){
                        $(".fav-list").empty();
                        if ('list' in data) {
                            $.each(data.list, function( index, obj ) {
                                var chat_li = createOnlineUser(obj);
                                if(obj.is_favourite && !obj.blocked_by_you){
                                    $('.fav-list').append(chat_li);
                                }
                            });
                        }
                    }else if (search_from == 'dm'){
                        $(".dm-list").empty();
                        if ('dm_list' in data) {
                            $.each(data.dm_list, function( index, obj ) {
                                var chat_li = createOnlineUser(obj);
                                $('.dm-list').append(chat_li);
                            });
                        }
                    }

                },complete: function(){
                    loading(".online-list","hide");
                }
            });
        }else{
            loadActiveUsers();
            room_user_search_mode = false;
        }
    }
}

function forwardRoomUserSearch(){
    var search_from = 'forward';
    var active_room = $("#active_room").val();

    var q = $(".forward-room-user-search").val();
    if (q && q.length >= 1) {
        $.ajax({
            url: "{{ url('ajax-room-user-search') }}",
            type: "POST",
            dataType: 'json',
            data: {
                q: q,
                csrftoken: '{{ csrf_token_ajax() }}',
                active_room: active_room,
                search_from: search_from
            },
            beforeSend: function() {
                loading(".forward-online-list","show");
            },
            success: function(data) {
                forwardActionDisplay();
                $('.forward-online-list').empty();
                if ('list' in data) {
                    $.each(data.list, function( index, obj ) {
                        var chat_li = createForwardUser(obj);
                        $('.forward-online-list').append(chat_li);
                    });
                }

            },complete: function(){
                // LetterAvatar.transform();
                loading(".forward-online-list","hide");
            }
        });
    }else{
        forwardUserList();
    }
}

function forwardUserList(){
    var active_room = $("#active_room").val();
    $.ajax({
        url: "{{ url('ajax-online-list') }}",
        type: "POST",
        dataType: 'json',
        data: {
            active_room: active_room,
            csrftoken: '{{ csrf_token_ajax() }}',
            user_list_section: 'forward'
        },
        success: function(data) {
            // $('.forward-actions').addClass('hidden');
            forwardActionDisplay();
            $('.forward-modal').modal('show');
            $('.forward-online-list').empty();
            if ('default_group' in data) {
                var unread_count_html = "";
                var group_mute_icon = "";
                if(data.default_group.unread_count > 0){
                    unread_count_html = `<span class="badge badge-danger badge-counter">` + data.default_group.unread_count + `</span>`;
                }
                if(data.default_group.is_muted){
                    group_mute_icon = `<i class="fas fa-bell-slash"></i>`;
                }
                var room_checked = "";
                if($.inArray(data.default_group.id, forward_group_list) > -1){
                    room_checked = "checked";
                }
                var group_li =
                `<label id="" class="recent-chat " for="` + data.default_group.id + `_1_chat" data-id="` + data.default_group.id + `" data-name="` + data.default_group.name + `">
                    <div class="channel-check">
                        <input class="chat-list-check" `+room_checked+` type="checkbox" id="` + data.default_group.id+ `_1_chat" data-is-group=1 data-id="` + data.default_group.id + `" data-name="` + data.default_group.name + `" name="forward_chat_list" />
                    </div>
                    <div class="user-list-item ">
                        <div class="user-avatar">
                            <img class="img-profile mr-2" src="` + data.default_group.cover_url + `">
                        </div>
                        <div class="user-info">
                            <div class="chat-name">` + data.default_group.room_data.name + ` ` + group_mute_icon + `</div>
                            <div class="chat-preview">
                                ` + data.default_group.room_data.name + ` {{_('Chat Room')}}
                            </div>
                        </div>
                        <div class="chat-meta">` + unread_count_html + `</div>
                    </div>
                </label>`;

                $('.forward-online-list').append(group_li);

            }


            if ('list' in data) {

                $.each(data.list, function( index, obj ) {
                    var chat_li = createForwardUser(obj);
                    $('.forward-online-list').append(chat_li);
                });

                // if(parseInt($('#chat_room_user_count').val()) > 21){
                //     $('.load-more-users').show();
                // }
            }
        },
        complete: function(){
        }
    });
}

function forwardActionDisplay(){
    var selected_chat_item_count = forward_chat_item.length;
    var forward_html = "";
    if(selected_chat_item_count > 0){
        $('.forward-actions').removeClass('hidden');
        if(selected_chat_item_count == 1){
            forward_html = forward_chat_item[0];
        }else if (selected_chat_item_count > 1) {
            forward_html = forward_chat_item[0] + " & " + (selected_chat_item_count-1) + " other(s)";
        }
        $('.forward-name').html(forward_html);
    }else{
        $('.forward-actions').addClass('hidden');
    }
}

function roomListUnread(){
    $.ajax({
        url: "{{ url('ajax-room-list-unread') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
        },
        success: function(data) {
            if(data.total_unread > 0){
                if (data.total_unread > 9) {
                    $('.badge-all-unread').html('9+');
                }else{
                    $('.badge-all-unread').html(data.total_unread);
                }
            }else{
                $('.badge-all-unread').empty();
            }
        }
    });
}

function formatRoomOptions(room_selection) {
    var unread = $('#room-selector').find("option[value='" + room_selection.id + "']").data('unread');
    var users = $('#room-selector').find("option[value='" + room_selection.id + "']").data('users');
    var unread_badge = "";
    if(unread){
        unread_badge = '<span class="badge badge-danger badge-unread">'+unread+'</span>';
    }
    if(users){
        var user_count = ' <span class="badge badge-secondary">'+users+' <i class="fas fa-users"></i></span>';
    }else{
        if(users === 'null'){
            var user_count = ' <span class="badge badge-secondary">0 <i class="fas fa-users"></i></span>';
        }else{
            var user_count = '';
        }
    }
    var $room_selection = $('<span>' + room_selection.text + user_count + unread_badge+'</span>');
    return $room_selection;
};




function getRecentMedia(is_load_more=false){
    $('.selected-chat').hide();
    $('.recent-panel').show();

    var active_user = $("#active_user").val();
    var active_room = $("#active_room").val();
    var active_group = $("#active_group").val();
    var selected_media_type = $('.recent-max-items .active').data('type');

    $.ajax({
        url: "{{ url('ajax-get-recent') }}",
        type: "POST",
        dataType: 'json',
        data: {
            selected_media_type: selected_media_type,
            active_user: active_user,
            active_room: active_room,
            is_load_more: is_load_more,
            active_group: active_group,
            csrftoken: '{{ csrf_token_ajax() }}',
        },
        success: function(data) {
            if (selected_media_type == 2) { //images
                var recent_img_chat = ``;
                $.each(data.shared_media, function(all_img_idx, all_img_obj) {
                    if ("content" in JSON.parse(all_img_obj)) {
                        var decode_all_img_obj = JSON.parse(all_img_obj)['content']; // this is new format
                    } else {
                        var decode_all_img_obj = JSON.parse(all_img_obj); // this is old format
                    }
                    $.each(decode_all_img_obj, function(img_idx, img_obj) {
                        var image_size_str = img_obj.split('_');
                        var image_size = "600x600";
                        if (image_size_str[1] !== undefined) {
                            image_size = image_size_str[1].substring(0, image_size_str[1].indexOf("."))
                        }

                        var each_img = `<figure class="col-3 recent-img">
                                        <a  href="{{MEDIA_URL}}/chats/images/large/`+img_obj+`" data-size="`+image_size+`">
                                            <img class="img-responsive" src="{{MEDIA_URL}}/chats/images/thumb/`+img_obj+`" />
                                        </a>
                                    </figure>`;
                        recent_img_chat = recent_img_chat + each_img;
                    });
                });
                if (is_load_more==false) {
                    $('#recent-max-media .row').html(recent_img_chat);
                }else{
                    $('#recent-max-media .row').append(recent_img_chat);
                }
                initPhotoSwipeFromDOM('#recent-max-media .row');


            }else if(selected_media_type == 6){ //files
                var recent_file_chat = ``;
                
                $.each(data.shared_media, function(all_file_idx, all_file_obj) {
                    if ("content" in JSON.parse(all_file_obj)) {
                        var decode_all_file_obj = JSON.parse(all_file_obj)['content']; // this is new format
                    } else {
                        var decode_all_file_obj = JSON.parse(all_file_obj); // this is old format
                    }
                    $.each(decode_all_file_obj, function(file_idx, file_obj) {
                        var file_icon = getFileIcon(file_obj.extenstion, 'file-icon');
                        try {
                            var file_name  = file_obj.name.split('.')[0]+'.'+file_obj.extenstion;
                        } catch (error) {
                            var file_name  = file_obj.name;
                        }
                        var each_file = `<div class="chat-files-block">
                            <div class="file-section">
                                <a href="javascript:void(0)" class="file-header">
                                    `+file_icon+`
                                    <div class="file-description">
                                        <span class="file-title" dir="auto">`+file_name+`</span>
                                        <div class="file-meta">
                                            <div class="file-meta-entry">
                                                <div class="file-meta-swap">`+file_obj.size+` `+file_obj.extenstion+` file</div>
                                            </div>
                                        </div>
                                    </div>

                                </a>
                                <div class="file-actions">
                                    <a href="{{MEDIA_URL}}/chats/files/`+file_obj.name+`" download="`+file_name+`" class="file-action-buttons">
                                        <i class="fas fa-download file-download-icon"  aria-hidden="true"></i>
                                    </a>
                                </div>

                            </div>
                        </div>`;
                        recent_file_chat = recent_file_chat + each_file;
                    });
                });
                if (is_load_more==false) {
                    $('#recent-max-files .row').html(recent_file_chat);
                }else{
                    $('#recent-max-files .row').append(recent_file_chat);
                }

            }else if(selected_media_type == 5){ //links
                var recent_links_chat = ``;
                $.each(data.shared_media, function(all_links_idx, link_obj) {
                    link_obj = JSON.parse(link_obj)
                    if (!link_obj.image) {
                        var img_link = '{{STATIC_URL}}/img/default-image.png';
                    }else{
                        var img_link = link_obj.image;
                    }
                    var each_link = `<div class="chat-files-block">
                        <div class="file-section">
                            <a href="`+link_obj.url+`" target="_blank" class="file-header">
                                <img class="recent-link-preview" src="`+img_link+`" />
                                <div class="file-description">
                                    <span class="file-title" dir="auto">`+link_obj.title+`</span>
                                    <div class="file-meta">
                                        <div class="file-meta-entry">
                                            <div class="file-meta-swap">`+link_obj.message+` file</div>
                                        </div>
                                    </div>
                                </div>

                            </a>
                            <div class="file-actions">
                                <a href="`+link_obj.url+`" target="_blank" class="file-action-buttons">
                                    <i class="fas fa-external-link-alt file-download-icon"  aria-hidden="true"></i>
                                </a>
                            </div>

                        </div>
                    </div>`;
                    recent_links_chat = recent_links_chat + each_link;
                });
                if (is_load_more==false) {
                    $('#recent-max-links .row').html(recent_links_chat);
                }else{
                    $('#recent-max-links .row').append(recent_links_chat);
                }
            }
        },
        complete: function(){

        }
    });

}

function showAuthModal(){
    $("#auth-modal").modal();
}

function setChatCookie(name,value,days=30) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getChatCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function urldecode(url) {
    return decodeURIComponent(url.replace(/\+/g, ' '));
}

function isUrl(s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
}

function getUserAvatar(obj, display_name){
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

function get_chatroom_list(){
    var q = $('.room-sel-search').val();
    $.ajax({
        url: "{{ url('ajax-room-list') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            q : q
        },
        beforeSend: function() {
            loading(".room-list-area","show");
        },
        success: function(data) {
            console.log(data);
            $('.not-joined-room-list').html("");
            $('.room-list').html("");
            $.each(data.chat_rooms, function( index, obj ) {
                if(obj.cover_image){
                    var cover_image = '{{MEDIA_URL}}/chatrooms/' + obj.cover_image;
                }else{
                    var cover_image = "{{STATIC_URL}}/img/group.png";
                }
                
                var room_options = "";
                if(obj.is_protected){
                    room_options += '<small title="{{_("Password Protected")}}" class=""><i class="fas fa-key"></i> {{_("Protected")}} </small> ';
                }
                if(!obj.is_visible){
                    room_options += '<small title="{{_("Hidden Chat Room")}}" class="b"><i class="fas fa-eye-slash"></i> {{_("Hidden")}} </small> ';
                }
                if(obj.allow_guest_view){
                    room_options += '<small title="{{_("Public View")}}" class=""><i class="fas fa-globe-americas"></i></i> {{_("Public")}} </small>';
                }

                var unread_badge = "";
                if(obj.unread_count > 0){
                    unread_badge = '<span class="badge badge-danger badge-room-unread">'+ obj.unread_count+'</span>';
                }

                var room_sec = '<div class="col-md-6 mt-2"><a href="{{  url("index") }}' + obj.slug + '" >'
                    + '<div class="room-sel-item">'
                        + '<div class="room-sel-image">'
                            + '<img src="'+ cover_image + '">'
                        + '</div>'
                        + '<div class="room-sel-info">'
                            + '<div class="room-sel-name"><h4>' + obj.name + '</h4>'+ unread_badge +' </div>'
                            + '<p>' + obj.users_count + ' {{_("People Joined")}}</p>'
                            + room_options
                        + '</div>'
                        + '<div class="room-sel-go">'
                            + '<div class="room-sel-go-icon">'
                                + '<i class="fas fa-arrow-right"></i>'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                + '</a></div>';
                if(obj.is_joined){
                    $('.room-list').append(room_sec);
                }else{
                    $('.not-joined-room-list').append(room_sec);
                }
                
            });
        },
        complete: function(){
            loading(".room-list-area","hide");
        }
    });
}

function uppy_response(return_data){
    if(return_data.images.length > 0){
        var return_array = {};
        return_array['content'] = return_data.images;
        return_array['caption'] = $('.uppy-caption').val();
        var upload_response = JSON.stringify(return_array);

        send_uppy_response_message(upload_response, 2);
    }

    if(return_data.files.length > 0){
        var return_array = {};
        return_array['content'] = return_data.files;
        return_array['caption'] = $('.uppy-caption').val();
        var upload_response = JSON.stringify(return_array);

        send_uppy_response_message(upload_response, 6);
    }

    if(return_data.videos.length > 0){
        var return_array = {};
        return_array['content'] = return_data.videos;
        return_array['caption'] = $('.uppy-caption').val();
        var upload_response = JSON.stringify(return_array);

        send_uppy_response_message(upload_response, 11);
    }
}

function send_uppy_response_message(upload_response, type){
    if ($('.reply-msg-row').hasClass('reply-msg-row-show')) {
        if ($('.reply-msg-row').data('msg-method') == 'edit') {
            var edit_id = $('.reply-msg-row').data('chat-id');
            editMessage(upload_response, edit_id, type);
        } else {
            var new_msg_data = {}
            new_msg_data['new_content'] = upload_response;
            new_msg_data['new_type'] = type;

            var msg_data = {};
            msg_data['reply_message'] = JSON.parse($('.reply-msg-row').data('reply-content'));
            msg_data['new_message'] = new_msg_data;
            $(".close-reply-msg").trigger("click");
            newMessage(JSON.stringify(msg_data), 8);
        }

    } else {
        newMessage(upload_response, type);
    }
}

function check_call_status(){
    var call_id = $("#call_id").val();
    $.ajax({
        url: "{{ url('ajax-check-call-status') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            call_id: call_id,
        },
        success: function(data) {
            if(data.success == "true"){
                if((data.response.status == 2 || data.response.status == 1) && !call_started){
                    call_started = true;
                    connect_private_call();
                }
                else if(data.response.status == 3){
                    call_started = false;
                    in_call = false;
                    end_private_call();
                }
                manageCallWindow(call_id, data.response.status, data.response.calling_msg);
            }
        }

    });
}

function connect_private_call(){
    var call_id = $("#call_id").val();
    $.ajax({
        url: "{{ url('ajax-connect-private-call') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            call_id: call_id,
        },
        success: async function(data) {
            if(data.success == "true"){
                hideCallAlert();
                $('#media-div').css('display', 'flex');
                await initAgoraCall(data.appId, data.accessToken, data.roomName, USER.user_name);
            }else{
                alert(data.message);
                $(".hangup").trigger("click");
            }
        }
    });
}

async function end_private_call(){
    await endAgoraCall();
}


function manageCallWindow(call_id, call_status, call_msg){
    $('#call_id').val(call_id);
    $('.call-msg').empty();
    if(call_status == 1){
        $('.video-container').show();
        $('.call-msg').html(call_msg);
    }else if (call_status == 2) {
        $('.video-container').show();
        hideCallAlert();
    }else{
        $('.video-container').hide();
        hideCallAlert();
        $('.call-msg').html(call_msg);
    }
}

function showCallWindow(obj){
    call_id = obj.call_id;
    call_status = obj.call_status;
    in_call = true;
    $('#call_id').val(call_id);
    $('.call-msg').html(call_msg);
    $('.video-container').show();
}


function showCallAlert(obj){
    call_id = obj.call_id;
    call_status = obj.call_status;

    if (SETTINGS.display_name_format == 'username') {
        var display_name = obj.from_user.user_name;
    }else{
        var display_name = obj.from_user.first_name + ' ' + obj.from_user.last_name;
    }

    var avatar_src = getUserAvatar(obj.from_user, display_name);
    
    $('#call_id').val(call_id);
    $('.call-alert .caller-name-text').text(display_name);
    $('.call-alert .call-avatar img').attr('src', avatar_src);
    $('.call-alert').show();
    playRingtone();
}

function hideCallAlert(){
    $('.call-alert').hide();
    stopRingtone();
}

function playRingtone() {
    ring.play();
}

function stopRingtone() {
    ring.pause();
    ring.currentTime = 0; 
}

// FUNCTIONS END
var uppy = Uppy.Core({
    autoProceed: false,
    locale: Uppy.locales['{{LANG.code}}_{{LANG.country|upper}}'],
    restrictions: {
        maxFileSize: SETTINGS.post_max_size,
        maxTotalFileSize: SETTINGS.post_max_size,
        maxNumberOfFiles: 8,
        minNumberOfFiles: 1,
        allowedFileTypes: ['image/*']
    }
});

var Dashboard = Uppy.Dashboard;
uppy.use(Uppy.XHRUpload, {
    endpoint: "{{ url('ajax-send-files') }}",
    headers: {
        csrftoken: "{{ csrf_token_ajax() }}"
    },
    metaFields: ['video_duration', 'upload_type', 'video_thumbnail'],
    bundle: true,
    getResponseData: function(responseText, response) {
        var return_data = JSON.parse(responseText);
        uppy_response(return_data);
    }

});

if (SETTINGS.active_theme == 'dark') {
    var uppy_theme = 'dark';
}else{
    var uppy_theme = null;
}
uppy.use(Dashboard, {
    inline: true,
    target: '.uppy',
    replaceTargetContent: true,
    showProgressDetails: true,
    note: 'Images and video only, up to 1 MB',
    browserBackButtonClose: false,
    theme: uppy_theme,
    width: '100%',
});

uppy.on('upload-success', (file, response) => {
    //alert("as");
    //uppy_response(response.body);
});

uppy.on('complete', (response) => {
    $('.uppy-caption').val("");
    $('.uppy-caption').hide();
    $('.file-uploader').hide();
    uppy.reset();
    current_uppy_zone = "";
});

uppy.on('file-added', (file) => {
    $('.uppy-caption').show();
    if(file.type.includes('video')){

        const thumbnailCount = 1;
        const thumbnails = new VideoThumbnails({
            count : thumbnailCount,
            maxWidth : 400,
            maxHeight : 400
        });
        //Captured a thumb
        thumbnails.on('capture', function(image) { 
            $('div[id*="' + file.id + '"]')
                .find('.uppy-Dashboard-Item-previewInnerWrap')
                .html('<div class="uppy-vid-cont"><div class="uppy-vid-txt">Video</div><div class="uppy-vid-dur"></div></div><img class="uppy-DashboardItem-previewImg" src="'+image+'"/>');
            uppy.setMeta({video_thumbnail : image});
        });
        thumbnails.on('completeDetail', function(details) {
            uppy.setMeta({video_duration : details.details.videoDuration});
            $('div[id*="' + file.id + '"]').find('.uppy-vid-dur').html(Math.round(details.details.videoDuration) + 's');
        });
        thumbnails.capture(file.data);
    }
});

// Flood Control Start

if(getChatCookie('sent_count') == null){
	setChatCookie('sent_count', 0);
}
var last_sent;
var sent_count = getChatCookie('sent_count');
var time_limit = SETTINGS.flood_control_time_limit;
var message_limit = SETTINGS.flood_control_message_limit;

// Flood Control End

// Drag enter
$('.chat-scroll').on('dragover, dragenter', function (e) {
    if(SETTINGS.send_files || SETTINGS.enable_images){
        e.stopPropagation();
        e.preventDefault();
        var active_user = $("#active_user").val();
        var active_room = $("#active_room").val();

        if(active_user || active_room){
            if(SETTINGS.send_files && SETTINGS.enable_images){
                if(current_uppy_zone == ""){
                    uppy_all_zone_init();
                }
            }else if(SETTINGS.enable_images){
                uppy_media_zone_init();
            }else if(SETTINGS.send_files){
                uppy_file_zone_init();
            }
            $('.message-sticker, .message-gif').popover('hide');
            $('.file-uploader').show();
            $(".uppy").trigger("click");
        }
    }
});

function uppy_file_zone_init(){
    var file_list = "{{SETTINGS.enable_file_list}}";
    file_list = file_list.split(", ");
    uppy.setOptions({
        restrictions: {
            allowedFileTypes: file_list,
            maxNumberOfFiles:null
        },
    });
    uppy.getPlugin('Dashboard').setOptions({
        note: '{{_("You can only upload")}} '+ "{{SETTINGS.enable_file_list}}" +' {{_("file types")}}. {{_("Maximum file size is")}} ' + SETTINGS.post_max_size/1024/1024 + 'MB',
    });

    if(check_image_in_list(file_list)){
        init_img_plugins();
        init_webcam_plugins();
    }else{
        remove_img_plugins();
        remove_webcam_plugins();
    }

    if(check_screen_cap_in_list(file_list)){
        init_screen_capture();
    }else{
        remove_screen_capture();
    }
    current_uppy_zone = 'file';
    uppy.setMeta({upload_type : current_uppy_zone});

}

function uppy_image_zone_init(){
    uppy.setOptions({
        restrictions: {
            allowedFileTypes: ['image/*'],
            maxNumberOfFiles:null
        },
    });
    uppy.getPlugin('Dashboard').setOptions({
        note: '{{_("You can only upload")}} {{_("images")}}. {{_("Maximum file size is")}} ' + SETTINGS.post_max_size/1024/1024 + 'MB',
    });

    init_img_plugins();
    init_webcam_plugins();
    init_screen_capture();
    current_uppy_zone = 'image';
    uppy.setMeta({upload_type : current_uppy_zone});

}

function uppy_media_zone_init() {
    uppy.setOptions({
        restrictions: {
            allowedFileTypes: ['image/*', 'video/*'],
            maxNumberOfFiles:null
        },
    });
    uppy.getPlugin('Dashboard').setOptions({
        note: '{{_("You can only upload")}} {{_("images and videos")}}. {{_("Maximum file size is")}} ' + SETTINGS.post_max_size / 1024 / 1024 + 'MB',
    });

    init_img_plugins();
    init_webcam_plugins();
    init_screen_capture();
    current_uppy_zone = 'media';
    uppy.setMeta({upload_type : current_uppy_zone});
}

function uppy_video_zone_init() {
    uppy.setOptions({
        restrictions: {
            allowedFileTypes: ['video/*'],
            maxNumberOfFiles:1
        },
    });
    uppy.getPlugin('Dashboard').setOptions({
        note: '{{_("You can only upload")}} {{_("videos")}}. {{_("Maximum file size is")}} ' + SETTINGS.post_max_size / 1024 / 1024 + 'MB',
    });

    init_webcam_plugins();
    init_screen_capture();
    current_uppy_zone = 'media';
    uppy.setMeta({upload_type : current_uppy_zone});
}

function uppy_all_zone_init(){
    var file_list = [];
    if(SETTINGS.send_files){
        var enable_file_list = "{{SETTINGS.enable_file_list}}";
        file_list = enable_file_list.split(", ");
    }
    if(SETTINGS.enable_images){
        if(!check_image_in_list(file_list)){
            file_list.push('image/*');
        }
    }

    uppy.setOptions({
        restrictions: {
            allowedFileTypes: file_list,
            maxNumberOfFiles:null
            
        },
    })
    uppy.getPlugin('Dashboard').setOptions({
        note: '{{_("You can only upload")}} '+ file_list.join(', ') +' {{_("file types")}}. {{_("Maximum file size is")}} ' + SETTINGS.post_max_size/1024/1024 + 'MB',
    });

    if(check_image_in_list(file_list)){
        init_img_plugins();
        init_webcam_plugins();
    }else{
        remove_img_plugins();
        remove_webcam_plugins();
    }

    if(check_screen_cap_in_list(file_list)){
        init_screen_capture();
    }else{
        remove_screen_capture();
    }

    current_uppy_zone = 'all';
    uppy.setMeta({upload_type : current_uppy_zone});
}

function check_image_in_list(file_list){
    var img_list = ['.png', '.jpg', '.jpeg', '.gif', 'image/*'];
    var img_found = false;
    $.each( img_list, function( key, value ) {
        var index = $.inArray( value, file_list );
        if( index > -1 ) {
            img_found = true;
        }
    });
    return img_found;
}

function check_screen_cap_in_list(file_list){
    var screen_cap_list = ['.mkv', 'video/*'];
    var screen_cap_found = false;
    $.each( screen_cap_list, function( key, value ) {
        var index = $.inArray( value, file_list );
        if( index > -1 ) {
            screen_cap_found = true;
        }
    });
    return screen_cap_found;
}

function init_img_plugins(){
    if(!uppy.getPlugin('ImageEditor')){
        uppy.use(Uppy.ImageEditor, { target: Dashboard });
    }
}

function remove_img_plugins(){
    if(uppy.getPlugin('ImageEditor')){
        uppy.removePlugin(uppy.getPlugin('ImageEditor'));
    }
}

function init_webcam_plugins(){
    if(!uppy.getPlugin('Webcam')){
        uppy.use(Uppy.Webcam, { target: Dashboard, title: "{{_('Camera')}}" });
    }
}

function remove_webcam_plugins(){
    if(uppy.getPlugin('Webcam')){
        uppy.removePlugin(uppy.getPlugin('Webcam'));
    }
}


function init_screen_capture(){
    if(!uppy.getPlugin('ScreenCapture')){
        uppy.use(Uppy.ScreenCapture, { target: Dashboard });
    }
}

function remove_screen_capture(){
    if(uppy.getPlugin('ScreenCapture')){
        uppy.removePlugin(uppy.getPlugin('ScreenCapture'));
    }
}

function message_small_preview(msg, type){
    if(type == 1){
        if(emojione){
            msg_preview = (window.emojione.shortnameToImage(linkParse(htmlDecode(msg, true))));
        }else{
            msg_preview = htmlDecode(msg, true);
        }
    }else if(type == 2){
        msg_preview = "<i class='fa fa-image'></i> {{_('Image')}}";
    }else if(type == 3){
        msg_preview = "<i class='fa fa-image'></i> {{_('GIF')}} ";
    }else if(type == 4){
        msg_preview = "<i class='fa fa-smile'></i> {{_('Sticker')}}";
    }else if(type == 5){
        msg_preview = "<i class='fa fa-link'></i> {{_('Link')}}";
    }else if(type == 6){
        msg_preview = "<i class='fa fa-file-alt'></i> {{_('File')}}";
    }else if(type == 7){
        msg_preview = "<i class='fa microphone-alt'></i> {{_('Audio')}} ";
    }else if(type == 8){
        msg_preview = "<i class='fa fa-reply'></i> {{_('Reply Message')}} ";
    }else if(type == 9){
        msg_preview = "<i class='fa fa-share'></i> {{_('Forwarded Message')}} ";
    }else if(type == 10){
        var code_lang = JSON.parse(msg)['lang'];
        var msg_preview = "<i class='fa fa-code'></i> "+code_lang+" {{_('code')}}";
    }else if(type == 11){
        msg_preview = "<i class='fa fa-video'></i> {{_('Video')}}";
    }
    return msg_preview;
}

function createNotification(noti){
    var read_cls = "";
    var noti_badge = "";
    var noti_message = "";
    if(noti.is_read){
        read_cls = "noti-read";
    }
   
    var noti_content = JSON.parse(noti.content);

    var img_src = getUserAvatar(noti_content, noti_content['mentioned_by']);
    var created_at = moment(noti.created_at+SETTINGS.system_timezone_offset).tz(USER.timezone).fromNow();
    
    if(noti.type == 2){
        noti_message = `<div class="noti-content">`+noti_content['content']+`</div>`;
    }else if(noti.type == 3){
        noti_message = `<div class="noti-content"><div class="noti-reminder">`+noti_content['content']+`</div></div>`;
        noti_badge = '<div class="noti-badge"><i class="fas fa-alarm-clock"></i></div>';
    }

    var noti_html = `<div class="d-flex noti-item go-to-noti-chat ` + read_cls + `"
            data-noti-id="`+noti.id+`" data-id="`+noti_content['chat_id']+`"
            data-chat-room="`+noti_content['room_id']+`"
            data-chat-group="`+noti_content['group_id']+`"
            data-chat-user="`+noti_content['active_user']+`">
            <div class="mr-3 align-self-center">
                <div class="noti-icon">
                    <img width="32" height="32" src="`+img_src+`" /> `+ noti_badge +`
                </div>
            </div>
            <div>
                <div class="noti-time">`+created_at+`</div>
                `+noti_message+`
            </div>
        </div>`;
    return noti_html;
}

function loadNotifications() {

    $.ajax({
        url: "{{ url('ajax-notification-list') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
        },
        beforeSend: function () {
            $('.notification-list').empty();
        },
        success: function (data) {

            $.each(data.notifications, function( index, obj ) {
                var noti_html = createNotification(obj);
                $('.notification-list').append(noti_html);
            });
        },
        complete: function () {
        }
    });
}

function update_shown_panel(){
    if($(".search-panel").css('display') != 'none'){
        $(".search-panel").hide();
    }else if($(".active-user-info").css('display') != 'none'){
        $(".active-user-info").hide();
    }else if($(".active-group-info").css('display') != 'none'){
        $(".active-group-info").hide();
    }else if($(".notification-panel").css('display') != 'none'){
        $(".notification-panel").hide();
    }
}

function load_default_panel(){
    var active_user = $("#active_user").val();
    var active_room = $("#active_room").val();
    if(active_user){
        $(".active-user-info").fadeIn();
    }else if(active_room){
        $(".active-group-info").fadeIn();
    }
}

function load_current_panel(panel){ 
    update_shown_panel();
    $(panel).show();
}

//update noti read status
function update_notification_read(noti_id=null,all=false){
    $.ajax({
        url: "{{ url('ajax-update-noti-read') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            noti_id: noti_id,
            all: all
        },
        success: function(data) {
            if(data.unread_count >= 1){
                $('.noti-count').show().html(data.unread_count);
            }else{
                $('.noti-count').hide().html('');
            }
        }
    });
}

//update noti read status
function notification_delete(noti_id=null,all=false){
    $.ajax({
        url: "{{ url('ajax-delete-noti') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            noti_id: noti_id,
            all: all
        },
        success: function(data) {
            if(data.unread_count >= 1){
                $('.noti-count').show().html(data.unread_count);
            }else{
                $('.noti-count').hide().html('');
            }
        }
    });
}

function filterReaction(filtered_data) {
    if(filtered_data == 'all'){
        $('.filter-reaction').show();
    }else{
        $('.filter-reaction').hide();
        $('.'+filtered_data).show();
    }
    
}

function reactionEmoji(reaction_type){
    var reaction_html;
    switch(reaction_type) {
        case "1":
            reaction_html = `<div class="list-react current-react-1"></div>`
            break;
        case "2":
            reaction_html = `<div class="list-react current-react-2"></div>`
            break;
        case "3":
            reaction_html = `<div class="list-react current-react-3"></div>`
            break;
        case "4":
            reaction_html = `<div class="list-react current-react-4"></div>`
            break;
        case "5":
            reaction_html = `<div class="list-react current-react-5"></div>`
            break;
        case "6":
            reaction_html = `<div class="list-react current-react-6"></div>`
            break;
        case "7":
            reaction_html = `<div class="list-react current-react-7"></div>`
            break;
        default:
            reaction_html = "";
    }
    return reaction_html;
}

function reactedUserList(message_id, chat_type){
    $.ajax({
        url: "{{ url('ajax-message-reaction-list') }}",
        type: "POST",
        dataType: 'json',
        data: {
            csrftoken: '{{ csrf_token_ajax() }}',
            message_id: message_id,
            chat_type: chat_type
        },
        beforeSend: function () {
            loading(".messages", "show");
        },
        success: function (data) {
            var reaction_obj = JSON.parse(data.reaction_list);

            let sort_array = [];
            var reaction_count = 0;
            for (var reaction_type in reaction_obj) {
                reaction_count += reaction_obj[reaction_type];
                sort_array.push([reaction_type, reaction_obj[reaction_type]]);
            }
            sort_array.sort((a,b) =>  b[1] - a[1]);

            var reaction_list_header = `<div class="filter-reaction-list">`
                                    +`<button class="btn filter-btn active" data-filter-value="all" > All `+reaction_count+`</button>`
                                    +`<div class="list-reacts">`
            sort_array.forEach(function(each_reaction) {
                reaction_list_header += `<button class="btn filter-btn" data-filter-value="`+each_reaction[0]+`">`;
                reaction_list_header += reactionEmoji(each_reaction[0]);
                reaction_list_header += each_reaction[1] +`</button>`;
            });
            reaction_list_header += `</div></div>`; 

            var reacted_users = `<div class="">`;
            
            data.reacted_users.forEach(function(each_user) {
                if(each_user.user_name == '{{USER.user_name}}'){
                    var react_user = 'You <i class="far fa-trash-alt remove-react"></i>';
                }else{
                    var react_user = each_user.first_name+ ` ` + each_user.last_name;
                }
                var img_src = getUserAvatar(each_user, react_user);
                var user_image = `<img width="32" height="32" class="react-avatar" src="` + img_src + `" >`;
                
                reacted_users += `<div class="filter-reaction `+each_user.reaction+ `">` + user_image + ` ` + react_user + ` <div class="list-reacts">`+ reactionEmoji(each_user.reaction.toString()) +`</div></div>`;
            });
            reacted_users += `</div>`; 
            
            $('.reaction-list-content').html(reacted_users);
            $('.reaction-list-header').html(reaction_list_header);
            $('.reaction-list-modal').modal('show');
        }, 
        complete: function () {
            loading(".messages", "hide");
        }

    });
}

function reaction_update_chat_changes(obj) {
    var updated_li = $(".messages .chats").find("div[id="+ obj.id +"]");
    var current_reactions = createReactionList(obj.reactions);

    if(current_reactions.length > 0){
        if(!$(updated_li).find('.message-data').hasClass('has-reactions')){
            $(updated_li).find('.message-data').addClass('has-reactions')
        }
    }else{
        if($(updated_li).find('.message-data').hasClass('has-reactions')){
            $(updated_li).find('.message-data').removeClass('has-reactions')
        }
    }
    $(updated_li).find('.current-chat-reactions').html(current_reactions);

    if($('.reaction-list-modal').hasClass('show')){
        var message_id = $('.reacted_msg_id').val();
        var chat_type = $('.reacted_chat_type').val();
        reactedUserList(message_id, chat_type);
    }
}

// Functions to run when document is ready
$( document ).ready(function() {
    var url = new URL(window.location.href);
    var view_as = url.searchParams.get("view-as");
    if(view_as){
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            if(options.url.includes("?")){
                options.url = options.url + '&view-as='+view_as;
            }else{
                options.url = options.url + '?view-as='+view_as;
            }
        });
    }

    var view_chat = url.searchParams.get("view-chat");
    var view_chat_with = url.searchParams.get("chat-with");

    // loader display when message loading
    loading(".messages ","show");

    var active_user = "";
    var active_group = $("#active_group").val();
    var active_room = $("#active_room").val();

    $('a.list-section, .mobile-sidebar-toggle').on('shown.bs.tab', function (e) {
        localStorage.setItem('activeTab', $(e.target).attr('href'));
    });
    
    var activeTab = localStorage.getItem('activeTab');
    if(activeTab){
        $('.nav-pills a[href="' + activeTab + '"]').tab('show');
    }

    loadActiveUsers();
    roomListUnread();

    //Init lazy Load
    $(function() {
        $('.lazy').Lazy();
    });

    $(function () {
        $('[data-toggle="popover"]').popover()
    });


    // Left side online chat list show/hide
    $(".chat-list-toggle").on('click', function(e) {

  

        if ($(window).width() <= 576) {

            $(".chat-list-col").toggleClass("col-3 col-12", 100, "easeOutExpo");
            $(".chat-list-col").toggleClass("adjust-height");
            $(".chat-list-col").toggleClass("mobile-mini-user-list");
            $(".mobile-chat-list-toggle").toggle();

            if($('.chat-list-col').hasClass('mobile-mini-user-list')){
                $(".status-change").show();
                $(".nav-sidebar").css('display','flex');
                $(".nav-sidebar-mobile").hide();
            }else{
                $(".status-change").hide();
                $(".nav-sidebar").hide();
                $(".nav-sidebar-mobile").show();
            }

            $('.all-room-unread-2').toggle();

        }else if($(window).width() <= 768){

            $(".chat-list-col").toggleClass("col-3 col-12", 100, "easeOutExpo");
            $(".chat-list-col").toggleClass("adjust-height");
            $(".chat-list-col").toggleClass("mobile-mini-user-list");
            $(".mobile-chat-list-toggle").toggle();

            if($('.chat-list-col').hasClass('mobile-mini-user-list')){
                $(".nav-sidebar").css('display','flex');
                $(".nav-sidebar-mobile").hide();
                $(".status-change").show();
                $(".selected-chat-toggle").hide();
            }else{
                $(".nav-sidebar").hide();
                $(".nav-sidebar-mobile").show();
                $(".status-change").hide();
                $(".selected-chat-toggle").show();
            }

            //$(".chat-messages-col").show();
            //$(".selected-chat-col").hide();

            $('.all-room-unread-2').toggle();

        }else{
            $(".status-change").toggle();

            $(".logo img.large").toggle();

            if($(".logo img.small").is(":visible")){
                $(".logo img.small").hide();
            }else{
                $(".logo img.small").show();
            }
            if($(".nav-sidebar").is(":visible")){
                $(".nav-sidebar").hide();
            }else{
                $(".nav-sidebar").css('display','flex');
            }
            $(".chat-list-col").toggleClass("mini-user-list", 100, "easeOutExpo");

            //$(".chat-nav").toggleClass("nav-width-fix");

            $('.all-room-unread-2').toggle();
        }

    });

    
    $(document).on('click', '.mention', function (e) {
        var active_user = $(this).data('user');
        if (active_user != USER.id) {
            var active_room = $("#active_room").val();
            var active_group = $("#active_group").val();
            loadChats(active_user, active_group, active_room);
        }

    });

    $(document).on('click', '.btn-notifications, .notification-panel-close', function(e) {
        if($(".notification-panel").is(":visible")){
            $(".notification-panel").hide();
            load_default_panel();
            if ($(window).width() <= 768) {  
                $(".selected-chat-col").removeClass("col-10");          
                $(".selected-chat-col").hide();
            }
        }else{
            
            loadNotifications();
            if (!$(".selected-chat-col").is(":visible")) {
                if ($(window).width() <= 768) {
                    $(".selected-chat-col").addClass("col-10");
                }
                $(".selected-chat-col").show();
            }
            load_current_panel('.notification-panel');
            
        }
    });

    $(document).on('click', '.go-to-noti-chat', function(e) {
        var noti_id = $(this).data('noti-id');
        var chat_id = $(this).data('id');
        var chat_room = $(this).data('chat-room');
        var chat_group = $(this).data('chat-group');
        var chat_user = $(this).data('chat-user');
        var active_room = $("#active_room").val();
        var active_user = $("#active_user").val();
        if(active_room == chat_room){
            if (active_user == "" && $('#'+chat_id).length) {
                $("#" + chat_id)[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                var highlight_class = '#'+chat_id + ' .message-data';
                $(highlight_class).css('animation', 'flash 2s ease infinite');
                setTimeout(function(){ $( highlight_class ).removeAttr('style'); }, 2000);
    
            }else{
                var room_info = JSON.parse($.ajax({
                    url: "{{ url('ajax-get-chatroom-basic') }}",
                    type: "POST",
                    data: {
                        room_id: chat_room,
                        csrftoken: '{{ csrf_token_ajax() }}',
                    },
                    async: false
                }).responseText);
                $('.chat-title').html(room_info.data.name);
                if (room_info.data.slug == 'general') {
                    $('.chat-slug').html("#"+room_info.data.slug);
                }else{
                    $('.chat-slug').html("#"+room_info.data.slug);
                }

                var url = window.location.href;
                var main_url = url.split('?')[0];
                window.history.pushState({}, document.title, main_url);
                loadChats('', chat_group, active_room, chat_id);
            }
            
        }else{
            var room_info = JSON.parse($.ajax({
                url: "{{ url('ajax-get-chatroom-basic') }}",
                type: "POST",
                data: {
                    room_id: chat_room,
                    csrftoken: '{{ csrf_token_ajax() }}',
                },
                async: false
            }).responseText);
            var noti_url = `{{  url('chat-room', {'chatroomslug':'`+room_info.data.slug+`'}) }}?view-chat=`+chat_id;
            window.location.href = noti_url;
        }

        if ($(window).width() <= 768) {  
            $(".selected-chat-col").removeClass("col-10");          
            $(".selected-chat-col").hide();
        }
        update_notification_read(noti_id);
        $(this).addClass('noti-read');
    });

    $(document).on('click', ".notification-read-all", function () {
        update_notification_read(null, true);
        $('.noti-item').addClass('noti-read');
    });

    $(document).on('click', ".notification-delete-all", function () {
        notification_delete(null, true);
        $('.noti-item').remove();
    });

    $(document).on('click', ".hashtag", function () {
        var hashtag = $(this).html();
        $('#search-query').val(hashtag);
        chatSearch();
        load_current_panel('.search-panel');
        if (!$(".selected-chat-col").is(":visible")) {
            if ($(window).width() <= 768) {
                $(".selected-chat-col").addClass("col-10");
            }
            $(".selected-chat-col").show();
        }
    });


    // when window resizes adopt the chat screen
    $(window).on('resize', function(){
        if ($(window).width() > 768) {

            if($('.chat-list-col').hasClass('mini-user-list')){
                $(".nav-sidebar").hide();
            }else{
                if($('.chat-list-col').hasClass('mobile-mini-user-list')){
                    $(".nav-sidebar").show();
                }else{
                    $(".nav-sidebar").hide();
                    $(".logo img.small").hide();
                }
                $(".status-change").show();
                $(".logo img.large").show();
                $(".nav-sidebar").css('display','flex');
            }
            //$(".chat-messages-col").show();
            $(".selected-chat-col").removeClass("col-10");
            $(".selected-chat-col").show();
            $(".mobile-chat-list-toggle").hide();
        }else if($(window).width() <= 768){

            $(".status-change").hide();
            $('.chat-list-col').removeClass('mini-user-list');
            if($('.chat-list-col').hasClass('mobile-mini-user-list')){
                $(".nav-sidebar").show();
                $(".status-change").show();
            }else{
                $(".nav-sidebar").hide();
                $(".logo img.small").show();
            }

            //$(".chat-messages-col").show();
            $(".selected-chat-col").hide();
            //$(".selected-chat-toggle.enable-selected-chat").show();
        }
    });

    // send gif, send stickers button show or hide
    $(".buttons-showhide").on('click', function(e) {
        $(".buttons-showhide i").toggleClass("fa-chevron-left fa-chevron-right");
        if ($("#hidable-btns").is(":visible")) {
            $("#hidable-btns").hide();
            $(".chat-buttons").css("flex", "60px");
            $(".chat-box").css("flex", "89%");
        }else{
            $("#hidable-btns").show();
            $(".chat-buttons").css("flex", "150px");
            $(".chat-box").css("flex", "76%");
        }
    });

    // selected/active chat information show or hide
    $(".selected-chat-toggle").on('click', function(e) {

        //$(".selected-chat-toggle").css('pointer-events','none');
        //setTimeout(function(){ $(".selected-chat-toggle").css('pointer-events','auto'); }, 600);

        if (($(window).width() <= 1024) && ($(window).width() > 768 )) {
            if($(".selected-chat-col").is(":visible")){
                $(".selected-chat-col").hide();
            }else{
                $(".selected-chat-col").show();
            }
        }else if ($(window).width() <= 768) {
            //$(".chat-messages-col").toggle();
            if($(".selected-chat-col").is(":visible")){
                $(".selected-chat-col").hide();
                $(".selected-chat-col").removeClass("col-10");
            }else{
                $(".selected-chat-col").addClass("col-10");
                $(".selected-chat-col").show();
            }
        } else {
            if($(".selected-chat-col").is(":visible")){
                $(".selected-chat-col").hide();
            }else{
                $(".selected-chat-col").show();
            }
        }

    });

    // selected chat info each section show or hide
    $(".chat-data-header").on('click', function(e) {
        $(this).find(".dropdown i").toggleClass("fa-angle-down fa-angle-right");
    });

    // init tooptip
    $(".btn-msg, .btn-tooltip").tooltip();


    $(document).on('click', '.message-gif', function(e) {
        $('.gse-row').removeClass('stickers-shown').removeClass('emojis-shown').empty();
        if ($('.gse-row.gifs-shown').is(':visible')) {
            $('.gse-row.gifs-shown').removeClass('gifs-shown').hide();
            $('.gif-list').empty();
        }else{
            var results = get_gifs(SETTINGS.tenor_api_key, SETTINGS.tenor_gif_limit, "");
            $('.gse-row').addClass('gifs-shown').show().html($('.gif-content').html());
        }

    });

    $(document).on('click', '.gif-close', function(e) {
        $('.gse-row.gifs-shown').removeClass('gifs-shown').hide();
        $('.gif-list').empty();
    });

    $(document).on('click', '.message-sticker', function(e) {
        $('.gse-row').removeClass('gifs-shown').removeClass('emojis-shown').empty();
        $('.sticker-nav').empty();
        $('.sticker-tab-content').empty();
        if ($('.gse-row.stickers-shown').is(':visible')) {
            $('.gse-row.stickers-shown').removeClass('stickers-shown').hide();
        }else{
            get_strickers();
            $('.gse-row').addClass('stickers-shown').show().html($('.sticker-content').html());
        }

    });

    $(document).on('click', '.sticker-close', function(e) {
        $('.gse-row.stickers-shown').removeClass('stickers-shown').hide();
        $('.sticker-nav').empty();
        $('.sticker-tab-content').empty();
    });


    // gif search functions
    $(document).on('click', '.gif-search-btn', function(e) {
        var q = $('.gif-search-input').val();
        get_gifs(SETTINGS.tenor_api_key, SETTINGS.tenor_gif_limit, q);
    });

    $(document).on('keyup', '.gif-search-input', function(e) {
        var q = $('.gif-search-input').val();
        if (q.length > 2) {
            get_gifs(SETTINGS.tenor_api_key, SETTINGS.tenor_gif_limit, q);
        }else if(q.length == 0){
            get_gifs(SETTINGS.tenor_api_key, SETTINGS.tenor_gif_limit, "");
        }
    });

    // gif send functions
    $(document).on('click', '.send-gif', function(e) {
        $('.gse-row.gifs-shown').removeClass('gifs-shown').hide();
        $('.gif-list').empty();
        var gif_url = $(this).data('gif');
        if ($('.reply-msg-row').hasClass('reply-msg-row-show')) {
            var new_msg_data = {}
            new_msg_data['new_content'] = gif_url;
            new_msg_data['new_type'] = 3;

            var msg_data = {};
            msg_data['reply_message'] = JSON.parse($('.reply-msg-row').data('reply-content'));
            msg_data['new_message'] = new_msg_data;
            $(".close-reply-msg").trigger("click");
            newMessage(JSON.stringify(msg_data), 8);
        }else{
            newMessage(gif_url, 3);
        }
    });

    // stickers send functions
    $(document).on('click', '.send-sticker', function(e) {
        $('.gse-row.stickers-shown').removeClass('stickers-shown').hide();
        $('.sticker-nav').empty();
        $('.sticker-tab-content').empty();
        var sticker_url = $(this).data('sticker');
        if ($('.reply-msg-row').hasClass('reply-msg-row-show')) {
            var new_msg_data = {}
            new_msg_data['new_content'] = sticker_url;
            new_msg_data['new_type'] = 4;

            var msg_data = {};
            msg_data['reply_message'] = JSON.parse($('.reply-msg-row').data('reply-content'));
            msg_data['new_message'] = new_msg_data;
            $(".close-reply-msg").trigger("click");
            newMessage(JSON.stringify(msg_data), 8);
        }else{
            newMessage(sticker_url, 4);
        }
    });

    // after sticker popover show functions
    $('.message-sticker').on('show.bs.popover', function () {
        $(".sticker-nav").empty();
        $(".sticker-tab-content").empty();
        $('.chats').show();
        $('.message-gif').popover('hide');
        $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight);
    });

    // sticker popover shown functions
    $('.message-sticker').on('shown.bs.popover', function () {
        get_strickers();
    });


    $(document).on('click', '.message-code', function(e) {
        $("#code-modal").modal();
    });

    $(document).on('click', '.send-code', function(e) {
        var code_content =  $('#message-code').val();
        var code_lang =  $('#message-code-lang').val();
        var code_caption =  $('#message-code-caption').val();
        if (code_content!="") {
            var msg_data = {}
            msg_data['code'] = htmlEncode(code_content);
            msg_data['lang'] = code_lang;
            msg_data['caption'] = code_caption;

            if ($('.reply-msg-row').hasClass('reply-msg-row-show')) {
                var new_msg_data = {}
                new_msg_data['new_content'] = msg_data;
                new_msg_data['new_type'] = 10;
    
                var reply_msg_data = {};
                reply_msg_data['reply_message'] = JSON.parse($('.reply-msg-row').data('reply-content'));
                reply_msg_data['new_message'] = new_msg_data;
                $(".close-reply-msg").trigger("click");
                newMessage(JSON.stringify(reply_msg_data), 8);
            }else{
                newMessage(JSON.stringify(msg_data), 10);
            }
            $("#code-modal").modal('hide');
            $('#message-code').val("");
        }
    });

    // click link on chat message
    $(document).on('click', '.chat-link-block a', function(e) {
        var clicked_link = $(this).attr('href');
        var code = $(this).attr('data-code');
        var a = document.createElement('a');
        a.href = clicked_link;
        var hostname = a.hostname;
        if (hostname == 'www.youtube.com' || hostname == 'youtube.com' || hostname == 'youtu.be') {
            var videoid = youtube_parser(clicked_link);
            if(videoid) {
                e.preventDefault();
                var embedlink = "https://www.youtube.com/embed/" + videoid + '?autoplay=1';
                $("#video-iframe").attr('src', embedlink);
                $("#video-modal").modal();
            }
        }else if(code){
            e.preventDefault();
            $('#video-embed-content').html(urldecode(code));
            $("#video-modal-2").modal();
        }
        
    });

     // video modal hide function
     $("#video-modal-2").on('hide.bs.modal', function(){
        $('#video-embed-content').empty();
     });

    // video modal hide function
    $("#video-modal").on('hide.bs.modal', function(){
       $("#video-iframe").attr('src', "{{STATIC_URL}}/img/loading-video.gif");
    });

    // click image send button
    $(document).on('click', '.message-images', function(e) {
        if ($('.file-uploader').is(':visible') ){
            $('.file-uploader').hide();
        }else{
            uppy_image_zone_init();
            $('.file-uploader').show();
            $(".uppy").trigger("click");
        }

    });

    // click file send button
    $(document).on('click', '.message-videos', function(e) {
        if ($('.file-uploader').is(':visible') ){
            $('.file-uploader').hide();
        }else{
            if(SETTINGS.send_videos){
                uppy_video_zone_init();

                $('.file-uploader').show();
                $(".uppy").trigger("click");
            }else{
                alert('Permission granted');
            }
        }
    });

    // click file send button
    $(document).on('click', '.message-files', function(e) {
        if ($('.file-uploader').is(':visible') ){
            $('.file-uploader').hide();
        }else{
            if(SETTINGS.send_files){
                uppy_file_zone_init();

                $('.file-uploader').show();
                $(".uppy").trigger("click");
            }else{
                alert('Permission granted');
            }
        }
    });

    //close file uploader
    $(document).on('click', '.file-uploader-close', function(e) {
        $('.file-uploader').hide();
        current_uppy_zone = "";
        if(isMobile==false){
            $('#message_content').data("emojioneArea").editor.focus();
        }
    });

    // popover close button
    $(document).on('click','.close-popover',function(){
        $('.message-sticker, .message-gif').popover('hide');
        if(isMobile==false){
            $('#message_content').data("emojioneArea").editor.focus();
        }
    });

    // mobile sidebar show or minimize
    $(document).on('click', '.mobile-sidebar-toggle', function(e) {
        $(this).removeClass('active');
        var icon_class = $(this).find('i').attr("class");
        $('.mobile-sidebar-icon > i').removeClass().addClass(icon_class);
        var clicked_tab = $(this).data('id');
        $('.list-section').removeClass('active');
        $('#'+clicked_tab).addClass('active');
        room_user_search_mode = false;
        $('.refresh-user-list').hide();
        $('.refresh-dm-list').hide();
        $('.room-user-search').val('');
        loadActiveUsers();

    });

    // favourite or unfavourite the selected chat user
    $(document).on('click', '.active-user-favourite', function(e) {
        var current_status = $(this).attr("data-is-favourite");
        changeActiveUserRestriction('is_favourite', current_status);
    });

    // block or unblock the selected chat user
    $(document).on('click', '.active-user-block', function(e) {
        var current_status = $(this).attr("data-is-blocked");
        changeActiveUserRestriction('is_blocked', current_status);
    });

    // mute or unmute the selected chat user
    $(document).on('click', '.active-user-mute', function(e) {
        var current_status = $(this).attr("data-is-muted");
        changeActiveUserRestriction('is_muted', current_status);
    });

    // mute or unmute the selected chat group
    $(document).on('click', '.active-group-mute', function(e) {
        if (SETTINGS.is_authenticated == true) {
            var current_status = $(this).attr("data-is-muted");
            changeActiveGroupRestriction('is_muted', current_status);
        }else{
            showAuthModal();
        }
    });

    // delete message
    $(document).on('click', '.message-delete', function(e) {
        var message_id = $(this).parent().parent().attr('id');
        var message_id = $(this).closest('.cht').attr('id');
        var chat_type = $(this).data("chat-type");
        $.ajax({
            url: "{{ url('ajax-delete-message') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                message_id: message_id,
                chat_type: chat_type
            },
            beforeSend: function() {
                loading(".messages","show");
            },
            success: function(data) {
                if(data.success){
                    $('#'+message_id).find('.message-html').html(`<div class="chat-txt deleted"><i class="fa fa-ban"></i> {{_('This message was deleted')}}</div>`);
                    $('#'+message_id).find('.chat-actions').html(``);
                    $('#'+message_id).find('.message-status').html(``);
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
                loading(".messages","hide");
                getActiveRecentMedia();
            }

        });
    });

    // reply message
    $(document).on('click', '.message-reply', function(e) {
        var reply_msg_id = $(this).closest('.cht').attr('id');
        var chat_type = $(this).data("chat-type");

        $.ajax({
            url: "{{ url('ajax-get-message') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                chat_id: reply_msg_id,
                chat_type:chat_type
            },
            beforeSend: function() {
                loading(".messages","show");
            },
            success: function(data) {
                if(data.type == 8){
                    var replied_type = JSON.parse(data.message)['new_message']['new_type'];
                    if(replied_type == 5 || replied_type == 10){
                        var replied_content = JSON.stringify(JSON.parse(data.message)['new_message']['new_content']);
                    }else{
                        var replied_content = JSON.parse(data.message)['new_message']['new_content'];
                    }
                }else if(data.type == 9){
                    var replied_type = JSON.parse(data.message)['type'];
                    if(replied_type == 5 || replied_type == 10){
                        var replied_content = JSON.stringify(JSON.parse(data.message)['message']);
                    }else{
                        var replied_content = JSON.parse(data.message)['message'];
                    }
                }else{
                    var replied_content = data.message;
                    var replied_type = data.type;
                }

                var replied_data = JSON.parse(repliedMessage(replied_content, replied_type));
                var replied_html = replied_data['current_message'];
                var replied_preview = replied_data['current_preview'];

                var replied_to_id = data.sender_id;
                if (SETTINGS.display_name_format == 'username') {
                	var display_name = data.user_name;
                    var replied_to_short = data.user_name;
                }else{
                	var display_name = data.first_name + ' ' + data.last_name;
                    var replied_to_short = data.first_name;
                }
                if(data.sender_id ==  USER.id ){
                    var replied_to = "{{_('Reply to your chat')}}";
                }else{
                    var replied_to = "{{_('Reply to')}} "+ display_name +"'s {{_('chat')}}";
                }

                var reply_data = {};
                reply_data['reply_id'] = reply_msg_id;
                reply_data['reply_content'] = replied_content;
                reply_data['reply_type'] = replied_type;
                reply_data['reply_from'] = replied_to_short;
                reply_data['reply_from_id'] = replied_to_id;
                $('.reply-msg-row').data('reply-content', JSON.stringify(reply_data));

                $('.reply-msg-row .replied-user').html(replied_to);
                $('.reply-msg-row .replied-html').html(htmlDecode(replied_html));
                $('.reply-msg-row .replied-preview').html(replied_preview);


                $('.reply-msg-row').addClass('reply-msg-row-show');
                $('.reply-msg-row').removeClass('reply-msg-row-hide');


            },complete: function(){
                loading(".messages","hide");
                if(isMobile==false){
                    $('#message_content').data("emojioneArea").editor.focus();
                }
            }

        });
    });

    // close reply message
    $(document).on('click', '.close-reply-msg', function(e) {
        $('.reply-msg-row').addClass('reply-msg-row-hide');
        $('.reply-msg-row').removeClass('reply-msg-row-show');

        $('.reply-msg-row .replied-user').html("");
        $('.reply-msg-row .replied-html').html("");
        $('.reply-msg-row .replied-preview').html("");

        $('.reply-msg-row').data('reply-content', "");
        if(isMobile==false){
            $('#message_content').data("emojioneArea").editor.focus();
        }
    });

    // chat area scroll
    $('.chat-scroll').on('scroll', function() {
        if ($(this).scrollTop() == 0 && can_scroll_up == true){
            previous_height = $(this)[0].scrollHeight;
            console.log("load_more_chats('up')");
            load_more_chats('up');
        }
        if(($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) && can_scroll_down == true) {
            console.log("load_more_chats('down')");
            load_more_chats('down');
        }
    });


    // init emoji with chat area

    var emo_dir = 'ltr';
    if($('html').hasClass('rtl')){
        var emo_dir = 'rtl';
    }

    $("#message_content").emojioneArea({
        pickerPosition: "top",
        tonesStyle: "radio",
        inline: false,
        tones: false,
        search: false,
        saveEmojisAs: "shortname",
        hidePickerOnBlur: true,
        attributes:{
            dir: emo_dir,
        },
        events: {
            keypress: function (editor, event) {
                if (isMobile==false && event.keyCode  == 13) {
                   var content = htmlEncode(this.getText());
                   if(event.shiftKey){
                       event.stopPropagation();
                   } else {
                        event.preventDefault();
                        if (this.getText() != "") {
                            if (content.length < SETTINGS.max_message_length) {
                                if ($('.reply-msg-row').hasClass('reply-msg-row-show')) {
                                    var new_msg_data = {}
                                    new_msg_data['new_content'] = content;
                                    new_msg_data['new_type'] = 1;

                                    var msg_data = {};
                                    msg_data['reply_message'] = JSON.parse($('.reply-msg-row').data('reply-content'));
                                    msg_data['new_message'] = new_msg_data;
                                    $(".close-reply-msg").trigger("click");
                                    newMessage(JSON.stringify(msg_data), 8, false);

                                }else{
                                    newMessage(content, 1, false);
                                }
                            }else{
                                alert("{{_('Sorry, Your message is too long!')}}")
                            }
                        }
                   }
                }
                updateLastTypedTime();
            },
            click: function (editor, event) {
                if ($(window).width() < 425) {
                   $( ".buttons-showhide" ).trigger( "click" );
                }
            },
            blur: function (editor, event) {
                refreshTypingStatus();
                if ($(window).width() < 425) {
                   $( ".buttons-showhide" ).trigger( "click" );
                }
            },
            ready: function (editor, event) {
                if ($('#active_user').val() != "") {
                    var load_chat_user = $('#active_user').val();
                }else{
                    var load_chat_user = active_user;
                }
                if(view_chat){
                    var chat_id = view_chat;
                    if(view_chat_with){
                        var load_chat_user = view_chat_with;
                    }
                    
                    chat_search_mode = true;
                }else{
                    var chat_id = false;
                }
                loadChats(load_chat_user, active_group, active_room, chat_id);
                if(isMobile==false){
                    this.setFocus();
                }
            }
        }
    });

    // click recent room chat or individual chat
    $(document).on('click', '.chat-item', function(e) {
        if (disable_private_chats == false) {
            if (SETTINGS.is_authenticated == true) {
                chat_search_mode = false;
                var active_user = $(this).data("user-id");
                var active_user_name = $(this).data("user-name");
                var active_group = $("#active_group").val();
                var active_room = $("#active_room").val();
                $(".close-reply-msg").trigger("click");
                loadChats(active_user, active_group, active_room);

                if(view_as){
                    var view_as_url = '?view-as='+view_as;
                }else{
                    var view_as_url = '';
                }

                if (active_user_name) {
                    if ($("#chat_room_url").val()!="" && history.pushState) {
                        history.pushState(null, null, $("#chat_room_url").val()+"/"+active_user_name+view_as_url);
                    }
                }else{
                    if(history.pushState) {
                        history.pushState(null, null, $("#chat_room_url").val()+view_as_url);
                    }
                }

                if ($('.chat-list-col').hasClass('mobile-mini-user-list')) {
                    $(".mobile-chat-list-toggle .chat-list-toggle").trigger('click');
                }
            }else{
                showAuthModal();
            }
         }
    });

    // change user status
    $(document).on('click', '.change-status', function(e) {
        var icon_class = $(this).find('i').attr("class");
        icon_class = icon_class.replace('fa-fw mr-2','');
        $('.current-status > i').removeClass().addClass(icon_class);
        var new_status = $(this).attr("data-status");
        $.ajax({
            url: "{{ url('ajax-change-user-status') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                new_status: new_status,
            }
        });

    });

    if($(window).width() <= 768){
        $(".act-more").show();
        $( ".act-icon" ).each(function() {
            $('.mobile-act-row').append(this);
        });

        $(".act-more").on('click', function(e) {
            if ($('.mobile-act-row').hasClass('mobile-act-row-show')) {
                $('.mobile-act-row').removeClass('mobile-act-row-show');
                $('.mobile-act-row').addClass('mobile-act-row-hide');
                $('.act-more-btn').removeClass('act-btn-active');
            }else{
                $('.mobile-act-row').addClass('mobile-act-row-show');
                $('.mobile-act-row').removeClass('mobile-act-row-hide');
                $('.act-more-btn').addClass('act-btn-active');
            }

        });

    }else{

        $(".act-more").on('click', function(e) {
            if ($('.act-hidden').hasClass('act-show')) {
                $('.act-hidden').removeClass('act-show');
                $('.act-hidden').css('width','0px');
                $('.act-more-btn').removeClass('act-btn-active');
            }else{
                var width = 24;
                if (SETTINGS.send_files){
                    width += 36;
                }
                if(SETTINGS.enable_audioclip){
                    width += 36;
                }
                if(SETTINGS.enable_codes){
                    width += 36;
                }
                $('.act-hidden').addClass('act-show');
                $('.act-hidden').css('width', width+'px');
                $('.act-more-btn').addClass('act-btn-active');
            }

        });
    }

    $(document).on('click', '.btn-send', function(e) {
        var content_el = $('#message_content').data("emojioneArea");
        var content = htmlEncode(content_el.getText());
        if(e.shiftKey){
            e.stopPropagation();
        } else {
             e.preventDefault();
             if (content_el.getText() != "") {
                 if (content.length < SETTINGS.max_message_length) {

                    if ($('.reply-msg-row').hasClass('reply-msg-row-show')) {
                        var new_msg_data = {}
                        new_msg_data['new_content'] = content;
                        new_msg_data['new_type'] = 1;

                        var msg_data = {};
                        msg_data['reply_message'] = JSON.parse($('.reply-msg-row').data('reply-content'));
                        msg_data['new_message'] = new_msg_data;
                        $(".close-reply-msg").trigger("click");
                        newMessage(JSON.stringify(msg_data), 8, false);

                    }else{
                        newMessage(content, 1, false);
                    }
                    
                    content_el.editor.focus();
                    
                 }else{
                     alert("{{_('Sorry, Your message is too long!')}}");
                 }
             }
        }
    });

    if (SETTINGS.push_notifications){
        if (SETTINGS.push_provider == 'firebase'){
        //FireBase Init
        var config = {
            'messagingSenderId': '{{SETTINGS.firebase_messaging_sender_id}}',
            'apiKey': '{{SETTINGS.firebase_api_key}}',
            'projectId': '{{SETTINGS.firebase_project_id}}',
            'appId': '{{SETTINGS.firebase_app_id}}',
        };
        firebase.initializeApp(config);
            if('serviceWorker' in navigator) {
                navigator.serviceWorker.register("{{ url('firebase-messaging-sw') }}")
                    .then((registration) => {
                        const messaging = firebase.messaging();
                        messaging.useServiceWorker(registration);
                        messaging
                            .requestPermission()
                            .then(function() {
                                console.log("Notification permission granted.");
                                return messaging.getToken();
                            })
                            .then(function(token) {
                                $.ajax({
                                    url: "{{ url('ajax-update-push-device') }}",
                                    type: "POST",
                                    dataType: 'json',
                                    data: {
                                        csrftoken: '{{ csrf_token_ajax() }}',
                                        token: token,
                                    }
                                });
                            })
                            .catch(function(err) {
                                console.log("Unable to get permission to notify.", err);
                            });

                        messaging.onMessage((payload) => {});
                    });
            }
        }else if (SETTINGS.push_provider == 'pushy'){
            //Init pushy
            Pushy.register({ appId: '{{SETTINGS.pushy_app_id}}' }).then(function (deviceToken) {
                console.log('Pushy device token: ' + deviceToken);
                $.ajax({
                    url: "{{ url('ajax-update-push-device') }}",
                    type: "POST",
                    dataType: 'json',
                    data: {
                        csrftoken: '{{ csrf_token_ajax() }}',
                        token: deviceToken,
                    }
                });
            }).catch(function (err) {
                // Handle registration errors
                console.log("Unable to get permission to notify.", err);
            });
        }
    }

    $(document).on('click', '.message-audio', function(e) {
        if ($(this).hasClass('recording')) {
            stopRecording();
            $('.message-audio').removeClass('recording');
        }else{
            $('.message-audio').addClass('recording');
            startRecording();
        }
    });

    $(document).on('click', '.btn-chat-search, .search-close', function(e) {
        if (SETTINGS.is_authenticated==true) {

            if($(".search-panel").is(":visible")){
                $(".search-panel").hide();
                $(".shown-panel").fadeIn().removeClass('shown-panel');
                var active_user = $("#active_user").val();
                var active_group = $("#active_group").val();
                var active_room = $("#active_room").val();
                chat_search_mode = false;
                loadChats(active_user, active_group, active_room);
            }else{
                load_current_panel('.search-panel');
            }
        }else{
            showAuthModal();
        }
    });

    $(document).on('click', '.rec-stop', function(e) {
        stopRecording();
        $('.message-audio').removeClass('recording');
    });

    $(document).on('keyup', '#search-query', function(e) {
        if (!event.ctrlKey) {
            if (event.keyCode === 13) {
                event.preventDefault();
                chatSearch();
            }else{
                chatSearch();
            }
        }
    });

    $(document).on('click', '.rec-cancel', function(e) {
        cancelRecording();
        $('.message-audio').removeClass('recording');
        if(isMobile==false){
            $('#message_content').data("emojioneArea").editor.focus();
        }
    });

    $(document).on('click', '.search-init', function(e) {
        chatSearch();
    });

    $(document).on('click', 'li.result, .replied-to', function(e) {
        var chat_id = $(this).data('chat-id');
        if ($('#'+chat_id).length) {
            $("#" + chat_id)[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            var highlight_class = '#'+chat_id + ' .message-data';
            $(highlight_class).css('animation', 'flash 2s ease infinite');
            setTimeout(function(){ $( highlight_class ).removeAttr('style'); }, 2000);

        }else{
            var active_user = $("#active_user").val();
            var active_group = $("#active_group").val();
            var active_room = $("#active_room").val();
            loadChats(active_user, active_group, active_room, chat_id);
            chat_search_mode = true;
        }
    });

    $(document).on('click', '.btn-room-user-search', function(e) {
        roomUserSearch();
    });

    $(document).on('keyup', '.room-user-search', function(e) {
        roomUserSearch();
    });

    $('.nav-sidebar').on('shown.bs.tab', function (e) {
        if ($('.room-user-search').val() != '') {
            $('.room-user-search').val('');
            loadActiveUsers();
            room_user_search_mode = false;
        }
    });

    $('.online-list').on('click', '.view-profile', function(e) {
        $(this).data('user-id');
        $('#shown-user').val($(this).data('user-id'));
        getActiveInfo($(this).data('user-id'));
        $(this).parents('.dropdown-menu').removeClass('show');
        e.stopPropagation();
    });

    $(document).on('click', '.close-selected-user', function(e) {
        getActiveInfo();
    });

    $(document).on('click', '.start-chat', function(e) {
        var active_user = $('#shown-user').val();
        var active_group = $("#active_group").val();
        var active_room = $("#active_room").val();
        loadChats(active_user, active_group, active_room);
    });

    $(document).on('click', '.message-start-chat', function(e) {
        if (disable_private_chats == false) {
            var chat_user = $(this).closest('.cht').find('.sender-name').data('user-id');
            var active_group = $("#active_group").val();
            var active_room = $("#active_room").val();
            loadChats(chat_user, active_group, active_room);
        }
    });

    $(document).on('click', '.sender-name, .group-user', function(e) {
        if (disable_private_chats == false) {
            if (SETTINGS.is_authenticated == true) {
                $(this).data('user-id');
                $('#shown-user').val($(this).data('user-id'));
                getActiveInfo($(this).data('user-id'));  
            }else{
                showAuthModal();
            }
        }
    });

    $('.select2').select2({
        theme: 'bootstrap4'
    });

    $("#room-selector").select2({
        templateResult: formatRoomOptions,
        theme: 'bootstrap4',
    });

    $(document).on('click', '.load-more-users, .load-more-dm-users', function(e) {
        var active_room = $("#active_room").val();
        var user_list_sec = $(".list-section.active").attr('id');
        var q = $(".room-user-search").val();
        room_user_search_mode = true;
        $.ajax({
            url: "{{ url('ajax-load-more-online-list') }}",
            type: "POST",
            dataType: 'json',
            data: {
                q: q,
                csrftoken: '{{ csrf_token_ajax() }}',
                active_room: active_room,
                user_list_section: user_list_sec,
            },
            success: function(data) {
                if(user_list_sec == 'dm'){
                    if ('dm_list' in data) {
                        $.each(data.dm_list, function( index, obj ) {
                            var chat_li = createOnlineUser(obj);
                            $('.dm-list').append(chat_li);
                        });
                    }
                }else{
                    if ('list' in data) {

                        $.each(data.list, function( index, obj ) {
                            var chat_li = createOnlineUser(obj);
                            $('.online-list').append(chat_li);
                        });
                    }
                }
            },
            complete: function(){
                if(user_list_sec == 'dm'){
                    $('.refresh-dm-list').show();
                }else{
                    $('.refresh-user-list').show();
                }
            }
        });
    });

    $(document).on('click', '.refresh-user-list', function(e) {
        room_user_search_mode = false;
        $('.refresh-user-list').hide();
        $('.room-user-search').val('');
        loadActiveUsers();
    });

    $(document).on('click', '.refresh-dm-list', function(e) {
        room_user_search_mode = false;
        $('.refresh-dm-list').hide();
        $('.room-user-search').val('');
        loadActiveUsers();
    });

    $(document).on('click', '.list-section', function(e) {
        room_user_search_mode = false;
        $('.refresh-user-list').hide();
        $('.refresh-dm-list').hide();
        $('.room-user-search').val('');
        loadActiveUsers();
    });

    $(document).on('click', '.forward-selection-close', function(e) {
        destroy_forward_selection();
    });

    $(document).on('click', '.forward-list-check', function(e) {
        e.stopPropagation();
    });


    $(document).on('click', '.forwarding li', function(e) {
        var fwd_check = $(this).find('.forward-list-check');
        if (fwd_check.length) {
            if($(fwd_check).is(':checked')) {
                $(fwd_check).prop('checked', false);
            }else{
                $(fwd_check).prop('checked', true);
            }
            forward_list_create(this.id);
        }

    });

    $(document).on("change", '.forward-list-check', function(event) {
        var forward_msg_id = $(this).parent().parent().attr('id');
        forward_list_create(forward_msg_id);
    });

    // forward message
    $(document).on('click', '.message-forward', function(e) {
        $('.forward-check:not(.deleted)').removeClass('hidden');
        $('.forward-selection').removeClass('hidden');
        $('.chats').addClass('forwarding');

        var forward_msg_id = $(this).closest('.cht').attr('id');
        $('#'+forward_msg_id).find('.forward-list-check').prop('checked', true);
        forward_list_create(forward_msg_id);
    });

    // forward message
    $(document).on('click', '.forward-selected', function(e) {
        forwardUserList();
    });

    $(document).on("change", '.chat-list-check', function(event) {
        var chat_item_id = $(this).data('id');
        var chat_item_name = $(this).data('name');
        if($(this).is(':checked')) {
            if($(this).data('is-group')){
                if($.inArray(chat_item_id, forward_group_list) == -1){
                    forward_group_list.push(parseInt(chat_item_id));
                }
            }else{
                if($.inArray(chat_item_id, forward_user_list) == -1){
                    forward_user_list.push(parseInt(chat_item_id));
                }
            }

            if($.inArray(chat_item_name, forward_chat_item) == -1){
                forward_chat_item.unshift(chat_item_name);
            }
        }else{
            if($(this).data('is-group')){
                if($.inArray(chat_item_id, forward_group_list) > -1){
                    forward_group_list.splice(forward_group_list.indexOf(chat_item_id), 1);
                }
            }else{
                if($.inArray(chat_item_id, forward_user_list) > -1){
                    forward_user_list.splice(forward_user_list.indexOf(chat_item_id), 1);
                }
            }

            if($.inArray(chat_item_name, forward_chat_item) > -1){
                forward_chat_item.splice(forward_chat_item.indexOf(chat_item_name), 1);
            }
        }

        var selected_chat_item_count = forward_chat_item.length;

        var forward_html = "";
        if(selected_chat_item_count > 0){
            $('.forward-actions').removeClass('hidden');
            if(selected_chat_item_count == 1){
                forward_html = forward_chat_item[0];
            }else if (selected_chat_item_count > 1) {
                forward_html = forward_chat_item[0] + " & " + (selected_chat_item_count-1) + " other(s)";
            }
            $('.forward-name').html(forward_html);
        }else{
            $('.forward-actions').addClass('hidden');
        }
    });

    $(document).on("click", '.forward-button', function(event) {

        var active_user = $("#active_user").val();
        var active_group = $("#active_group").val();
        var active_room = $("#active_room").val();

        $.ajax({
            type: 'POST',
            url: "{{ url('ajax-forward-message') }}",
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                forward_message: forward_msg_list,
                selected_chat_groups: forward_group_list,
                selected_chat_users: forward_user_list,
                active_user: active_user,
                active_room: active_room,
                active_group: active_group
            },
            success: function(data) {
                if (data.success) {
                    $('.forward-modal').modal('hide');
                    var active_user = $("#active_user").val();
                    var active_group = $("#active_group").val();
                    var active_room = $("#active_room").val();
                    if($.inArray(parseInt(active_user), forward_user_list) > -1 ) {
                        destroy_forward_selection();
                        loadChats(active_user, active_group, active_room);
                    }else if ($.inArray(parseInt(active_group), forward_group_list) > -1 ) {
                        destroy_forward_selection();
                        loadChats(active_user, active_group, active_room);
                    }
                    destroy_forward_selection();
                }
            },
            complete: function(){
            }
        });

    });


    $(document).on('click', '.max-recent', function(e) {
        getRecentMedia();
    });


    $('.nav-recent-max').on('shown.bs.tab', function (e) {
        if($(".nav-recent-max").is(":visible")){
            getRecentMedia();
        }
    });

    $(document).on('click', '.load-more-media', function(e) {
        getRecentMedia('is_load_more');
    })

    $(document).on('click', '.recent-media-close', function(e) {
        $('.recent-panel').hide();
        getActiveInfo();
        $('.nav-recent-max a[href="#recent-max-media"]').tab('show');
    });

    $(document).on('click', '.show-auth-model', function(e) {
        showAuthModal();
    });
    

    if (SETTINGS.radio){

        var source = $('.radio-container').data('default-source');
        var audio = document.createElement("audio");
        audio.volume = 0.5;

        $(document).on("change", "#radio-volume-control", function () {
            var vol_icon = $("#radio-volume-display i");
            if (this.value < 20) {
                vol_icon.removeClass("fa-volume-up fa-volume-down").addClass("fa-volume-off");
            } else if (this.value < 71) {
                vol_icon.removeClass("fa-volume-up fa-volume-off").addClass("fa-volume-down");
            } else {
                vol_icon.removeClass("fa-volume-down fa-volume-off").addClass("fa-volume-up");
            }
            audio.volume = this.value / 100;
        });

        $(document).on("click", ".turn-on-play", function () {
            audio.src = source;
            $(this).toggleClass("turn-on-play turn-off-play");
            $(this).children().toggleClass("fa-play-circle fa-stop-circle");
            audio.play();
        });

        $(document).on("click", ".turn-off-play", function () {
            audio.src = "static/audio/mute.mp3";
            $(this).toggleClass("turn-off-play turn-on-play");
            $(this).children().toggleClass("fa-stop-circle fa-play-circle");
            audio.pause();
        });

        $(document).on("click", ".radio-station", function () {
            var newSource = $(this).data("source");
            var newThumb = $(this).data("thumb");
            var sourceTitle = $(this).text();
            $(".radio-controls").removeClass("turn-on-play").addClass("turn-off-play");
            $(".radio-controls i").addClass("fa-stop-circle").removeClass("fa-play-circle");
            $(".radio-title").text(sourceTitle);
            $(".radio-desc").text($(this).data("description"));
            if (newThumb) {
                $(".radio-thumb").find('img').attr('src', "{{MEDIA_URL}}/settings/"+newThumb);
            }
            source = newSource;
            audio.src = newSource;
            audio.play();
        });

        $(document).on("click", "#radio-selector", function () {
            $('.radio-panel').toggle();
        });
    }

    $(document).on('show.bs.dropdown', '.show-actions', function () {
        var ddmenu = $(this).find('.dropdown-menu');
        var ddhtml = ``;
        var chat_type = $(this).data('chat-type');
        if ($(this).data('delete') == true) {
            ddhtml += `<a class="dropdown-item message-delete" data-chat-type="` + chat_type + `" href="javascript:void(0)"><i class="fas fa-trash"></i> {{_('Delete')}}</a>`;
        }
        if ($(this).data('reply') == true) {
            ddhtml += `<a class="dropdown-item message-reply" data-chat-type="` + chat_type + `" href="javascript:void(0)"><i class="fas fa-reply"></i> {{_('Reply')}}</a>`;
        }
        if ($(this).data('fwd') == true) {
            ddhtml += `<a class="dropdown-item message-forward" data-chat-type="` + chat_type + `" href="javascript:void(0)"><i class="fas fa-share"></i> {{_('Forward')}}</a>`;
        }
        if ($(this).data('start-chat') == true) {
            ddhtml += `<a class="dropdown-item message-start-chat" data-chat-type="` + chat_type + `" href="javascript:void(0)"><i class="fas fa-comments"></i> {{_('Start Chat')}}</a>`;
        }
        if ($(this).data('report') == true) {
            var chat_id = $(this).data('id');
            ddhtml += `<a class="dropdown-item init-report" data-report-header="{{_("Chat id")}} - `+chat_id+`" data-report-for="`+chat_id+`" data-report-type='1' data-chat-type="` + chat_type + `" href="javascript:void(0)"><i class="fas fa-flag"></i> {{_('Report')}}</a>`;
        }

        ddmenu.html(ddhtml);
        $(this).parent().addClass('active');
    });

    $(document).on('hidden.bs.dropdown', '.show-actions', function () {
        $(this).parent().removeClass('active');
    });
    
    $(document).on("click", ".init-report", function() {
        if (SETTINGS.is_authenticated == true) {
            var report_type = $(this).attr('data-report-type');
            var report_header = $(this).attr('data-report-header');
            var report_for = $(this).attr('data-report-for');
            var chat_type = $(this).attr('data-chat-type');
            if(chat_type == "group"){
                chat_type = 2;
            }else if(chat_type == "private"){
                chat_type = 1;
            }else{
                chat_type = 0;
            }
            $("#report_reason").empty();
            $("#report_comment").val("");
            $('#modalReportTitle').html("{{_('Report')}}");
            $('#report_for').val("");
            $('#report_type').val("");
            $('#chat_type').val("");
            $.ajax({
                url: "{{ url('ajax-get-report-reasons') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    report_type: report_type
                },
                beforeSend: function() {
                    loading(".report-reasons","show");
                },
                success: function(data) {

                    $.each(data, function (i, item) {
                        var option = new Option();
                        $(option).html(item.title);
                        $(option).val(item.id);
                        $("#report_reason").append(option);
                    });
                    $('#modalReportTitle').html("{{_('Report')}} : "+ report_header);
                    $('#report_for').val(report_for);
                    $('#report_type').val(report_type);
                    $('#chat_type').val(chat_type);
                    $('.report-modal').modal('show');
                },
                complete: function(){
                    loading(".report-reasons","hide");
                }
            });
        }else{
            showAuthModal();
        }
    });


    $(document).on("click", ".submit-report", function() {
        var report_type = $("#report_type").val();
        var report_for = $("#report_for").val();
        var report_reason = $("#report_reason").val();
        var report_comment = $("#report_comment").val();
        var chat_type = $("#chat_type").val();
        $.ajax({
            url: "{{ url('ajax-submit-report') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                report_type: report_type,
                report_for: report_for,
                report_reason: report_reason,
                report_comment: report_comment,
                chat_type: chat_type,
            },
            beforeSend: function() {
                loading(".submit-report","show");
            },
            success: function(data) {
                toastr.success(
                    "{{_('Your report has been received')}}", '',
                    {
                        timeOut: 1500,
                        fadeOut: 1500,
                    }
                );
            },
            complete: function(){
                $('.report-modal').modal('hide');
                loading(".submit-report","hide");
            }
        });
    });

    $(document).on("click", ".roomEmbed", function() {
        $("#room-embed-modal").modal();
        var chatroom_url = $("#chat_room_url").val();
        $("#room-embed-content").html('<code id="embed-code">&lt;iframe src=&quot;'+chatroom_url+'&quot; width=&quot;450px&quot; height=&quot;800px&quot; frameborder=&quot;0&quot;&gt;&lt;/iframe&gt;</code>')
        //$('.roomEmbed').popover('toggle');
    });

    $('#room-embed-modal').on('shown.bs.modal', function (e) {
        var copyText = $('#embed-code').text();
        navigator.clipboard.writeText(copyText);
        toastr.info(
            "{{_('Embed Code Copied to Clipboard')}}", '',
            {
                timeOut: 1500,
                fadeOut: 1500,
            }
        );
    });

    $('.roomEmbed').popover({
        trigger: 'manual',
        placement: 'top',
        html: true,
        title: function() {
          return "{{_('Room Embed Code')}}"
        },
        content: function() {
            var chatroom_url = $("#chat_room_url").val();
            return '<code id="embed-code">&lt;iframe src=&quot;'+chatroom_url+'&quot; width=&quot;450px&quot; height=&quot;800px&quot; frameborder=&quot;0&quot;&gt;&lt;/iframe&gt;</code>'
        }
    });


    $(document).on("click", ".leave-room", function() {
        if (SETTINGS.is_authenticated == true) {
            if (confirm('{{_("Are you sure?")}}')){
                var leave_room = $(this).data('room');
                $.ajax({
                    url: "{{ url('ajax-leave-room') }}",
                    type: "POST",
                    dataType: 'json',
                    data: {
                        csrftoken: '{{ csrf_token_ajax() }}',
                        leave_room: leave_room
                    },
                    beforeSend: function() {
                        loading("#page-top","show");
                    },
                    success: function(data) {
                        window.location.href = "{{ url('index') }}";
                    },
                    complete: function(){
                        loading("#page-top","hide");
                    }
                });
            }
        }else{
            showAuthModal();
        }
    });

    $(document).on("click", ".clear-chats", function() {
        if (SETTINGS.is_authenticated == true) {
            if (confirm('{{_("Are you sure you want to clear this chat? Chats will be deleted for you")}}')){
                var active_user = $("#active_user").val();
                var active_group = $("#active_group").val();
                $.ajax({
                    url: "{{ url('ajax-clear-chats') }}",
                    type: "POST",
                    dataType: 'json',
                    data: {
                        csrftoken: '{{ csrf_token_ajax() }}',
                        active_user: active_user,
                        active_group: active_group
                    },
                    beforeSend: function() {
                        loading("#page-top","show");
                    },
                    success: function(data) {
                        if(data.success){
                            toastr.success(
                                data.message, '',
                                {
                                    timeOut: 1500,
                                    fadeOut: 1500,
                                }
                            );
                            $(".chats").empty();
                        }
                    },
                    complete: function(){
                        loading("#page-top","hide");
                    }
                });
            }
        }else{
            showAuthModal();
        }
    });

    $('.room-notice').on('closed.bs.alert', function () {
        if($('.general-notice').length){
            $('.general-notice').show();
        }
    });

    $(document).on("click", ".chat-room-selector", function() {
        get_chatroom_list();
        $('#roomModal').modal('show');
    });

    $(document).on('keyup', '.room-sel-search', function(event) {
        if (!event.ctrlKey) {
            get_chatroom_list();
        }
    });

    $(document).on('click', '.room-sel-search-btn', function() {
        get_chatroom_list();
    });

    $(document).on('click', '.reaction-btn', function (e) {
        $(this).find('.reaction-box').html($('.reaction-box-content').html());
        var active_reaction = $(this).attr('data-active-reaction');
        if($(this).find('.reaction-box').hasClass('reaction-box-show')){
            $(".reaction-icon").removeClass("show");
            $('.reaction-box').removeClass('reaction-box-show');
            $('.chat-actions').removeClass('active');
        }else{
            $(".reaction-icon").removeClass("show");
            $('.reaction-box').removeClass('reaction-box-show');
            $('.chat-actions').removeClass('active');
            $(this).closest('.chat-actions').addClass('active');
            $(this).find('.reaction-box').addClass('reaction-box-show');

            $(this).find(".reaction-icon").each(function (i, e) {
                if($(e).attr('data-value') == active_reaction){
                    var active_cls = 'active';
                }else{
                    var active_cls = '';
                }
                setTimeout(function () {
                    $(e).addClass("show");
                    $(e).addClass(active_cls);
                }, i * 100);
            });
        }
       
    });

    $(document).on('click', '.reaction-icon', function (e) {
        
        var reaction_type = $(this).attr('data-value');
        var message_id = $(this).closest('.cht').attr('id');
        var chat_type = $(this).closest('.cht').find('.show-actions').attr('data-chat-type');

        var previous_react = $(this).closest('.reaction-btn').attr('data-active-reaction');
        if(previous_react == reaction_type){
            $(this).closest('.reaction-btn').attr('data-active-reaction', 0);
        }else{
            $(this).closest('.reaction-btn').attr('data-active-reaction', reaction_type);
        }

        $.ajax({
            url: "{{ url('ajax-message-reaction') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                reaction_type: reaction_type,
                message_id: message_id,
                chat_type: chat_type
            },
            beforeSend: function () {
                loading(".messages", "show");
            },
            complete: function () {
                loading(".messages", "hide");
            }

        });
       
    });

    $(document).on('click', '.current-reacts', function (e) {
        var message_id = $(this).closest('.cht').attr('id');
        var chat_type = $(this).closest('.cht').find('.show-actions').attr('data-chat-type');
        reactedUserList(message_id, chat_type);
        $('.reacted_msg_id').val(message_id);
        $('.reacted_chat_type').val(chat_type);
    });

    $(document).on('click', '.filter-btn', function (e) {
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        var filter_value = $(this).attr('data-filter-value');
        filterReaction(filter_value);
    })

    $(document).on('click', '.remove-react', function (e) {
        var message_id = $('.reacted_msg_id').val();
        var chat_type = $('.reacted_chat_type').val();
        $.ajax({
            url: "{{ url('ajax-remove-message-reaction') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                message_id: message_id,
                chat_type: chat_type
            },
            beforeSend: function () {
                loading(".messages", "show");
            },
            success: function (data) {
                $('.cht#'+message_id).find('.reaction-btn').attr('data-active-reaction', 0);
                $('.cht#'+message_id).find('.reaction-icon').removeClass('active');
            }, 
            complete: function () {
                loading(".messages", "hide");
            }

        });
    });

    $(document).on('click', '.chat-video-block', function (e) {
        e.preventDefault();
        var video_link = $(this).attr('data-video');
        var video_html = `<video width="640" height="320" controls autoplay>
            <source src="`+video_link+`" type="video/mp4">
        </video>`;
        $("#video-embed-content").html(video_html);
        $("#video-modal-2").modal();
    });

    // launch private call
    $(document).on('click', '#launch-call', function(e) {
        var chat_meta_id = $("#chat_meta_id").val();
        var active_user = $("#active_user").val();
        var active_room = $("#active_room").val();
        $.ajax({
            url: "{{ url('ajax-launch-private-call') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                chat_meta_id: chat_meta_id,
                to_user: active_user,
                active_room: active_room,
            },
            success: function(data) {
                if(data.success == "true"){
                    in_call = true;
                    $('#call_id').val(data.response.call_id);
                }else{
                    alert(data.response);
                }
            }
        });

    });

    $(document).on('click', '.answer', function(e) {

        var call_id = $("#call_id").val();
    
        $.ajax({
            url: "{{ url('ajax-answer-private-call') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                call_id: call_id,
            },
            success: function(data) {
                if(data.success == "true"){
                    in_call = true;
                    hideCallAlert();
                    $('#call_id').val(data.response.call_id);
                }else{
                    alert(data.message);
                }
            }
        });
    });

    $(document).on('click', '.hangup', function(e) {
        var call_id = $("#call_id").val();
        $.ajax({
            url: "{{ url('ajax-hangup-private-call') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                call_id: call_id,
            },
            success: function(data) {
                if(data.success == "true"){
                    in_call = false;
                    call_started = false;
                    hideCallAlert();
                    $('.video-container').hide();
                    $('#call_id').val(data.response.call_id);
                    end_private_call();
                }else{
                    alert(data.message);
                }
            }
        });
    });


    $(document).on("click", ".call-toggle-fc", function() {
        var elem = document.querySelector('.video-container');
    
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { /* Firefox */
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE/Edge */
                elem.msRequestFullscreen();
            }
            $('.video-container').addClass('video-container-fc');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
            $('.video-container').removeClass('video-container-fc');
        }
    });
    
    $(document).on("click", ".call-toggle-height", function() {
        $('.video-container').toggleClass('video-container-expand')
    });
});
// Doc ready end

// Heart Beat Functions
$( document ).ready(function() {
    // Main chat heartbeat
    window.setInterval(function(){
        var chat_access = true;
        if(chat_search_mode==false){
            if(heartbeat_status == 1){
                var active_user = $("#active_user").val();
                var active_group = $("#active_group").val();
                var active_room = $("#active_room").val();
                var last_chat_id = $("#last_chat_id").val();
                var chat_meta_id = $("#chat_meta_id").val();
                $.ajax({
                    url: "{{ url('ajax-heartbeat') }}",
                    type: "POST",
                    dataType: 'json',
                    data: {
                        csrftoken: '{{ csrf_token_ajax() }}',
                        active_group: active_group,
                        active_room: active_room,
                        active_user: active_user,
                        last_chat_id: last_chat_id,
                        chat_meta_id: chat_meta_id,
                        is_typing: is_typing,
                    },
                    beforeSend: function() {
                        heartbeat_status = 0; //working
                    },
                    success: function(data) {
                        if(data.typing_user){
                            $('.is-typing').show();
                            $('.is-typing span').html(data.typing_user);
                        }else{
                            $('.is-typing').hide();
                            $('.is-typing span').html("");
                        }
                        if (data.chats) {
                            $.each(data.chats, function( index, obj ) {
                                createMessage(obj,"");
                                $("#last_chat_id").val(obj.id);
                                if(!data.is_muted){
                                    play_chat_sound();
                                }
                                if(obj.type == 10){
                                    if(SETTINGS.enable_codes){
                                        Prism.highlightAll();
                                    }
                                }
                                if ($.inArray(obj.type, [2, 5, 6]) > -1) {
                                    getActiveRecentMedia();
                                }
                            });
                        }

                        if (data.unnotified_chats) {
                            $.each(data.unnotified_chats, function( index, obj ) {
                                var avatar_src = getUserAvatar(obj, obj.display_name);
                                toastr.success(
                                    '<div class="toast-avatar"><img src="'+avatar_src+'"></div>' +
                                    '<div class="toast-brief">'+message_small_preview(obj.message, obj.type)+'</div>',
                                    obj.display_name,
                                    {   
                                        escapeHtml: false,
                                        timeOut: 1500,
                                        fadeOut: 1500,
                                        tapToDismiss: false,
                                        toastClass: "message-toast",
                                        iconClass: 'message-icon',
                                        showMethod: "slideDown",
                                    }
                                );
                                // if(!data.is_muted){
                                    play_chat_sound();
                                // }
                            });
                        }

                        if (data.call) {
                            var call_obj = data.call;
                            if(call_obj.call_status == 1 && call_obj.im_calling == 0){
                                showCallAlert(call_obj);
                            }else if(call_obj.call_status == 1 && call_obj.im_calling == 1){
                                in_call = true;
                                manageCallWindow(call_obj.call_id, call_obj.call_status, 'Calling..');
                            }

                            if(call_obj.call_status == 2){
                                showCallWindow(call_obj);
                            }

                            if(call_obj.call_status == 3){
                                hideCallAlert();
                            }
                        }

                        
                        if(data.chat_access.available_status == 2){
                            restrictTypingArea(1, "{{_('User is deactivated')}}");
                        }else if(data.chat_access.blocked_by_you){
                            restrictTypingArea(data.chat_access.blocked_by_you, "{{_('Blocked by you')}}");
                        }else if (data.chat_access.blocked_by_him) {
                            restrictTypingArea(data.chat_access.blocked_by_him, "{{_('Blocked by user')}}");
                        }else if ("room_access" in data.chat_access && data.chat_access.room_access == false){
                            chat_access = false;
                            toastr.error(
                                "{{_('Access has been revoked')}}", '',
                                {
                                    timeOut: 1500,
                                    fadeOut: 1500,
                                    onHidden: function () {
                                        window.location.href = "{{ url('index') }}";
                                    }
                                }
                            );

                        }else if ("user_deleted" in data.chat_access && data.chat_access.user_deleted == true){
                            chat_access = false;
                            toastr.error(
                                "{{_('Your account has been deleted')}}", '',
                                {
                                    timeOut: 1500,
                                    fadeOut: 1500,
                                    onHidden: function () {
                                        window.location.href = "{{ url('logout') }}";
                                    }
                                }
                            );

                        }else{
                            restrictTypingArea(0, '');
                        }

                        if(data.chat_access.blocked_by_you){
                            $('.active-user-block .icon').html('<i class="fas fa-ban"></i>');
                            $('.active-user-block').attr('title', "{{_('Unblock')}}");
                        }else{
                            $('.active-user-block .icon').html('<i class="far fa-circle"></i>');
                            $('.active-user-block').attr('title', "{{_('Block')}}");
                        }
                    },
                    complete: function(){
                        lazyLoad();
                        GreenAudioPlayer.init({
                            selector: '.cn-player',
                            stopOthersOnPlay: true,
                        });
                        if(chat_access){
                            heartbeat_status = 1; //complete
                        }

                    }
                });
            }
        }
    }, SETTINGS.chat_receive_seconds);

    // Left sidebar active user list heartbeat
    var run_online_list = true;
    $('.fav-list, .online-list, .dm-list').mouseenter(function(){
        run_online_list=false;
        window.setInterval(function(){
            run_online_list=true;
        }, 30000);

    });
    $('.fav-list, .online-list, .dm-list').mouseleave(function(){run_online_list=true;});
    window.setInterval(function(){
        if (room_user_search_mode==false && run_online_list==true) {
            loadActiveUsers();
        }
    }, SETTINGS.user_list_check_seconds);

    // Load room list unread count
    window.setInterval(function(){
        roomListUnread();
    }, SETTINGS.user_list_check_seconds);

    // Message read status heartbeat
    window.setInterval(function(){
        if(updated_chats_heartbeat_status == 1){
            var active_user = $("#active_user").val();
            var active_group = $("#active_group").val();
            var active_room = $("#active_room").val();
            var last_updated_chat_time = $("#last_updated_chat_time").val();
            $.ajax({
                url: "{{ url('ajax-updated-chats') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    active_group: active_group,
                    active_room: active_room,
                    active_user: active_user,
                    last_updated_chat_time: last_updated_chat_time,
                },
                beforeSend: function() {
                    updated_chats_heartbeat_status = 0; //working
                },
                success: function(data) {
                    if (data.updated_chats.length > 0) {
                        $.each(data.updated_chats, function( index, obj ) {
                            var updated_li = $(".messages .chats").find("div[id="+ obj.id +"]");
                            if (obj.status == 2) {
                                $(updated_li).find('.message-status').addClass('read');
                            }else if (obj.status == 3) {
                                $(updated_li).find('.message-html').html(`<div class="chat-txt deleted"><i class="fa fa-ban"></i> This message was deleted</div>`);
                                if ($.inArray(obj.type, [2, 5, 6]) > -1) {
                                    getActiveRecentMedia();
                                }
                            }
                            reaction_update_chat_changes(obj);
                            
                        });
                        $("#last_updated_chat_time").val(data.updated_chats[0].updated_at);
                    }
                },
                complete: function(){
                    updated_chats_heartbeat_status = 1; //complete
                }
            });
        }
    }, SETTINGS.chat_status_check_seconds);

    // notification heartbeat
    window.setInterval(function(){
        if(notification_count_status == 1){
            $.ajax({
                url: "{{ url('ajax-noti-unread-count') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                },
                beforeSend: function() {
                    notification_count_status = 0; //working
                },
                success: function(data) {
                    if(data.unread_count >= 1){
                        $('.noti-count').show().html(data.unread_count);
                    }else{
                        $('.noti-count').hide().html('');
                    }
                },
                complete: function(){
                    notification_count_status = 1; //complete
                }
            });
        }
    }, SETTINGS.notification_count_seconds);

    setInterval(refreshTypingStatus, 1000);

    window.setInterval(function(){
        if(in_call){
            check_call_status();
        }
    }, 1000);

    $('#selected-lang-toggle').html($('.selected-lang').html());

});


})();