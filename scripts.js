const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCall');

let localStream;
let remoteStream;
let peerConnection;
const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// Request access to the camera and microphone
async function startVideoCall() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        peerConnection = new RTCPeerConnection(servers);
        
        // Add local tracks to peer connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Listen for remote track
        peerConnection.ontrack = event => {
            remoteVideo.srcObject = event.streams[0];
        };

        // Notify when call starts
        notifyUser("Call started");
        
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
}

function endVideoCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;

    // Notify when call ends
    notifyUser("Call ended");
}

function notifyUser(message) {
    if (Notification.permission === "granted") {
        new Notification("Video Chat", {
            body: message
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Video Chat", {
                    body: message
                });
            }
        });
    }
}

// Event listeners
startCallButton.addEventListener('click', startVideoCall);
endCallButton.addEventListener('click', endVideoCall);

// Check for notifications permission
if (Notification.permission === "default") {
    Notification.requestPermission();
}
