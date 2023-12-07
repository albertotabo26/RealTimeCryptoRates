require('dotenv').config();
import express from 'express';
import { Server } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import routes from './routes';

const app = express();
const server = new Server(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, '../public')));

app.use('/screenshots', express.static(path.join(__dirname, '../views/screenshots')));

app.use('/', routes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/quickstart', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/quickstart.html'));
});

wss.on('connection', (ws) => {

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { wss };
