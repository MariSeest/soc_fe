import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import './VisualizzaTicket.css';

const VisualizzaTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [expandedCommentId, setExpandedCommentId] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [comments, setComments] = useState({});
    const [showSidebar, setShowSidebar] = useState(false);
    const [comment, setComment] = useState("");
    const [author, setAuthor] = useState("");
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3001/tickets")
            .then((res) => res.json())
            .then((data) => {
                setTickets(data);
                setFilteredTickets(data);
            })
            .catch(error => console.error('Error fetching tickets:', error));
    }, []);

    useEffect(() => {
        const filtered = tickets.filter(ticket => {
            return (
                (categoryFilter === '' || ticket.category === categoryFilter) &&
                (severityFilter === '' || ticket.severity === severityFilter)
            );
        });
        setFilteredTickets(filtered);
    }, [categoryFilter, severityFilter, tickets]);

    const handleDelete = (id) => {
        fetch(`http://localhost:3001/tickets/${id}`, {
            method: 'DELETE',
        })
            .then(() => {
                setTickets(tickets.filter(ticket => ticket.id !== id));
            })
            .catch(error => console.error('Error deleting ticket:', error));
    };

    const handleCloseTicket = (id) => {
        fetch(`http://localhost:3001/tickets/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'closed' }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(() => {
                setTickets(tickets.map(ticket =>
                    ticket.id === id ? { ...ticket, status: 'closed' } : ticket
                ));
                navigate('/closedtickets');
            })
            .catch(error => console.error('Error closing ticket:', error));
    };

    const handleViewComments = (id) => {
        fetch(`http://localhost:3001/tickets/${id}/comments`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Error retrieving comments');
                }
                return res.json();
            })
            .then((data) => {
                setComments((prevComments) => ({
                    ...prevComments,
                    [id]: data,
                }));
                setExpandedCommentId(id);
                setShowSidebar(true);
                setComment(""); // Pulisci il campo commento
                setAuthor(""); // Pulisci il campo autore
            })
            .catch((error) => console.error("Error fetching comments:", error));
    };

    const handleCloseSidebar = () => {
        setShowSidebar(false);
        setExpandedCommentId(null);
        setSelectedCommentId(null);
    };

    const handleAddComment = () => {
        if (!comment || !author) {
            alert("Inserisci un commento e il tuo nome.");
            return;
        }

        const ticketId = expandedCommentId;

        fetch(`http://localhost:3001/tickets/${ticketId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment_text: comment, author: author }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Errore durante l\'aggiunta del commento');
                }
                return res.json();
            })
            .then((newComment) => {
                setComments(prev => ({
                    ...prev,
                    [ticketId]: [...(prev[ticketId] || []), newComment]
                }));
                setComment(""); // Pulisci il campo commento
                setAuthor(""); // Pulisci il campo autore
                handleViewComments(ticketId); // Ricarica i commenti
            })
            .catch(error => {
                console.error('Error adding comment:', error);
                alert('Si è verificato un errore durante l\'aggiunta del commento.');
            });
    };

    const handleAddReply = (commentId) => {
        if (!replyText || !author) {
            alert("Inserisci una risposta e il tuo nome.");
            return;
        }

        fetch(`http://localhost:3001/comments/${commentId}/replies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reply_text: replyText, author: author }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Errore durante l\'invio della risposta');
                }
                return res.json();
            })
            .then(newReply => {
                // Assicurati di controllare se newReply contiene l'ID della risposta appena aggiunta
                console.log('New reply added:', newReply);
                setComments(prev => ({
                    ...prev,
                    [expandedCommentId]: prev[expandedCommentId].map(comment =>
                        comment.id === commentId ? { ...comment, replies: [...(comment.replies || []), newReply] } : comment
                    )
                }));
                setReplyText(""); // Pulisci il campo di risposta
                setSelectedCommentId(null); // Resetta l'ID del commento selezionato
            })
            .catch(error => console.error('Error adding reply:', error));
    };


    const handleDeleteComment = (commentId) => {
        fetch(`/comments/${commentId}`, {
            method: 'DELETE',
        })
            .then(() => {
                setComments(prev => ({
                    ...prev,
                    [expandedCommentId]: prev[expandedCommentId].filter(comment => comment.id !== commentId)
                }));
            })
            .catch(error => console.error('Error deleting comment:', error));
    };

    const handleDeleteReply = (replyId) => {
        // Trova il commento a cui la risposta appartiene
        const commentId = comments[expandedCommentId].find(comment => comment.replies?.some(reply => reply.id === replyId)).id;

        fetch(`/comments/${commentId}/replies/${replyId}`, {
            method: 'DELETE',
        })
            .then(() => {
                setComments(prev => ({
                    ...prev,
                    [expandedCommentId]: prev[expandedCommentId].map(comment => ({
                        ...comment,
                        replies: comment.replies.filter(reply => reply.id !== replyId)
                    }))
                }));
            })
            .catch(error => console.error('Error deleting reply:', error));
    };

    return (
        <div>
            <div className="title-container">
                <h2>Tutti i Ticket</h2>
            </div>

            <div className="button-container">
                <button onClick={() => navigate('/home')}>Torna alla Home</button>
                <button onClick={() => navigate('/closedtickets')}>Closed Tickets</button>
            </div>

            <div className="filter-container">
                <div className="filter-cell">
                    <label className="filter-label">Filtra per Categoria:</label>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
                        <option value="">Tutte</option>
                        <option value="DDOS">DDOS</option>
                        <option value="Exfiltration">Exfiltration</option>
                        <option value="Support">Support</option>
                    </select>
                </div>
                <div className="filter-cell">
                    <label className="filter-label">Filtra per Severity:</label>
                    <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="filter-select">
                        <option value="">Tutte</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
            </div>

            <table className="table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Severity</th>
                    <th>Content</th>
                    <th>Orario Apertura</th>
                    <th>Ultimo Commento</th>
                    <th>Orario Chiusura</th>
                    <th>Riapertura</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredTickets.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>
                            <Link to={`/ticket/${item.id}`} style={{ textDecoration: 'none', color: '#00e0ff' }}>
                                {item.name}
                            </Link>
                        </td>
                        <td className={item.status === 'closed' ? 'status-closed' : 'status-open'}>
                            {item.closed_previously ? <span className="ticket-previously-closed">Ticket precedentemente chiuso</span> : null}
                            {item.status}
                        </td>
                        <td>{item.category}</td>
                        <td>{item.severity}</td>
                        <td>{item.content}</td>
                        <td>{new Date(item.created_at).toLocaleString()}</td>
                        <td>{item.last_comment_at ? new Date(item.last_comment_at).toLocaleString() : 'N/A'}</td>
                        <td>{item.closed_at ? new Date(item.closed_at).toLocaleString() : 'N/A'}</td>
                        <td>{item.reopened_at ? new Date(item.reopened_at).toLocaleString() : 'N/A'}</td>
                        <td>
                            <button onClick={() => handleDelete(item.id)} className="reply-button" style={{ marginBottom: '5px' }}>Delete</button>
                            {item.status !== 'closed' && (
                                <>
                                    <button onClick={() => handleCloseTicket(item.id)} className="reply-button" style={{ marginBottom: '5px' }}>Close</button>
                                    <button onClick={() => handleViewComments(item.id)} className="reply-button" style={{ marginBottom: '5px' }}>Visualizza Commenti</button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {showSidebar && (
                <div className="sidebar">
                    <div className="sidebar-content">
                        <h3>Storico dei Commenti</h3>
                        <button className="sidebar-close" onClick={handleCloseSidebar}>Chiudi</button>

                        <div className="comments-container">
                            {comments[expandedCommentId]?.length > 0 ? (
                                comments[expandedCommentId].map((comment) => (
                                    <div key={comment.id} className="comment-container">
                                        <p>{comment.comment_text}</p>
                                        <span className="comment-author">- {comment.author}</span>
                                        <button onClick={() => handleDeleteComment(comment.id)}>Elimina Commento</button>
                                        <button onClick={() => { setSelectedCommentId(comment.id); setReplyText(""); }}>Rispondi</button>
                                        {selectedCommentId === comment.id && (
                                            <div className="reply-form">
                                                <input
                                                    type="text"
                                                    placeholder="Il tuo nome"
                                                    value={author}
                                                    onChange={(e) => setAuthor(e.target.value)}
                                                />
                                                <textarea
                                                    placeholder="Inserisci la risposta..."
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                />
                                                <button onClick={() => handleAddReply(comment.id)}>Invia Risposta</button>
                                            </div>
                                        )}
                                        {/* Visualizzazione delle risposte */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="replies-container">
                                                <h4>Risposte:</h4>
                                                {comment.replies.map(reply => (
                                                    <div key={reply.id} className="reply-container">
                                                        <p>{reply.reply_text}</p>
                                                        <span className="reply-author">- {reply.author}</span>
                                                        <button onClick={() => handleDeleteReply(reply.id)}>Elimina Risposta</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>Nessun commento ancora.</p>
                            )}
                        </div>

                        <div className="comment-form">
                            <input
                                type="text"
                                placeholder="Il tuo nome"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                            />
                            <textarea
                                placeholder="Inserisci il commento..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <button onClick={handleAddComment}>Aggiungi Commento</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisualizzaTicket;
