// Service Worker: `sw.js`

self.addEventListener('push', event => {
    let data = {};
    if (event.data) {
        data = event.data.json();
    }

    const title = data.title || 'Default Title';
    const options = {
        body: data.body || 'Default body content',
        icon: 'pwa-512x512.png', // Optional icon for the notification
        badge: 'pwa-512x512.png', // Optional badge image
        actions: [
            { action: 'view', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
