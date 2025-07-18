import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../app/config";

export function useSockets(){
    const [loading,setLoading ]=useState(true);
    const [socket,setSocket] =useState<WebSocket>();
    
    useEffect(()=>{
        //add token logic to connect to websocket
        //const ws=new WebSocket(`${WEBSOCKET_URL}?token=${localStorage.getItem('token')}`);
        const ws=new WebSocket(`ws://localhost:3002?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZjM5MTMxOC00ZmMwLTRlMzktYmE0ZC01MWZlMjlkYjk4YWUiLCJpYXQiOjE3NTE2NTY4MDJ9.RwH3_Gs6LN3j_lW0D_Mvxo_hhYt5s3xqgBXYISEnQBc`);   
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