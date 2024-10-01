import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './VisualizzaTicket.css';

const PhishingTicketsClosed = () => {
    const [closedTickets, setClosedTickets] = useState([]);
    const [ticketComments, setTicketComments] = useState({});
    const [selectedTicket, setSelectedTicket] = useState(null); // Ticket selezionato per la visualizzazione dei commenti
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Stato per aprire/chiudere la finestra laterale
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3001/phishing_tickets?status=closed")
            .then((res) => res.json())
            .then((data) => {
                setClosedTickets(data);
            })
            .catch(error => console.error('Error fetching closed tickets:', error));
    }, []);

    // Funzione per ottenere i commenti di un ticket specifico e aprire la finestra laterale
    const handleViewComments = (ticketId) => {
        fetch(`http://localhost:3001/phishing_tickets/${ticketId}/comments`)
            .then((res) => res.json())
            .then((comments) => {
                setTicketComments(prev => ({
                    ...prev,
                    [ticketId]: comments
                }));
                setSelectedTicket(ticketId); // Imposta il ticket selezionato
                setIsSidebarOpen(true); // Apri la finestra laterale
            })
            .catch(error => console.error('Error fetching comments:', error));
    };

// Funzione per riaprire un ticket e ritrasferirlo nei ticket aperti
    const handleReopenTicket = (ticketId) => {
        fetch(`http://localhost:3001/phishing_tickets/${ticketId}/reopen`, {
            method: 'PUT',
        })
            .then(() => {
                // Rimuovi il ticket dalla lista dei ticket chiusi
                setClosedTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));

                // Aggiungi il ticket riaperto alla lista dei ticket aperti
                fetch(`http://localhost:3001/phishing_tickets/${ticketId}`)
                    .then((res) => res.json())
                    .then((reopenedTicket) => {
                        // Aggiunge il ticket riaperto alla lista dei ticket aperti
                        setTickets(prevTickets => [...prevTickets, reopenedTicket]);
                    });
            })
            .catch(error => console.error('Error reopening ticket:', error));
    };


    // Funzione per chiudere la finestra laterale
    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedTicket(null);
    };

    return (
        <div>
            <div className="title-container">
                <h2>Phishing Tickets Chiusi</h2>
            </div>
            <button onClick={() => navigate('/PhishingTickets')}>Torna ai Ticket Aperti</button>

            <table className="table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Dominio</th>
                    <th>Status</th>
                    <th>Severity</th>
                    <th>Aperto Il</th>
                    <th>Ultimo Cambiamento Stato</th>
                    <th>Azioni</th>
                </tr>
                </thead>
                <tbody>
                {closedTickets.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.domain}</td>
                        <td>{item.status}</td>
                        <td>{item.severity}</td>
                        <td>{new Date(item.opened_at).toLocaleDateString()}</td> {/* Data apertura */}
                        <td>{new Date(item.last_status_change_at).toLocaleDateString()}</td> {/* Ultima modifica status */}
                        <td>
                            <button onClick={() => handleViewComments(item.id)}>Visualizza Commenti</button>
                            <button onClick={() => handleReopenTicket(item.id)}>Riapri Ticket</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Finestra laterale per visualizzare i commenti */}
            {isSidebarOpen && selectedTicket && (
                <div className="sidebar">
                    <div className="sidebar-content">
                        <h3>Commenti per il Ticket ID: {selectedTicket}</h3>
                        <button className="sidebar-close" onClick={closeSidebar}>Chiudi</button>

                        <div className="comments-container"> {/* Aggiunto contenitore scorrevole */}
                            {ticketComments[selectedTicket]?.length > 0 ? (
                                ticketComments[selectedTicket].map(comment => (
                                    <div className="comment-container" key={comment.id}>
                                        <p><strong>{comment.author}:</strong> {comment.comment_text}</p>
                                        <p><em>Risposto il: {new Date(comment.replied_at).toLocaleDateString()}</em></p> {/* Data della risposta */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="replies-container">
                                                {comment.replies.map(reply => (
                                                    <div className="reply-container" key={reply.id}>
                                                        <p><strong>{reply.author}:</strong> {reply.reply_text}</p>
                                                        <p><em>Risposta il: {new Date(reply.replied_at).toLocaleDateString()}</em></p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>Nessun commento trovato per questo ticket.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhishingTicketsClosed;
