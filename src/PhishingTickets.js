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
    const [replyText, setReplyText] = useState({}); // Testo della risposta
    const [selectedCommentId, setSelectedCommentId] = useState(null); // ID del commento selezionato per risposte
    const [ticketComments, setTicketComments] = useState({}); // Commenti per ogni ticket
    const navigate = useNavigate();
    const [author, setAuthor] = useState(""); // Autore del commento/risposta

    // Fetch solo ticket di phishing aperti
    useEffect(() => {
        fetch("http://localhost:3001/phishing_tickets")
            .then((res) => res.json())
            .then((data) => {
                setTickets(data);
            })
            .catch(error => console.error('Error fetching phishing tickets:', error));
    }, []);

    // Funzione per inviare un nuovo ticket di phishing
    const handleSubmitTicket = () => {
        if (!domain || !newComment) {
            alert("Inserisci un dominio e un commento.");
            return;
        }
        const newTicket = {
            domain: domain,
            severity: severity,
            status: 'open'  // Imposta lo status su 'open' durante la creazione
        };

        fetch("http://localhost:3001/phishing_tickets", {
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

    // Funzione per aggiungere un commento a un ticket selezionato
    const handleAddComment = () => {
        if (!selectedTicketId || !commentText || !author) {
            alert("Inserisci un commento e il tuo nome.");
            return;
        }

        fetch(`http://localhost:3001/phishing_tickets/${selectedTicketId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment_text: commentText, author: author }),
        })
            .then((res) => res.json())
            .then((newComment) => {
                setTicketComments(prev => ({
                    ...prev,
                    [selectedTicketId]: [...(prev[selectedTicketId] || []), newComment]
                }));
                setCommentText(""); // Pulisci il campo di testo
                setAuthor(""); // Pulisci il nome dell'autore
            })
            .catch(error => console.error('Error adding comment:', error));
    };

    // Funzione per chiudere un ticket
    const handleCloseTicket = (ticketId) => {
        fetch(`http://localhost:3001/phishing_tickets/${ticketId}/close`, {
            method: 'PUT',
        })
            .then((res) => res.json())
            .then(() => {
                setTickets(tickets.map(ticket =>
                    ticket.id === ticketId ? { ...ticket, status: 'closed' } : ticket
                ));
            })
            .catch(error => console.error('Error closing ticket:', error));
    };

    // Funzione per visualizzare i commenti associati a un ticket
    const handleViewComments = (ticketId) => {
        if (!ticketComments[ticketId]) {
            fetch(`http://localhost:3001/phishing_tickets/${ticketId}/comments`)
                .then((res) => res.json())
                .then((comments) => {
                    const commentsWithReplies = comments.map(comment => ({
                        ...comment,
                        replies: comment.replies || []  // Assicurati che replies sia sempre un array
                    }));
                    setTicketComments(prev => ({
                        ...prev,
                        [ticketId]: commentsWithReplies
                    }));
                })
                .catch(error => console.error('Error fetching comments:', error));
        }
    };

    // Funzione per rispondere a un commento
    const handleReply = (commentId) => {
        if (!replyText[commentId] || !author) {
            alert("Inserisci una risposta e il tuo nome.");
            return;
        }

        fetch(`http://localhost:3001/phishing_comments/${commentId}/replies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reply_text: replyText[commentId], author: author }),
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
                setReplyText(prevState => ({ ...prevState, [commentId]: "" })); // Resetta il campo di testo della risposta
                setAuthor(""); // Pulisci il nome dell'autore
            })
            .catch(error => console.error('Error adding reply:', error));
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
                    <th>Dominio</th>
                    <th>Status</th>
                    <th>Severity</th>
                    <th>Azioni</th>
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
                            <button onClick={() => setSelectedTicketId(item.id)}>Commenta</button>
                            <button onClick={() => handleCloseTicket(item.id)}>Chiudi</button>
                            <button onClick={() => handleViewComments(item.id)}>Visualizza Commenti</button>
                            {/* Mostra commenti e risposte se disponibili */}
                            {ticketComments[item.id] && Array.isArray(ticketComments[item.id]) && ticketComments[item.id].map((comment) => (
                                <div key={comment.id}>
                                    <p>{comment.comment_text}</p>
                                    <span> - {comment.author}</span> {/* Mostra l'autore del commento */}
                                    <button onClick={() => setSelectedCommentId(comment.id)}>Rispondi</button>
                                    {/* Mostra le risposte al commento */}
                                    {Array.isArray(comment.replies) && comment.replies.length > 0 ? (
                                        comment.replies.map((reply) => (
                                            <p key={reply.id} className="reply">
                                                {reply.reply_text} - {reply.author}
                                            </p>
                                        ))
                                    ) : (
                                        <p>Nessuna risposta</p>
                                    )}
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
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Inserisci il tuo nome..."
                        style={{ marginBottom: '5px' }}
                    />
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
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Inserisci il tuo nome..."
                        style={{ marginBottom: '5px' }}
                    />
                    <textarea
                        value={replyText[selectedCommentId] || ""}
                        onChange={(e) => setReplyText(prevState => ({ ...prevState, [selectedCommentId]: e.target.value }))}
                        placeholder="Inserisci la risposta..."
                    />
                    <button onClick={() => handleReply(selectedCommentId)}>Invia Risposta</button>
                </div>
            )}
        </div>
    );
};

export default PhishingTickets;
