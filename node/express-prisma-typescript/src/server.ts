import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import jwt from 'jsonwebtoken'

import { Constants, NodeEnv, Logger } from '@utils'
import { router } from '@router'
import { ErrorHandling } from '@utils/errors'
import { SetupSwagger } from '@utils/swagger'
import {Server} from "socket.io";
import { createServer } from 'http'

const app = express()

// Set up request logger
if (Constants.NODE_ENV === NodeEnv.DEV) {
  app.use(morgan('tiny')) // Log requests only in development environments
}

// Set up request parsers
app.use(express.json()) // Parses application/json payloads request bodies
app.use(express.urlencoded({ extended: false })) // Parse application/x-www-form-urlencoded request bodies
app.use(cookieParser()) // Parse cookies

// Set up CORS
app.use(
  cors({
    origin: Constants.CORS_WHITELIST
  })
)

app.use('/api', router)

SetupSwagger(app);

app.use(ErrorHandling)

//Socket.io integrations
const httpServer = createServer(app);
const io = new Server(httpServer);

io.use((socket, next) => {
  const token = socket.handshake.headers['authorization']?.split(' ')[1];

  if (!token) {
    return next(new Error('MISSING_TOKEN'));
  }

  jwt.verify(token, Constants.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('INVALID_TOKEN'));
    }
    next();
  });
});

io.on('connection', (socket)=>{
  console.log("Client Connected 👨‍🦱")

  //join Room (join a chat with a friend)

  //Leave Room (leave a room without the friend)

  socket.on('message', (data: any)=>{
    console.log(`Message:${socket.id} had said ${data}`);
    socket.emit('message',`${socket.id}: ${data}`);
    
  });

  socket.on('disconnect',()=>{
    console.log("user disconnected");
  })
})

httpServer.listen(Constants.PORT, () => {
  Logger.info(`Server listening on port ${Constants.PORT}`)
})
