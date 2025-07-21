"use client"
import { useEffect, useRef } from "react";
import { drawRect } from "@/drawFiles/index";

export default function Canvas(){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(()=>{
        if (canvasRef.current){
            const canvas=canvasRef.current;
            

            drawRect(canvasRef.current)
              
        }
    },[canvasRef])
    return (
        <div>
            {/* add dynamic size to canvas */}
            <canvas width={1080} height={1000} ref={canvasRef}>

            </canvas>
        </div>
    )
}