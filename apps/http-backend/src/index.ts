import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware.";
import {JWT_SECRET} from '@repo/common-backend/config'
import {CreateUserSchema, SigninSchema,CreateRoomSchema} from "@repo/zod-package/types"
const app = express();
import {prismaClient} from '@repo/db/client'

app.post("/signup",async (req,res)=>{
    const parsedData = CreateUserSchema.safeParse(req.body);
    
    if (!parsedData.success) {
        res.status(400).json({ msg:"Invalid creds" });
        return
    }
    try {
        await prismaClient.user.create({
        data:{
            name:parsedData.data.username,
            email:parsedData.data.email,
            password:parsedData.data.password
            
        }
        });
        res.json({
            msg:"User created successfully"
        });
    } catch (err) {
        res.status(411).json({ msg:"email already exists" });
    }
    
    
})

app.post("/signin",(req,res)=>{
    const data = SigninSchema.safeParse(req.body);
    if (!data.success) {
        res.status(400).json({ msg:"Invalid creds" });
        return
    }
    const userId=1;
    const token=jwt.sign({
        userId
    }, JWT_SECRET);
    res.json({
        token
    })
})

app.post("/room",middleware,(req,res)=>{
    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.status(400).json({ msg:"Invalid creds" });
        return
    }
    res.json({
        roomId:"123"
    })
})

app.listen(3001, () => {
    console.log("Server is running on port 3000");  
});