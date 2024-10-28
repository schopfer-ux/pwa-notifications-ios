const publicVapidKey = 'BJVP_w2c-5mo5DEdifCTasIFMzN0iAjouPEwei7miMerYMi2wecB-kCogH5t9C88pI4PPa3lcZUr95AW944azEY'; // Replace with your actual VAPID public key

let subscription = null;

// Enable notifications
document.getElementById('enable-notifications').addEventListener('click', async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        alert("Notifications enabled!");
    } else {
        alert("Notification permission denied!");
    }
});

// Subscribe the user to push notifications
document.getElementById('subscribe').addEventListener('click', async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: publicVapidKey
            });

            // Display the subscription information
            document.getElementById('subscriber-info').textContent = JSON.stringify(subscription, null, 2);

            // Send the subscription to the server
            await fetch('/subscribe', {
                method: 'POST',
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys: {
                        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
                        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))
                    }
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            alert("Successfully subscribed!");
        } catch (error) {
            console.error("Subscription failed: ", error);
        }
    }
});

// Unsubscribe Button Event Listener
document.getElementById('unsubscribe').addEventListener('click', async () => {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            alert("No active service worker found.");
            return;
        }

        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
            console.log("Unsubscribed successfully!");

            // Update UI and clear subscription info
            document.getElementById('subscriber-info').textContent = "Unsubscribed";
            alert("You have been unsubscribed from notifications.");

            // Optionally notify the server about unsubscription
            await fetch('/unsubscribe', {
                method: 'POST',
                body: JSON.stringify({ endpoint: subscription.endpoint }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            alert("You are not subscribed.");
        }
    }
});


// Send a push notification
document.getElementById('push-notification').addEventListener('click', async () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(function (error) {
            console.error('Service Worker registration failed:', error);
        });
    }



    if (subscription) {
        console.log('Subscription object received:', subscription); // Add before sending notification
        if (!subscription || !subscription.endpoint || !subscription.keys) {
            console.error('Invalid subscription object:', subscription);
        }

        try {
            // Example of sending subscription data from client to server
            fetch('/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscription })  // Ensure this includes the correct subscription object
            }).then(response => {
                if (!response.ok) {
                    console.error('Failed to send notification:', response.statusText);
                }
            }).catch(error => {
                console.error('Error with fetch request:', error);
            });

        } catch (error) {
            console.error("Failed to send notification:", error);
        }
    } else {
        alert("Please subscribe first!");
    }
});
