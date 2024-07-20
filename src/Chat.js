import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        socket.on('chat message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('chat message');
        };
    }, []);

    useEffect(() => {
        // Recupera i messaggi dal server quando il componente viene montato
        fetch('http://localhost:3001/messages')
            .then(res => res.json())
            .then(data => setMessages(data));
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim()) {
            const message = { text: input, timestamp: new Date() };

            fetch('http://localhost:3001/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            })
                .then(res => res.json())
                .then(data => {
                    setInput('');
                })
                .catch(error => console.error('Error sending message:', error));
        }
    };

    return (
        <div className="chat-popup">
            <div className="chat-header">
                <h4>Chat</h4>
                <button onClick={() => document.querySelector('.chat-popup').style.display = 'none'}>Close</button>
            </div>
            <div className="chat-body">
                {messages.map((msg, index) => (
                    <p key={index}>{msg.text} - <small>{new Date(msg.timestamp).toLocaleTimeString()}</small></p>
                ))}
            </div>
            <form onSubmit={handleSend}>
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

