
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    // icon: '/assets/icon.png', // Ensure you have an icon at this path in /public
    // badge: '/assets/badge.png', // And a badge at this path in /public
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});