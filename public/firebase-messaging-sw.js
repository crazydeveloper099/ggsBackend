

importScripts('https://www.gstatic.com/firebasejs/7.14.6/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.6/firebase-messaging.js');

var firebaseConfig = {
    apiKey: "AIzaSyDgWeTlLT4qMGOtop75NPTyz8ZX4woD8hc",
    authDomain: "retosgamer-328be.firebaseapp.com",
    databaseURL: "https://retosgamer-328be.firebaseio.com",
    projectId: "retosgamer-328be",
    storageBucket: "retosgamer-328be.appspot.com",
    messagingSenderId: "935537268417",
    appId: "1:935537268417:web:69f145053c591119fce640",
    measurementId: "G-0XR8CZH0JP"
};

firebase.initializeApp(firebaseConfig);
const messaging=firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    
    const notification=JSON.parse(payload);
    const notificationOption={
        body:notification.body,
        icon:"images/cod_mobile.jpg"
    };
    return self.registration.showNotification(payload.notification.title,notificationOption); 
});