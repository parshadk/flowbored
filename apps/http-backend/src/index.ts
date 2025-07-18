import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import {JWT_SECRET} from '@repo/common-backend/config'
import {CreateUserSchema, SigninSchema,CreateRoomSchema} from "@repo/zod-package/types"
import bcrypt from "bcrypt";
import {prismaClient} from '@repo/db/client'
import dotenv from "dotenv";
import { sendMail, sendForgotMail } from './sendMail'
const app = express();

app.use(express.json());
dotenv.config();

interface JwtPayload {
  user?: {
    username: string;
    email: string;
    password: string;
  };
  otp?: number;
  email?: string;
  _id?: string;
}

app.post("/signup",async (req,res)=>{
    const parsedData = CreateUserSchema.safeParse(req.body);
    
    if (!parsedData.success) {
        res.status(400).json({ msg:"Invalid creds" });
        return
    }
    try {
        const existingUser = await prismaClient.user.findFirst({
            where:{
                email:parsedData.data.email
            }
        });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return 
        }
        const hashPassword = await bcrypt.hash(parsedData.data.password, 10);
        const otp = Math.floor(Math.random() * 1000000);
        if(!process.env.Activation_secret){
            res.status(500).json({ msg:"Activation secret not set" });
            return
        }
        const activationToken=jwt.sign({
            user:{
                username: parsedData.data.username,
                email: parsedData.data.email,
                password: hashPassword
            },
            otp: otp
        }, process.env.Activation_secret, { expiresIn: '10m' }
        )
        await sendMail(parsedData.data.email, "Flowboard", { name:parsedData.data.username, otp });

        res.status(200).json({
            message: "OTP sent to your email",
            activationToken,
        });
        return

        // const user = await prismaClient.user.create({
        // data:{
        //     name:parsedData.data.username,
        //     email:parsedData.data.email,
        //     password:hashPassword
        // }
        // });
        // res.json({
        //     userId:user.id,
        //     msg:"User created successfully"
        // });
    } catch (err) {
        res.status(411).json({ msg:"Invalid Creds" });
    }
})
app.post("/verify",async(req,res)=>{
    const {otp, activationToken} = req.body;
    if(!process.env.Activation_secret){
            res.status(500).json({ msg:"Activation secret not set" });
            return
    }
    const verify = jwt.verify(activationToken, process.env.Activation_secret) as JwtPayload;
   
    if (!verify || verify.otp != Number(otp)) {
        res.status(400).json({ msg: "Invalid OTP or token expired" });
        return;
    }
    if (!verify.user) {
        res.status(400).json({ msg: "Invalid token data" });
        return;
    }
    const user = await prismaClient.user.create({
    data:{
        name:verify.user.username,
        email: verify.user.email,   
        password: verify.user.password 
    }
    });
    res.json({
        userId:user.id,
        msg:"User created successfully"
    });
})



app.post("/signin",async (req,res)=>{
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ msg:"Invalid creds" });
        return
    }

    const user= await prismaClient.user.findFirst({
        where:{
            email:parsedData.data.email
        }
    });
    if(!user){
        res.status(401).json({ msg:"Sign up first" });
        return
    }
    const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);
    if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid email or password" });
        return 
    }
    const token=jwt.sign({
        userId: user?.id,
    }, JWT_SECRET);
    res.json({
        message: `Welcome back ${user.name}`,
        token,
        user 
    });
    return 
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

app.get("/room/:slug",async (req,res)=>{
    const slug=req.params.slug;
    if(!slug){
        res.status(400).json({ msg:"Room slug is required" });
        return
    }
    const room= await prismaClient.room.findFirst({
        where:{
            slug:slug
        }
    })
    if(!room){
        res.status(404).json({ msg:"Room not found" });
        return
    }
    res.json({
        roomId: room.id,
        slug: room.slug,
        adminId: room.adminId
    })
})

app.get("/",(req,res)=>{
    res.json({
        msg:"Welcome to Flowboard API"
    })
})

app.listen(3000, () => {
    console.log("Server is running on port ");  
});



