/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

let hasInitializedMessaging = false;

self.addEventListener('message', event => {
  const data = event?.data;
  if (!data || data.type !== 'FIREBASE_CONFIG' || hasInitializedMessaging) {
    return;
  }

  if (!firebase?.messaging?.isSupported?.() || typeof firebase.initializeApp !== 'function') {
    console.warn('Firebase messaging is not supported in this browser.');
    hasInitializedMessaging = true;
    return;
  }

  const config = data.payload;

  if (!config || typeof config !== 'object') {
    console.warn('Firebase messaging worker received invalid configuration.');
    return;
  }

  try {
    firebase.initializeApp(config);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage(payload => {
      const notificationTitle = payload.notification?.title ?? 'RaceSync';
      const notificationOptions = {
        body: payload.notification?.body ?? '',
        icon: payload.notification?.icon,
        data: payload.data,
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
    hasInitializedMessaging = true;
  } catch (error) {
    console.error('Failed to initialize Firebase messaging in service worker', error);
  }
});
