import express from "express";
import { Server } from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3500;
const app = express();
app.use(express.static(__dirname));
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
        socket.emit('message',`Welcome to Chat app`);
        socket.broadcast.emit('message',`${socket.id} Connected to the room`);
    socket.on('message',(data) => {
        console.log(`Message received is ${data.toString()}`);
        io.emit('message',`${socket.id.substring(0,4)} : ${data}`);
    })
    
    socket.on('disconnect',() => {
        console.log("disconnected");
    })
    socket.on('activity',(data) =>{
        socket.broadcast.emit('activity',`${data} is typing`);
    })
})


