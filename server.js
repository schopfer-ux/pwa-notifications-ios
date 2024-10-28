const express = require('express');
const bodyParser = require('body-parser');
const webPush = require('web-push');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const vapidKeys = webPush.generateVAPIDKeys();
console.log(vapidKeys);

const publicKey = vapidKeys.publicKey;
const privateKey = vapidKeys.privateKey;
webPush.setVapidDetails('mailto:you@example.com', publicKey, privateKey);

// Store the subscription object temporarily
let subscription = null;

// Route to handle subscription
app.post('/subscribe', (req, res) => {
    subscription = req.body;
    res.status(201).json({});
    console.log("User subscribed:", subscription);
});

// Handle unsubscription request on the server
app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
      return res.status(400).json({ error: 'No endpoint provided for unsubscription' });
  }

  console.log(`Unsubscribed endpoint: ${endpoint}`);
  // Remove the subscription from your database if you're storing it

  res.status(200).json({ message: 'Unsubscribed successfully' });
});


// Route to handle push notification
app.post('/send-notification', (req, res) => {

    const payload = JSON.stringify({ title: 'Hello!', body: 'This is a push notification' });

    webPush.sendNotification(subscription, payload)
        .then(() => res.status(200).json({ message: 'Notification sent' }))
        .catch(error => {
            console.error("Error sending notification:", error);
            res.status(500).json({ error: 'Failed to send notification' });
        });
});

// Serve index.html on root request
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
