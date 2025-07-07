"use client "
import { useEffect, useState } from "react";
import { useSockets } from "../hooks/useSockets";
export function ChatRoomClient({
    messages,
    id
}:{
    messages:{message:string}[];
    id:string;  
}){
    const [chats,setChats]=useState(messages);
    const {socket,loading} = useSockets();
    const [currMessage,setCurrMessage]=useState("");
    useEffect(()=>{
        if(socket && !loading){
            socket.send(JSON.stringify({
                type:'joinRoom',
                roomId:id
            }))
            socket.onmessage=(event)=>{
                const parsedData =JSON.parse(event.data);
                if(parsedData.type==='sendMessage'){
                    setChats(c=>[...c,{message:parsedData.messages}]);
                }
            }
        }
    },[loading,socket,id]);
    return (
        <div>
            {messages.map(m=>(
                <div>
                    {m.message}
                </div>
            ))}
            <input type="text" placeholder="Type a message" value={currMessage} onChange={(event)=>{setCurrMessage(event.target.value)}}>
            </input>
            <button onClick={()=>{
                socket?.send(JSON.stringify({
                    type:'sendMessage',
                    roomId:id,
                    message:currMessage
                }))
                setCurrMessage("");
            }}>
                Send Message
            </button>
        </div>
    )
}