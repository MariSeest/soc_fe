import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './PhishingTickets.css'; // Assicurati di avere questo file per lo stile

const PhishingTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [domain, setDomain] = useState(""); // Dominio del sito di phishing
    const [severity, setSeverity] = useState("Low"); // Default severity "Low"
    const [newComment, setNewComment] = useState(""); // Commento per il nuovo ticket
    const [selectedTicketId, setSelectedTicketId] = useState(null); // ID del ticket selezionato per commenti
    const [commentText, setCommentText] = useState(""); // Testo del commento
    const [replyText, setReplyText] = useState(""); // Testo della risposta
    const [selectedCommentId, setSelectedCommentId] = useState(null); // ID del commento selezionato per risposte
    const [ticketComments, setTicketComments] = useState({}); // Commenti per ogni ticket
    const navigate = useNavigate();

    // Fetch solo ticket di phishing aperti
    useEffect(() => {
        fetch("http://localhost:3001/phishing-tickets")
            .then((res) => res.json())
            .then((data) => {
                setTickets(data);
            })
            .catch(error => console.error('Error fetching phishing tickets:', error));
    }, []);

    const handleSubmitTicket = () => {
        if (!domain || !newComment) {
            alert("Inserisci un dominio e un commento.");
            return;
        }

        const newTicket = {
            domain: domain,
            severity: severity,
            status: 'open'
        };

        fetch("http://localhost:3001/phishing-tickets", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTicket),
        })
            .then((res) => res.json())
            .then((ticket) => {
                setTickets([...tickets, ticket]);
                setDomain("");
                setNewComment("");
            })
            .catch(error => console.error('Error creating ticket:', error));
    };

    const handleComment = (ticketId) => {
        setSelectedTicketId(ticketId);
    };

    const handleAddComment = () => {
        if (!selectedTicketId || !commentText) {
            alert("Seleziona un ticket e inserisci un commento.");
            return;
        }

        fetch(`http://localhost:3001/tickets/${selectedTicketId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: commentText }),
        })
            .then((res) => res.json())
            .then((newComment) => {
                setTicketComments(prev => ({
                    ...prev,
                    [selectedTicketId]: [...(prev[selectedTicketId] || []), newComment]
                }));
                setCommentText("");
            })
            .catch(error => console.error('Error adding comment:', error));
    };

    const handleCloseTicket = (ticketId) => {
        fetch(`http://localhost:3001/tickets/${ticketId}/close`, {
            method: 'PUT',
        })
            .then((res) => res.json())
            .then((data) => {
                setTickets(tickets.map(ticket =>
                    ticket.id === ticketId ? { ...ticket, status: 'closed' } : ticket
                ));
            })
            .catch(error => console.error('Error closing ticket:', error));
    };

    const handleReply = (commentId) => {
        if (!replyText) {
            alert("Inserisci una risposta.");
            return;
        }

        fetch(`http://localhost:3001/comments/${commentId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reply: replyText }),
        })
            .then((res) => res.json())
            .then((reply) => {
                setTicketComments(prev => ({
                    ...prev,
                    [selectedTicketId]: prev[selectedTicketId].map(comment =>
                        comment.id === commentId
                            ? { ...comment, replies: [...(comment.replies || []), reply] }
                            : comment
                    )
                }));
                setReplyText("");
            })
            .catch(error => console.error('Error adding reply:', error));
    };

    const handleViewComments = (ticketId) => {
        if (!ticketComments[ticketId]) {
            fetch(`http://localhost:3001/tickets/${ticketId}/comments`)
                .then((res) => res.json())
                .then((comments) => {
                    setTicketComments(prev => ({
                        ...prev,
                        [ticketId]: comments
                    }));
                })
                .catch(error => console.error('Error fetching comments:', error));
        }
    };

    return (
        <div>
            <div className="title-container">
                <h2>Phishing Tickets</h2>
            </div>

            <div className="button-container">
                <button onClick={() => navigate('/PhishingTicketsClosed')}>Vai ai Ticket Chiusi</button>
                <button onClick={() => navigate('/home')}>Torna alla Home</button>
            </div>

            {/* Form per aprire un nuovo ticket */}
            <div className="form-container-new">
                <div className="input-group">
                    <label>Dominio del sito di phishing:</label>
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="Inserisci il dominio..."
                    />

                    <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>

                <div className="textarea-container">
                    <label>Commento:</label>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Inserisci un commento..."
                    />
                </div>

                <button className="submit-ticket" onClick={handleSubmitTicket}>Apri Ticket</button>
            </div>

            {/* Tabella per i ticket aperti */}
            <table className="table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Domain</th>
                    <th>Status</th>
                    <th>Severity</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {tickets.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.domain}</td>
                        <td>{item.status === 'closed' ? 'Chiuso' : 'Aperto'}</td>
                        <td>{item.severity}</td>
                        <td>
                            <button onClick={() => handleComment(item.id)}>Commenta</button>
                            <button onClick={() => handleCloseTicket(item.id)}>Chiudi</button>
                            <button onClick={() => handleViewComments(item.id)}>Visualizza Commenti</button>
                            {/* Mostra commenti e risposte se disponibili */}
                            {ticketComments[item.id] && ticketComments[item.id].map((comment) => (
                                <div key={comment.id}>
                                    <p>{comment.comment_text}</p>
                                    <button onClick={() => setSelectedCommentId(comment.id)}>Rispondi</button>
                                    {comment.replies && comment.replies.map((reply) => (
                                        <p key={reply.id} className="reply">{reply.reply_text}</p>
                                    ))}
                                </div>
                            ))}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Sezione per aggiungere un commento al ticket selezionato */}
            {selectedTicketId && (
                <div className="comment-form">
                    <h3>Aggiungi un commento al ticket {selectedTicketId}</h3>
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Inserisci il commento..."
                    />
                    <button onClick={handleAddComment}>Aggiungi Commento</button>
                </div>
            )}

            {/* Sezione per rispondere a un commento */}
            {selectedCommentId && (
                <div className="reply-form">
                    <h3>Rispondi al commento {selectedCommentId}</h3>
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Inserisci la risposta..."
                    />
                    <button onClick={() => handleReply(selectedCommentId)}>Invia Risposta</button>
                </div>
            )}
        </div>
    );
};

export default PhishingTickets;
