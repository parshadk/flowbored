"use client";
import { useEffect, useRef } from "react";

import { drawRect } from "@/drawFiles/index";
export function Canvas({roomId}:{
    roomId:string
}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(()=>{
        if (canvasRef.current){
            const canvas=canvasRef.current;
            

            drawRect(canvasRef.current,roomId,socket)
                
        }
    },[canvasRef])
    return (
        <canvas width={1080} height={1000} ref={canvasRef}>

        </canvas>
    )
}