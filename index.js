import express from "express";
import { Server } from "socket.io";
// import path from "path";
const PORT = process.env.PORT || 3500;
const app = express();
const expressServer = app.listen(PORT,()=>{
    console.log(`Listening to port ${PORT}`);
});
const io = new Server(expressServer,{
    cors:{
        origin:process.env.NODE_ENV === 'production' ? false : ["http://localhost:5500","http://192.168.238.62:5500"]
    }
})
io.on('connection',(socket) => {
    console.log(`User ${socket.id} Connected`);
    // const user = new User();
    socket.on('message',(data) => {
        console.log(`Message received is ${data.toString()}`);
        io.emit('message',`${data.userId} : ${data.text}`);
    })
    
    socket.on('disconnect',() => {
        console.log("disconnected");
    })
})

