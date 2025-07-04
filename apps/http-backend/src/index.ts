import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware.";
import {JWT_SECRET} from '@repo/common-backend/config'
import {CreateUserSchema, SigninSchema,CreateRoomSchema} from "@repo/zod-package/types"

import {prismaClient} from '@repo/db/client'

const app = express();
app.use(express.json());

app.post("/signup",async (req,res)=>{
    const parsedData = CreateUserSchema.safeParse(req.body);
    
    if (!parsedData.success) {
        res.status(400).json({ msg:"Invalid creds" });
        return
    }
    try {
        const user = await prismaClient.user.create({
        data:{
            name:parsedData.data.username,
            email:parsedData.data.email,
            password:parsedData.data.password
            //hash password here
        }
        });
        res.json({
            userId:user.id,
            msg:"User created successfully"
        });
    } catch (err) {
        res.status(411).json({ msg:"email already exists" });
    }
    
    
})

app.post("/signin",async (req,res)=>{
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ msg:"Invalid creds" });
        return
    }

    const user= await prismaClient.user.findFirst({
        where:{
            email:parsedData.data.email,
            password:parsedData.data.password //hash password here
        }
    });
    if(!user){
        res.status(401).json({ msg:"Not authorized" });
        return
    }
    const token=jwt.sign({
        userId: user?.id,
    }, JWT_SECRET);
    res.json({
        token
    })
})

app.post("/room",middleware,async (req,res)=>{
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ msg:"Invalid creds" });
        return
    }
    // @ts-ignore
    const userId= req.userId;

    try {
        const room= await prismaClient.room.create({
        data:{
            slug:parsedData.data.name,
            adminId:userId
        }
    })

    res.json({
        roomId: room.id,
        msg:"Room created successfully"
    })
    } catch (err) {
        res.status(411).json({ msg:"Room already exists with this name" });
    }

})
app.get("/chat/:roomId",async (req,res)=>{
    const roomId=req.params.roomId;
    if(!roomId){
        res.status(400).json({ msg:"Room ID is required" });
        return
    }
    const messages= await prismaClient.chat.findMany({
        where:{
            
            roomId:parseInt(roomId)
        },
        orderBy:{
            id:'desc'
        },
        take:50
    })
    res.json({
        messages
    })
})

app.listen(3001, () => {
    console.log("Server is running on port 3001");  
});