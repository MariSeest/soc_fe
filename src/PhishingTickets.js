import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './PhishingTickets.css'; // Assicurati di avere questo file per lo stile

const PhishingTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [domain, setDomain] = useState(""); // Dominio del sito di phishing
    const [severity, setSeverity] = useState("Low"); // Default severity "Low"
    const [newComment, setNewComment] = useState(""); // Commento per il nuovo ticket
    const [commentText, setCommentText] = useState({}); // Commento per ciascun ticket nella tabella
    const [replyText, setReplyText] = useState({}); // Testo della risposta
    const [selectedTicketId, setSelectedTicketId] = useState(null); // ID del ticket selezionato per commenti
    const [selectedCommentId, setSelectedCommentId] = useState(null); // ID del commento selezionato per risposte
    const [ticketComments, setTicketComments] = useState({}); // Commenti per ogni ticket
    const [showSidebar, setShowSidebar] = useState(false); // Stato per mostrare la barra laterale
    const [isReplying, setIsReplying] = useState(false); // Stato per identificare se si sta rispondendo
    const navigate = useNavigate();
    const [author, setAuthor] = useState(""); // Autore del commento/risposta

    // Fetch solo ticket di phishing aperti
    useEffect(() => {
        fetch("http://localhost:3001/phishing_tickets")
            .then((res) => res.json())
            .then((data) => {
                setTickets(data.filter(ticket => ticket.status !== 'closed')); // Mostra solo ticket aperti
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

    // Funzione per aggiungere un commento al ticket selezionato
    const handleAddComment = () => {
        if (!selectedTicketId || !commentText[selectedTicketId] || !author) {
            alert("Inserisci un commento e il tuo nome.");
            return;
        }

        fetch(`http://localhost:3001/phishing_tickets/${selectedTicketId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment_text: commentText[selectedTicketId], author: author }),
        })
            .then((res) => res.json())
            .then((newComment) => {
                setTicketComments(prev => ({
                    ...prev,
                    [selectedTicketId]: [...(prev[selectedTicketId] || []), newComment]
                }));
                setCommentText(prevState => ({ ...prevState, [selectedTicketId]: "" })); // Pulisci il campo di testo
                setAuthor(""); // Pulisci il nome dell'autore
                handleViewComments(selectedTicketId);
            })
            .catch(error => console.error('Error adding comment:', error));
    };

    // Funzione per chiudere un ticket e trasferirlo in 'PhishingTicketsClosed'
    const handleCloseTicket = (ticketId) => {
        fetch(`http://localhost:3001/phishing_tickets/${ticketId}/close`, {
            method: 'PUT',
        })
            .then((res) => res.json())
            .then(() => {
                setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId)); // Rimuove il ticket dalla lista corrente
                navigate('/PhishingTicketsClosed'); // Redireziona alla pagina dei ticket chiusi
            })
            .catch(error => console.error('Error closing ticket:', error));
    };

    // Funzione per visualizzare i commenti associati a un ticket
    const handleViewComments = (ticketId) => {
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
                toggleSidebar(ticketId, false);
            })
            .catch(error => console.error('Error fetching comments:', error));
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
                setReplyText(prevState => ({ ...prevState, [commentId]: "" }));
                handleViewComments(selectedTicketId); // Aggiorna i commenti e mantieni aperta la barra laterale
            })
            .catch(error => console.error('Error adding reply:', error));
    };

    // Funzione per mostrare la barra laterale
    const toggleSidebar = (ticketId, isReply = false) => {
        setSelectedTicketId(ticketId);
        setIsReplying(isReply);
        setShowSidebar(true);
    };

    // Funzione per rispondere ai commenti nella barra laterale
    const handleReplyClick = (commentId) => {
        setSelectedCommentId(commentId);
        setIsReplying(true);
        setShowSidebar(true);
    };

    // Funzione per chiudere la barra laterale
    const handleCloseSidebar = () => {
        setShowSidebar(false);
        setIsReplying(false);
        setSelectedTicketId(null);
    };

    return (
        <div className="main-container">
            <div className="title-container">
                <h2>Phishing Tickets</h2>
            </div>

            <div className="button-container">
                <button className="small-button" onClick={() => navigate('/PhishingTicketsClosed')}>Vai ai Ticket Chiusi</button>
                <button className="small-button" onClick={() => navigate('/home')}>Torna alla Home</button>
            </div>

            {/* Contenitore separato per aprire un nuovo ticket */}
            <div className="new-ticket-container">
                <h3>Apri un nuovo ticket</h3>
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
            </div>

            {/* Tabella per i ticket aperti */}
            <table className="table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Dominio</th>
                    <th>Status</th>
                    <th>Commento</th>
                    <th>Azioni</th>
                </tr>
                </thead>
                <tbody>
                {tickets.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.domain}</td>
                        <td>{item.status === 'closed' ? 'Chiuso' : 'Aperto'}</td>
                        <td>
                            <textarea
                                value={commentText[item.id] || ""}
                                onChange={(e) => setCommentText(prevState => ({...prevState, [item.id]: e.target.value}))}
                                placeholder="Inserisci il commento..."
                                className="comment-textarea"
                            />
                        </td>
                        <td>
                            <div className="table-actions">
                                <button onClick={() => toggleSidebar(item.id)}>Commenta</button>
                                <button onClick={() => handleCloseTicket(item.id)}>Chiudi</button>
                                <button onClick={() => handleViewComments(item.id)}>Visualizza Commenti</button>
                            </div>
                            {/* Aggiungi la nota per i ticket riaperti */}
                            {item.closed_previously && (
                                <p style={{color: 'red', fontStyle: 'italic'}}>
                                    Ticket precedentemente chiuso
                                </p>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Barra laterale per commenti e risposte */}
            {showSidebar && (
                <div className="sidebar">
                    <div className="sidebar-content">
                        <h3>{isReplying ? 'Rispondi al commento' : 'Storico dei commenti'}</h3>

                        {/* Sezione per mostrare i commenti */}
                        {!isReplying && ticketComments[selectedTicketId] && (
                            <div>
                                {/* Verifica se ci sono commenti */}
                                {ticketComments[selectedTicketId].length > 0 ? (
                                    ticketComments[selectedTicketId].map(comment => (
                                        <div key={comment.id} className="comment-container">
                                            <p>{comment.comment_text}</p>
                                            <span className="comment-author">- {comment.author}</span>
                                            {comment.replies && comment.replies.length > 0 && (
                                                <ul className="reply-list">
                                                    {comment.replies.map(reply => (
                                                        <li key={reply.id} className="reply-container">
                                                            <p>{reply.reply_text}</p>
                                                            <span className="comment-author">- {reply.author}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            <button onClick={() => handleReplyClick(comment.id)} className="reply-button">
                                                Rispondi
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>Nessun commento disponibile.</p>
                                )}
                            </div>
                        )}

                        {/* Sezione per aggiungere un commento o rispondere */}
                        <div className="comment-form">
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="Inserisci il tuo nome..."
                                className="input-author"
                            />
                            <textarea
                                value={isReplying ? replyText[selectedCommentId] : commentText[selectedTicketId]}
                                onChange={(e) => isReplying
                                    ? setReplyText({ ...replyText, [selectedCommentId]: e.target.value })
                                    : setCommentText({ ...commentText, [selectedTicketId]: e.target.value })}
                                placeholder={isReplying ? "Inserisci la risposta..." : "Inserisci il commento..."}
                                className="sidebar-textarea"
                            />
                            <button onClick={isReplying ? () => handleReply(selectedCommentId) : handleAddComment}>
                                {isReplying ? 'Invia Risposta' : 'Aggiungi Commento'}
                            </button>
                        </div>
                        <button onClick={handleCloseSidebar}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhishingTickets;
