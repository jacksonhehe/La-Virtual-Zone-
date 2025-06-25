const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');
const admin = require('firebase-admin');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// --- Firebase Admin Init (optional) ---
let messaging = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  try {
    const serviceAccount = JSON.parse(
      fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
    );
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    messaging = admin.messaging();
  } catch (err) {
    console.error('Failed to init Firebase', err);
  }
}

const userTokens = {};

app.post('/register-token', (req, res) => {
  const { user, token } = req.body;
  if (user && token) {
    userTokens[user] = token;
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('message', (msg) => {
    const full = {
      id: crypto.randomUUID(),
      user: msg.user,
      text: msg.text,
      ts: Date.now(),
    };
    io.to(msg.room || 'lobby').emit('message', full);
  });

  socket.on('goal_scored', (data) => {
    io.to(data.room || 'lobby').emit('goal_scored', data);
    if (messaging) {
      const notification = {
        notification: {
          title: '¡Gol!',
          body: `${data.scorer} anotó en el minuto ${data.minute}`,
        },
      };
      Object.values(userTokens).forEach((token) => {
        messaging.send({ ...notification, token }).catch((err) => {
          console.error('FCM error', err);
        });
      });
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
