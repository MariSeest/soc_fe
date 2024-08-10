import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './chat.css'

const socket = io('http://localhost:3001');

const Chat = ({ username }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [recipient, setRecipient] = useState('');
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket.emit('register', username);

        socket.on('chat message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('chat message');
        };
    }, [username]);

    useEffect(() => {
        fetch('http://localhost:3001/messages')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => setMessages(data))
            .catch(error => {
                console.error('Failed to fetch messages:', error);
                setError(error);
            });

        fetch('http://localhost:3001/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Failed to fetch users:', error));
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim() && recipient.trim()) {
            const message = { text: input, recipient, timestamp: new Date(), sender: username };

            fetch('http://localhost:3001/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    setInput('');
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                    setError(error);
                });
        }
    };

    return (
        <div className="chat-popup">
            <div className="chat-header">
                <h4>Chat</h4>
                <button onClick={() => document.querySelector('.chat-popup').style.display = 'none'}>Close</button>
            </div>
            <div className="chat-body">
                {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
                {messages.map((msg, index) => (
                    <p key={index}><strong>{msg.sender}:</strong> {msg.text} - <small>{new Date(msg.timestamp).toLocaleTimeString()}</small></p>
                ))}
            </div>
            <form onSubmit={handleSend}>
                <select onChange={(e) => setRecipient(e.target.value)} value={recipient}>
                    <option value="">Select recipient</option>
                    {users.map((user, index) => (
                        <option key={index} value={user}>{user}</option>
                    ))}
                </select>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;
