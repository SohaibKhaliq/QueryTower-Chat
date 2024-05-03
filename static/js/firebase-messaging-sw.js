function initInSw() {
  importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js');
  firebase.initializeApp({
    apiKey: '{{SETTINGS.firebase_api_key}}',
    projectId: '{{SETTINGS.firebase_project_id}}',
    messagingSenderId: '{{SETTINGS.firebase_messaging_sender_id}}',
    appId: '{{SETTINGS.firebase_app_id}}'
  });
  const messaging = firebase.messaging();
}

function onBackgroundMessage() {
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage();
}

initInSw();
onBackgroundMessage();
