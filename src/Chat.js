import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './chat.css';

const socket = io('http://localhost:3001');

const Chat = ({ username }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [recipient, setRecipient] = useState('');
    const [error, setError] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [newMessage, setNewMessage] = useState(false);

    // Effettua la registrazione dell'utente appena entra nella chat
    useEffect(() => {
        socket.emit('register', username);

        // Ascolta i messaggi di chat in arrivo
        socket.on('chat message', (msg) => {
            console.log('Received message from server:', msg);
            setMessages((prevMessages) => [...prevMessages, msg]);

            // Mostra notifica se il messaggio non è stato inviato dall'utente attuale
            if (msg.sender !== username) {
                setNewMessage(true);  // Imposta lo stato della notifica
            }
        });

        // Ascolta la lista degli utenti online
        socket.on('onlineUsers', (users) => {
            console.log('Received online users:', users);
            setOnlineUsers(users);
        });

        return () => {
            // Disconnetti quando l'utente esce
            socket.off('chat message');
            socket.off('onlineUsers');
        };
    }, [username]);

    // Recupera i messaggi dal backend all'avvio
    useEffect(() => {
        fetch('http://localhost:3001/messages')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Messages fetched from server:', data);
                setMessages(data);
            })
            .catch(error => {
                console.error('Failed to fetch messages:', error);
                setError(error);
            });
    }, []);

    // Gestione dell'invio di un messaggio
    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim() && recipient.trim()) {
            const message = { text: input, recipient, timestamp: new Date(), sender: username };
            console.log('Sending message:', message);

            // Aggiungi immediatamente il messaggio alla chat
            setMessages((prevMessages) => [...prevMessages, message]);

            // Invia il messaggio al backend e agli altri utenti
            socket.emit('chat message', message);

            setInput(''); // Svuota il campo di input dopo l'invio
            setNewMessage(false);  // Resetta la notifica dopo che l'utente ha inviato un messaggio
        }
    };

    // Funzione per chiudere la notifica quando si clicca sulla chat
    const closeNotification = () => {
        setNewMessage(false);  // Disattiva lo stato della notifica
    };

    return (
        <div className="chat-popup">
            <div className="chat-header" onClick={closeNotification}>
                <h4>Chat {newMessage && <span style={{ color: 'red' }}>New Message!</span>}</h4>
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
                    {onlineUsers.map((user, index) => (
                        <option key={index} value={user}>{user}</option>  // Mostra solo gli utenti online
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
