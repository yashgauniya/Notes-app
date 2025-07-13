import express from 'express';
import http from 'http';
import cors from 'cors';
import noteRoutes from './routes/noteRoutes.js';
import { initSocket } from './sockets/socket.js';
import './config/connectToDatabase.js';
import 'dotenv/config';
import Note from './models/NoteModel.js';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/notes', noteRoutes);

initSocket(server);

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});