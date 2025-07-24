"use client"
import { useEffect, useRef,useState } from "react";
import { Canvas } from "@/components/Canvas";

export function RoomCanvas({roomId}:{
    roomId:string
}){
    
    const [socket,setSocket]= useState<WebSocket | null >(null);
    const WS_BACKEND = process.env.NEXT_PUBLIC_WS_BACKEND;
    useEffect(()=>{
        // add localStorage token extract
        const ws =new WebSocket(`${WS_BACKEND}`)

        ws.onopen=()=>{
            setSocket(ws)
            ws.send(JSON.stringify({
                type: 'joinRoom',
                roomId: roomId
            }))
        }
    },[])

    
    if(!socket){
        return <div>Loading...</div>
    }
    return (
        <div>
            {/* add dynamic size to canvas */}
            <Canvas roomId={roomId}/>
            
        </div>
    )
}