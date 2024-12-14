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
socket.on('message', (data) => {
    const { name, text, time } = data;

    // Create a new list item for the message
    const newMessage = document.createElement('li');

    // Check if the message is sent by the current user
    if (name === name1.value) {
        newMessage.className = 'post-right'; // Sent message (right side)
    } else if (name === 'Admin') {
        newMessage.className = 'post-admin'; // Admin message
    } else {
        newMessage.className = 'post-left'; // Received message (left side)
    }

    // Add message content based on the sender
    if (name !== 'Admin') {
        newMessage.innerHTML = `<br>
            <span class="message-name">${name}</span>
            <div class="message-content">${text}</div>
            <span class="message-time">${time}</span><br>
        `;
    } else {
        newMessage.innerHTML = `<div class="post-admin">${text}</div><br>`;
    }

    // Append the new message to the chat display
    chat.appendChild(newMessage);
    console.log("chat",chat);
    setTimeout(() => {
        chat.scrollTop = chat.scrollHeight;
        console.log(`srolltop : ${chat.scrollTop} and scrollheight  : ${chat.scrollHeight}`);
    }, 0);
        
});


socket.on('error',(err)=>{
    console.log(err);
})
socket.on('disconnect',()=>{
    console.log("Disconnected");
})
function sendm(){
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
msgInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') { // Check if the pressed key is 'Enter'
        event.preventDefault()
        sendm(); // Call the function you want to execute
    } else {
        socket.emit('activity', name1.value);
    }
});
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
