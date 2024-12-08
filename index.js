import express from "express";
import { Server } from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;

const app = express();
const ADMIN = "Admin";
app.use(express.static(__dirname));
const expressServer = app.listen(PORT,()=>{
    console.log(`Listening to port ${PORT}`);
});
const io = new Server(expressServer,{
    cors:{
        origin:process.env.NODE_ENV === 'production' ? false : ["http://localhost:5500","http://192.168.238.62:5500"]
    }
})
const userState = {
    users:[],
    setUsers:function(newUsersArray){
        this.users = newUsersArray
    }
}
io.on('connection',(socket) => {
    // const user = new User();

        socket.emit('message',buildMSg(ADMIN,"Welcome to Chat App"));

        socket.on('enterRoom',({name,room})=>{
            const prevRoom = getUser(socket.id)?.room
            if(prevRoom){
                socket.leave(prevRoom)
                io.to(prevRoom).emit('message',buildMSg(ADMIN,`${name} has left the room`))
            }
            const user = activateUser(socket.id, name, room)

            if(prevRoom){
                io.to(prevRoom).emit('userList',{
                    users :getUsersInRoom(room)})
            }
            socket.join(user.room)
            //To user who joined
            socket.emit('message',buildMSg(ADMIN,`You have joined the ${user.room} Chat Room`))
            //To everyone else
            socket.broadcast.to(user.room).emit('message',buildMSg(ADMIN,`${user.name} have joined the room`))

            //Update userlist in room
            io.to(user.room).emit('userList',{
                users : getUsersInRoom(user.room)
            })
            getUsersInRoom(user.room)
            //Update rooms List for everyone
            io.emit('roomList',{
                rooms : getAllActiveRooms()
            })
        })

        // socket.broadcast.emit('message',`${socket.id} Connected to the room`);
    socket.on('disconnect',() => {
            const user = getUser(socket.id);
            userLeaves(socket.id);
            if(user){
                io.to(user.room).emit('message',buildMSg(ADMIN,`${user.name} has left the room!!!`))
                io.to(user.room).emit('userList',{
                    users:getUsersInRoom(user.room)
                })
                io.emit('roomList',{
                    rooms : getAllActiveRooms()
                })
            }
            console.log(`User ${socket.id} Disonnected!!!`);

        })
    socket.on('message',({name,text}) => {
        const room = getUser(socket.id)?.room;
        if(room){
            io.to(room).emit('message',buildMSg(name,text))
        }
    })
    
    
    socket.on('activity',(name) =>{
        const room =getUser(socket.id)?.room
        if(room){
            socket.broadcast.to(room).emit('activity',`${name} is typing`)
        }
    })
    function buildMSg(name,text) {
        return {
            name,
            text,
            time:new Intl.DateTimeFormat('default',{
                hour:'numeric',
                minute:'numeric'
            }).format(new Date())
        }
    }
    function activateUser(id,name,room) {
        const user ={id, name, room}
        userState.setUsers([
            ...userState.users.filter(user => user.id !== id),
        user
    ])
            return user
    }
    //may occur a error because there is no array inside setUsers()
    function userLeaves(id) {
        userState.setUsers(
            userState.users.filter(user => user.id !== id)

        )
    }
    function getUser(id){
        return userState.users.find(user => user.id === id)
    }
    function getUsersInRoom(room){
        console.log(userState.users.filter(user=> user.room === room))
        return userState.users.filter(user=> user.room === room)
    }
    function getAllActiveRooms() {
        return Array.from(new Set(userState.users.map(user => user.room)))
    }
})


