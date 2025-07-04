import { WebSocketServer,WebSocket } from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {prismaClient} from "@repo/db/client"
import {JWT_SECRET} from '@repo/common-backend/config'

const wss = new WebSocketServer({ port: 3002 });

interface User{
  ws: WebSocket,
  rooms:string[],
  userId:string
}
//TEMP global var for state management
const users:User[]=[];



function checkUser(token:string ):string | null{
  try {  
    const decoded=jwt.verify(token,JWT_SECRET);
    if(typeof decoded =="string"){
      return null;

    }
    if(!decoded || !decoded.userId){
      return null;
    }
    return decoded.userId 
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}


wss.on('connection', function connection(ws,request) {
  ws.on('error', console.error);
  const url=request.url;
  if(!url){
    return;
  }
  const queryParams=new URLSearchParams(url.split('?')[1]);
  const token=queryParams.get('token')||" ";

  const userId = checkUser(token);
  if(userId == null){
    ws.close();
    return null;
  }
  users.push({
    userId,
    rooms:[],
    ws
  })



  ws.on('message',async function message(data) {
    const parsedData = JSON.parse(data as unknown as string);
    
    if(parsedData.type === 'joinRoom') {
      const user=users.find(u=> u.ws===ws);
      user?.rooms.push(parsedData.roomId);
    }
    if(parsedData.type === 'leaveRoom') {
      const user=users.find(u=> u.ws===ws);
      if(!user){
        return
      }  
      user.rooms=user?.rooms.filter(x => x === parsedData.room);

    }
    if(parsedData.type === 'sendMessage') {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      //temp sol to store messages in the database
      await prismaClient.chat.create({
        data:{
          roomId,
          message,
          userId
        }
      })
      // Broadcast the message to all users in the room
      users.forEach(user => {
        if(user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: 'chat',
            roomId: roomId,
            message:message
          }));
        }
      });
    }
  });

});