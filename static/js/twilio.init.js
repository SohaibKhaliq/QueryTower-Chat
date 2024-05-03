var localTracks = [];
var localVideoEl;
var twilioVideoClient = null;
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

function trackSubscribed(track, publication, participant) {
    console.log(participant);
    if ($('.remote-video[data-sid="' + participant.sid + '"]').length) {
        $('.remote-video[data-sid="' + participant.sid + '"]').append(track.attach());
    } else {
        var remoteVideoEl = $('<div>').addClass('remote-video').attr("data-sid", participant.sid);
        remoteVideoEl.append(track.attach());
        remoteVideoEl.append('<div class="video-caller-name">' + participant.identity + '</div>');
        videoCallGridEl.append(remoteVideoEl);
    }
}

function participantDisconnected(disconnectedParticipant) {
    console.log('User ' + disconnectedParticipant.identity + ' disconnected');
    $('.remote-video[data-sid="' + disconnectedParticipant.sid + '"]').remove();
}

async function initTwilioCall(accessToken, roomName){

    const mediaPermissions = await checkMediaDevicesPermission();
    console.log(mediaPermissions);
    Twilio.Video.connect(accessToken, {

        name: roomName,
        tracks: localTracks,
        video: { width: 300 }

    }).then(function (vc) {
        twilioVideoClient = vc;
        Twilio.Video.createLocalTracks({
            audio: mediaPermissions.microphone.permissionGranted, 
            video: mediaPermissions.webcam.permissionGranted
        }).then(function (tracks) {
            // Handle local media
            localTracks = tracks;
            localVideoEl = $('<div>').addClass('local-video');
            localVideoEl.append('<div class="video-caller-name">You</div>');
            if (mediaPermissions.webcam.permissionGranted) {
                const localVideoElement = tracks.find(track => track.kind === 'video').attach();
                localVideoEl.append(localVideoElement);
            }else{
                console.log("NO PERM");
            }
            videoCallGridEl.append(localVideoEl);

            twilioVideoClient.on('trackSubscribed', function (track, publication, participant) {
                alert();
                trackSubscribed(track, publication, participant);
            });
            
            twilioVideoClient.on('participantDisconnected', function (disconnectedParticipant) {
                participantDisconnected(disconnectedParticipant);
            });

        }).catch(function (error) {
            console.error('Error accessing local media:', error);
        });

    }).catch(function (error) {
        console.error('Error connecting to room:', error);
    });
}


function endTwilioCall(){
    if (twilioVideoClient) {
        twilioVideoClient.disconnect();
        twilioVideoClient = null;
    }
    localTracks.forEach(function (track) {
        track.stop();
    });
    localTracks = [];
    $('.local-video').remove();
    $('.remote-video').remove();
}

$(document).on("click", ".call-toggle-cam", function(e) {
    var isVideoEnabled = false;
    localTracks.forEach(function (track) {
        if (track.kind === 'video') {
            if (track.isEnabled) {
                track.disable();
            } else {
                track.enable();
                isVideoEnabled = true;
            }
        }
    });
    if (isVideoEnabled) {
        $(this).find('i').removeClass('fa-video').addClass('fa-video-slash');
    } else {
        $(this).find('i').removeClass('fa-video-slash').addClass('fa-video');
    }
});

$(document).on("click", ".call-toggle-mic", function(e) {
    var isAudioEnabled = false;
    localTracks.forEach(function (track) {
        if (track.kind === 'audio') {
            if (track.isEnabled) {
                track.disable();
            } else {
                track.enable();
                isAudioEnabled = true;
            }
        }
    });
    if (isAudioEnabled) {
        $(this).find('i').removeClass('fa-microphone').addClass('fa-microphone-slash');
    } else {
        $(this).find('i').removeClass('fa-microphone-slash').addClass('fa-microphone');
    }
});