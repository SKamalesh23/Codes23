const socket =  io('http://localhost:3500');
const activity = document.querySelector('.activity');
const msgInput = document.querySelector('.txt');
const name1 = document.querySelector('#name');
const room = document.querySelector('#room');
const roomList = document.querySelector('.room-list');
const userList = document.querySelector('.user-list');
const chat = document.querySelector('.chat-display');
socket.on('connect',() => { 
    console.log("Connected to Server");
});
socket.on('message',(data) => {
    // activity.textContent="";
    const {name,text,time}=data
    const newms = document.createElement('li');
    newms.className='post'
    if(name===name.value)newms.className='post post-left'
    if(name!==name.value && name!=='Admin')newms.className='post post-left'
    if(name!=='Admin'){
        newms.innerHTML=`<div class="post__header
         ${name===name1.value? 'post__header--user':'post__header--reply'}">
         <span>${name}</span>
         <span>${time}</span></div>
         <div>${text}</div>`
    }
    else{
        newms.innerHTML =`<div>${text}</div>`
    }
    document.querySelector('.chat-display').appendChild(newms);
    // chat.scrollTop=chat.scrollHeight;
});

socket.on('error',(err)=>{
    console.log(err);
})
socket.on('disconnect',()=>{
    console.log("Disconnected");
})
function sendm(){
    // e.preventDefault();
     var x = document.getElementById("txt");
     if(x.value && room.value && name1.value)
     {
        socket.emit('message',{name:name1.value,text:x.value});
        x.value="";
        x.focus();
     }
    
}
function chatRoom() {
    if(room.value && name1.value){
        socket.emit("enterRoom",{
            name:name1.value,
            room:room.value,
        })
    }
}
function showUsers(users) {
    // const { room, users } = userData;
    console.log("In function");
    console.log("Room:", users[0].room);

    // Clear the existing user list
    // userList.textContent = "";
    
    // Add the room title
    userList.innerHTML = `<b>Users in ${users[0].room}:</b> `;
    
    // Check if there are users
    if (users && users.length > 0) {
        const userNames = users.map(user => user.name).join(", ");
        userList.innerHTML += userNames;
    } else {
        userList.innerHTML += "No users found.";
    }
}

function showRooms(rooms) {
    roomList.textContent=""
    if(rooms){
        roomList.innerHTML=`<b>Active Rooms :</b>`
        rooms.forEach((room,i) => {
            roomList.textContent+=` ${room}`
            if(rooms.length > 1 && 1 !== rooms.length-1){
                roomList.textContent+=` ,`
            }
        });
    }
}
document.querySelector('#msg').addEventListener('click',sendm);
document.querySelector('#but').addEventListener('click',chatRoom);
msgInput.addEventListener('keypress',()=>{
    socket.emit('activity',name1.value) ;
 })
let activityTimer;
socket.on('activity',(data) => {
    activity.textContent=data;
    clearTimeout(activityTimer);
    activityTimer = setTimeout(()=>{
        activity.textContent="";
    },1000)
})
socket.on('userList',({users})=>{
    console.log("on userlist")
    console.log(users)
    showUsers(users);
})
socket.on('roomList',({rooms})=>{
    console.log(rooms)
    showRooms(rooms);
})
//for showing the list of users in the room
