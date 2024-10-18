import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './PhishingTickets.css'; // Usa lo stesso file CSS

const ClosedTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [ticketComments, setTicketComments] = useState({});
    const [showComments, setShowComments] = useState(false); // Per visualizzare i commenti
    const [currentTicketId, setCurrentTicketId] = useState(null); // Salva l'ID del ticket corrente

    useEffect(() => {
        // Recupera i ticket chiusi
        fetch("http://localhost:3001/tickets")
            .then((res) => res.json())
            .then((data) => {
                const closedTickets = data.filter(ticket => ticket.status === "closed" && ticket.category !== 'phishing');
                setTickets(closedTickets);
            })
            .catch(error => console.error('Error fetching closed tickets:', error));
    }, []);

    const navigate = useNavigate();

    // Funzione per riaprire un ticket
    const handleReopenTicket = (ticketId) => {
        fetch(`http://localhost:3001/tickets/${ticketId}/reopen`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(() => {
                setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));
                alert('Ticket riaperto con successo');
                navigate('/VisualizzaTicket'); // Redireziona alla pagina dei ticket aperti
            })
            .catch(error => console.error('Error reopening ticket:', error));
    };

    // Funzione per ottenere i commenti di un ticket
    const handleViewComments = (ticketId) => {
        fetch(`http://localhost:3001/tickets/${ticketId}/comments`)
            .then((res) => res.json())
            .then((comments) => {
                console.log('Comments fetched:', comments); // Debug
                setTicketComments(prev => ({
                    ...prev,
                    [ticketId]: comments
                }));
                setCurrentTicketId(ticketId); // Imposta il ticket corrente per mostrare i commenti
                setShowComments(true);
            })
            .catch(error => console.error('Error fetching comments:', error));
    };

    const handleGoBack = () => {
        navigate('/home');
    };
    const handleGoBackList=() => {
        navigate('/VisualizzaTicket')
    };


    return (
        <div className="main-container">
            <div className="title-container">
                <h2>Tickets Chiusi</h2>
            </div>

            <div className="button-container">
                <button className="small-button futuristic-button" onClick={handleGoBack}>Torna alla Home</button>
                <button className="small-button futuristic-button" onClick={handleGoBackList}>Torna alla lista</button>
            </div>

            <table className="table">
                <thead>
                <tr>
                <th>ID</th>
                    <th>Nome</th>
                    <th>Status</th>
                    <th>Categoria</th>
                    <th>Contenuto</th>
                    <th>Azioni</th>
                </tr>
                </thead>
                <tbody>
                {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                        <td>{ticket.id}</td>
                        <td>{ticket.name}</td>
                        <td>{ticket.status}</td>
                        <td>{ticket.category}</td>
                        <td>{ticket.content}</td>
                        <td>
                            <div className="table-actions">
                                <button className="futuristic-button" onClick={() => handleReopenTicket(ticket.id)}>Riapri il ticket</button>
                                <button className="futuristic-button" onClick={() => handleViewComments(ticket.id)}>Visualizza i commenti</button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Sezione per visualizzare i commenti */}
            {showComments && (
                <div className="sidebar">
                    <div className="sidebar-content">
                        <h3>Commenti per il Ticket ID: {currentTicketId}</h3>
                        <button className="futuristic-button" onClick={() => setShowComments(false)}>Chiudi</button>
                        {ticketComments[currentTicketId]?.length > 0 ? (
                            ticketComments[currentTicketId].map((comment, index) => (
                                <div key={index} className="comment-container">
                                    <p>{comment.comment_text}</p> {/* Usa comment_text anziché text */}
                                    <span className="comment-author">- {comment.author}</span>
                                </div>
                            ))
                        ) : (
                            <p>Nessun commento disponibile.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClosedTickets;
