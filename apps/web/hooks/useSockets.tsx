import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../app/config";

export function useSockets(){
    const [loading,setLoading ]=useState(true);
    const [socket,setSocket] =useState<WebSocket>();
    
    useEffect(()=>{
        //add token logic to connect to websocket
        //const ws=new WebSocket(`${WEBSOCKET_URL}?token=${localStorage.getItem('token')}`);
        const ws=new WebSocket(`ws://localhost:3002?token=`);   
        ws.onopen=()=>{
            setLoading(false);
            setSocket(ws);
        }
    },[])
    return {
        socket,
        loading
    }
}
