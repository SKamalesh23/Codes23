import { Server } from "socket.io";
import { createServer } from "http";
const httpServer = createServer();
const io = new Server(httpServer,{
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
httpServer.listen(3500,() => console.log("listrning on port 3500"))
