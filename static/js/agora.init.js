// create Agora client
var agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

var localTracks = {
  videoTrack: null,
  audioTrack: null
};

// Agora client options
var options = {
    appid: null,
    channel: null,
    uid: null,
    token: null
  };
  

var remoteUsers = {};

var videoCallGridEl = $('#media-div');

async function checkMediaDevicesPermission() {
    async function hasDevice(deviceType) {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.some(device => device.kind === deviceType);
        } catch {
            return false;
        }
    }
    async function canAccessDevice(deviceConfig) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(deviceConfig);
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch {
            return false;
        }
    }
    const hasWebcam = await hasDevice('videoinput');
    const canAccessWebcam = hasWebcam && await canAccessDevice({ video: true });

    const hasMicrophone = await hasDevice('audioinput');
    const canAccessMicrophone = hasMicrophone && await canAccessDevice({ audio: true });

    return {
        webcam: {
            available: hasWebcam,
            permissionGranted: canAccessWebcam
        },
        microphone: {
            available: hasMicrophone,
            permissionGranted: canAccessMicrophone
        }
    };
}

async function initAgoraCall(appId, accessToken, roomName, userName){
    var options = {
        appid: appId,
        channel: roomName,
        token: accessToken
    };

    // add event listener to play remote tracks when remote user publishs.
    agoraClient.on("user-published", handleUserPublished);
    agoraClient.on("user-unpublished", handleUserUnpublished);

    // join a channel and create local tracks, we can use Promise.all to run them concurrently
    [ options.uid, localTracks.audioTrack, localTracks.videoTrack ] = await Promise.all([
        // join the channel
        agoraClient.join(options.appid, options.channel, options.token || null, userName),
        // create local tracks, using microphone and camera
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()
    ]);
    
    // play local video track
    localTracks.videoTrack.play("local-player");
    //$("#local-player-name").text(`localVideo(${options.uid})`);

    // publish local tracks to channel
    await agoraClient.publish(Object.values(localTracks));
    console.log("publish success");

}

async function endAgoraCall(){
    for (trackName in localTracks) {
        var track = localTracks[trackName];
        if(track) {
          track.stop();
          track.close();
          localTracks[trackName] = undefined;
        }
      }

      // remove remote users and player views
      remoteUsers = {};
      videoCallGridEl.find('.remote-video').remove();
    
      // leave the channel
      await agoraClient.leave();
    
      console.log("client leaves channel success");
}


  
async function subscribe(user, mediaType) {
    const uid = user.uid;
    // subscribe to a remote user
    await agoraClient.subscribe(user, mediaType);
    console.log("subscribe success");
    if (mediaType === 'video') {
      const player = $(`
        <div class="remote-video" id="agora-wrapper-${uid}">
          <div class="video-caller-name">${uid}</div>
          <div class="agora-player" id="player-${uid}"></div>
        </div>
      `);
      videoCallGridEl.append(player);
      user.videoTrack.play(`player-${uid}`);
    }
    if (mediaType === 'audio') {
      user.audioTrack.play();
    }
}
  
function handleUserPublished(user, mediaType) {
    const id = user.uid;
    remoteUsers[id] = user;
    subscribe(user, mediaType);
}
  
function handleUserUnpublished(user, mediaType) {
    const id = user.uid;
    if (mediaType === 'video') {
        delete remoteUsers[id];
        $(`#agora-wrapper-${id}`).remove();
    }
}

$(document).on("click", ".call-toggle-cam", function(e) {
    console.log('call-toggle-cam');
    if($(this).hasClass('muted')){
        $(this).removeClass('muted');
        $(this).find('i').removeClass('fa-video-slash').addClass('fa-video');
        localTracks.videoTrack.setEnabled(true);
    }else{
        $(this).addClass('muted');
        $(this).find('i').removeClass('fa-video').addClass('fa-video-slash');
        localTracks.videoTrack.setEnabled(false);
    }
});

$(document).on("click", ".call-toggle-mic", function(e) {
    console.log('call-toggle-mic');
    if($(this).hasClass('muted')){
        $(this).removeClass('muted');
        $(this).find('i').removeClass('fa-microphone-slash').addClass('fa-microphone');
        localTracks.audioTrack.setEnabled(true);
    }else{
        $(this).addClass('muted');
        $(this).find('i').removeClass('fa-microphone').addClass('fa-microphone-slash');
        localTracks.audioTrack.setEnabled(false);
        
    }
});