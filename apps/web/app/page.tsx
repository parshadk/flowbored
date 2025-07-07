"use client"
import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";


export default function Home() {
  const [roomId,setRoomId]=useState("");
  const router=useRouter();
  return (
    <div className={"${styles.container} flex w-screen h-screen items-center justify-center min-h-screen"}>
      <input value={roomId} onChange={(e)=>{
        setRoomId(e.target.value);
        }} type="text" placeholder="Room id"  />
      <button onClick={()=>{
        router.push(`/room/${roomId}`);
      }} >
        Join Room
      </button>
    </div>
  );
}
