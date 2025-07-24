import axios from 'axios'



type Shape = {
    type:"rectangle";
    x:number;
    y:number;
    width:number;
    height:number;
} | {
    type:"circle";
    centerX:number;
    centerY:number;
    radius:number;
} | {
    type:"diamond";
    //add later
} | {
    type:"line";
    startX:number;
    startY:number;
    length:number;
} | {
    type:"arrow";
    startX:number;
    startY:number;
    length:number;
}




export async function drawRect(canvas: HTMLCanvasElement,roomId:string,socket:WebSocket) {
    const ctx = canvas.getContext("2d");
    let existingShapes:Shape[] =await getExistingShapes(roomId);
    if(!ctx){
        return 
    } 

    socket.onmessage=(event)=>{
        const message=JSON.parse(event.data);
        if(message.type=="chat"){
            const parsedShape=JSON.parse(message.message)
            existingShapes.push(parsedShape)
            clearCanvas(existingShapes,canvas,ctx)
        }
    }
    clearCanvas(existingShapes,canvas,ctx)
    let startX=0
    let startY=0
    let clicked=false


    canvas.addEventListener("mousedown",(e)=>{
        clicked=true
        startX=e.clientX
        startY=e.clientY
    })
    canvas.addEventListener("mouseup",(e)=>{
        clicked=false
        const width= e.clientX-startX;
        const height =e.clientY-startY;
        const shape:Shape = {
            type:"rectangle",
            x:startX,
            y:startY,
            width:width,
            height:height
        };
        existingShapes.push(shape)
        socket.send(JSON.stringify({
            type:"chat",
            message:JSON.stringify({
            shape:shape,
            })
        }))
    
    })
    canvas.addEventListener("mousemove",(e)=>{
        if(clicked){
            const width = e.clientX-startX
            const height=e.clientY-startY
            clearCanvas(existingShapes,canvas,ctx)
            ctx.strokeStyle = "rgba(255, 255, 255)";
            ctx.strokeRect(startX, startY, width, height);
            
        }
    })
}

function clearCanvas(existingShapes:Shape[],canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D){
    
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.map((shape)=>{
        if (shape.type==="rectangle"){
            
            ctx.strokeStyle = "rgba(255, 255, 255)";
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    })
}


async function getExistingShapes(roomId:string){
    const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND
    if(!HTTP_BACKEND){
        throw new Error("HTTP_BACKEND is not defined")
    }
    const res=await axios.get(`${HTTP_BACKEND}/chat/${roomId}`);
    const messages=res.data.messages;

    const shapes= messages.map((x:{messages:string})=>{
        const  messageData=JSON.parse(x.messages);
        return messageData.shapes;
    })
    return shapes

}