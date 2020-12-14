import express from 'express';
import Expo from 'expo-server-sdk';

const app = express();
const expo = new Expo();

// store tokens registered with the app
let savedPushTokens = [];
const PORT_NUMBER = 3000;

// tokens sent from app to Expo server
const handlePushTokens = (message) => {
  let notifications = [];

  for (let pushToken of savedPushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    notifications.push({
      to: pushToken,
      sound: 'default',
      title: 'Message received!',
      body: message,
      data: { message }
    })
  }

  // The Expo push notification service accepts batches of notifications
  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    for (let chunk of chunks) {
      try {
        // Send the chunks to the Expo push notification service (one at a time)
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } 
      catch (error) {
        console.error(error);
      }
    }
  })();
}

const saveToken = (token) => {
  if (savedPushTokens.indexOf(token === -1)) {
    savedPushTokens.push(token);
  }
}

app.use(express.json());

app.listen(PORT_NUMBER, () => {
  console.log(`Server running on Port ${PORT_NUMBER}`);
});

app.get('/', (req, res) => {
  res.send('Push Notification Server Running');
});

app.post('/token', (req, res) => {
  saveToken(req.body.token.value);
  console.log(`Received push token: ${req.body.token.value}`);
  res.send(`Received push token, ${req.body.token.value}`);
});

app.post('/message', (req, res) => {
  handlePushTokens(req.body.message);
  console.log(`Received message: ${req.body.message}`);
  res.send(`Received message, ${req.body.message}`);
});
