import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import io from 'socket.io-client';

const socket = io('http://localhost:3500');
let activityTimer;

const App = () => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState('');
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const chatDisplayRef = useRef(null);

  useEffect(() => {
    // Socket connection events
    const handleMessage = (data) => {
      console.log('Received message:', data);

      // Prevent duplicate messages by checking if the message already exists
      // const isDuplicate = messages.some(msg => msg.text === data.text && msg.name === data.name);
      const isDuplicate=false
      if (!isDuplicate) {
        setMessages((prevMessages) => [...prevMessages, data]);
        scrollToBottom();
      }
    };

    socket.on('connect', () => {
      console.log('Connected to Server');
    });

    socket.on('message', handleMessage);  // Attach message event listener

    socket.on('activity', (data) => {
      setActivity(data);
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => setActivity(''), 1000);
    });

    socket.on('userList', ({ users }) => {
      setUsers(users);
    });

    socket.on('roomList', ({ rooms }) => {
      setRooms(rooms);
    });

    socket.on('error', (err) => console.log(err));

    socket.on('disconnect', () => {
      console.log('Disconnected');
    });

    // Cleanup function to remove the message event listener when the component unmounts
    return () => {
      socket.off('message', handleMessage);
    };
  }, [messages]);  // Dependency array ensures that this effect runs when `messages` changes

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatDisplayRef.current) {
        chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
      }
    }, 0);
  };

  const sendMessage = () => {
    if (message && room && name) {
      socket.emit('message', { name, text: message });
      setMessage('');
    }
  };

  const joinRoom = () => {
    if (room && name) {
      socket.emit('enterRoom', { name, room });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    } else {
      socket.emit('activity', name);
    }
  };

  return (
    <div className="outer-div">
      {/* Login Form */}
      <form className="login-user" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          id="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          id="room"
          placeholder="Enter Room No."
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button id="but" type="button" onClick={joinRoom}>
          JOIN
        </button>
      </form>

      {/* Chat Display */}
      <div className="chatdd">
  <ul className="chat-display" ref={chatDisplayRef}>
    {messages.map((msg, index) => {
      // Only render the message if name and text are defined
      if (!msg.name || !msg.text) {
        return null; // Skip rendering this message if name or text is undefined
      }

      return (
        <li
          key={index}
          className={
            msg.name === name
              ? 'post-right'
              : msg.name === 'Admin'
              ? 'post-admin'
              : 'post-left'
          }
        >
          {msg.name !== 'Admin' ? (
            <>
              <span className="message-name">{msg.name}</span>
              <div className="message-content">{msg.text}</div>
              <span className="message-time">{msg.time || 'Unknown time'}</span>
            </>
          ) : (
            <div className="post-admin">{msg.text}</div>
          )}
        </li>
      );
    })}
  </ul>
  <p className="activity">{activity}</p>
</div>


      {/* Chat Form */}
      <form className="chat" onSubmit={(e) => e.preventDefault()}>
        <input
          className="txt"
          id="txt"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button id="msg" type="button" onClick={sendMessage}>
          SEND
        </button>
      </form>

      {/* User and Room List */}
      <div>
        <p className="user-list">
          <b>Users in {room}:</b> {users.map((user) => user.name).join(', ')}
        </p>
        <p className="room-list">
          <b>Active Rooms:</b> {rooms.join(', ')}
        </p>
      </div>
    </div>
  );
};

export default App;
