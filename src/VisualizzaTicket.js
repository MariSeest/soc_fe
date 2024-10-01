import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import './VisualizzaTicket.css';

const VisualizzaTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]); // Stato per ticket filtrati
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [expandedCommentId, setExpandedCommentId] = useState(null); // Gestisce il toggle dei commenti
    const [categoryFilter, setCategoryFilter] = useState(''); // Stato per filtro categoria
    const [severityFilter, setSeverityFilter] = useState(''); // Stato per filtro severity
    const [comments, setComments] = useState({});  // Stato per memorizzare i commenti per ogni ticket
    const [activeReplyId, setActiveReplyId] = useState(null); // Stato per tracciare il commento a cui si sta rispondendo
    const [replyText, setReplyText] = useState({});  // Stato per il testo della risposta
    const navigate = useNavigate();
    const [author, setAuthor] = useState("");  // Stato per l'autore

    useEffect(() => {
        fetch("http://localhost:3001/tickets")
            .then((res) => res.json())
            .then((data) => {
                setTickets(data);
                console.log("Risposta dal server: ", data)
                setFilteredTickets(data); // Imposta lo stato iniziale dei ticket filtrati
            })
            .catch(error => console.error('Error fetching tickets:', error));
    }, []);

    useEffect(() => {
        // Filtra i ticket in base ai filtri selezionati
        const filtered = tickets.filter(ticket => {
            return (
                (categoryFilter === '' || ticket.category === categoryFilter) &&
                (severityFilter === '' || ticket.severity === severityFilter)
            );
        });
        setFilteredTickets(filtered);
        console.log("filtrato: ", filtered)
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

    const handleReplyChange = (commentId, text) => {
        setReplyText(prevState => ({
            ...prevState,
            [commentId]: text
        }));
    };

    const handleCloseTicket = (id) => {
        fetch(`http://localhost:3001/tickets/${id}`, {
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

    const handleSubmitComment = (id) => {
        if (commentText.trim() === "" || author.trim() === "") {
            alert("Please enter both a comment and your name.");
            return;
        }

        fetch(`http://localhost:3001/tickets/${id}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                comment: commentText,
                author: author
            }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(newComment => {
                setComments((prevComments) => {
                    const updatedComments = { ...prevComments };
                    updatedComments[id] = updatedComments[id] || [];
                    updatedComments[id].push(newComment);
                    return updatedComments;
                });

                setCommentText("");  // Pulisci la textarea
                setAuthor("");  // Pulisci il nome dell'autore
                setExpandedCommentId(id);  // Mostra i commenti appena aggiunti
            })
            .catch(error => console.error('Error commenting on ticket:', error));
    };

    const handleDeleteComment = (commentId) => {
        fetch(`http://localhost:3001/comments/${commentId}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Error deleting comment');
                }
                setComments((prevComments) => ({
                    ...prevComments,
                    [expandedCommentId]: prevComments[expandedCommentId].filter(comment => comment.id !== commentId),
                }));
            })
            .catch((error) => console.error('Error deleting comment:', error));
    };

    const handleReplyToComment = (commentId) => {
        setActiveReplyId(activeReplyId === commentId ? null : commentId);  // Toggle la textbox di risposta
    };

    const handleSubmitReply = (commentId) => {
        if (replyText[commentId]?.trim() === "" || author.trim() === "") {
            alert("Please enter both a reply and your name.");
            return;
        }

        fetch(`http://localhost:3001/comments/${commentId}/replies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reply: replyText[commentId],
                author: author
            }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Error replying to comment');
                }
                return res.json();
            })
            .then(() => {
                setComments((prevComments) => {
                    const updatedComments = { ...prevComments };
                    const updatedComment = updatedComments[expandedCommentId].find(comment => comment.id === commentId);
                    if (updatedComment) {
                        updatedComment.replies = updatedComment.replies || [];
                        updatedComment.replies.push({ reply_text: replyText[commentId], author: author });
                    }
                    return updatedComments;
                });

                setReplyText(prevState => ({ ...prevState, [commentId]: "" }));  // Pulisci la textbox dopo l'invio
                setAuthor("");  // Pulisci il nome dell'autore
                setActiveReplyId(null);  // Chiudi la textbox di risposta
            })
            .catch(error => console.error('Error replying to comment:', error));
    };

    const handleCancelComment = () => {
        setActiveCommentId(null);  // Resetta il commento attivo
        setCommentText("");  // Pulisci il campo di testo del commento
        setExpandedCommentId(null);  // Chiudi la sezione commenti
    };

    const handleToggleComments = (id) => {
        if (expandedCommentId === id) {
            setExpandedCommentId(null);  // Nascondi commenti
        } else {
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
                        [id]: data,  // Salva i commenti nel componente associati al ticket
                    }));
                    setExpandedCommentId(id);  // Mostra i commenti
                })
                .catch((error) => console.error("Error fetching comments:", error));
        }
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

            {/* Sezione separata per i filtri */}
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
                            {item.status}
                        </td>
                        <td>{item.category}</td>
                        <td>{item.severity}</td>
                        <td>{item.content}</td>
                        <td>
                            {activeCommentId === item.id ? (
                                <div>
                                    <input
                                        type="text"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder="Enter your name"
                                        style={{ width: '100%', marginBottom: '5px' }}
                                    />
                                    <textarea
                                        style={{ width: '100%', marginBottom: '5px' }}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Enter your comment here"
                                    />
                                    <button onClick={() => handleSubmitComment(item.id)} className="reply-button" style={{ marginBottom: '5px' }}>
                                        Submit
                                    </button>
                                    <button onClick={handleCancelComment} className="reply-button" style={{ marginBottom: '5px' }}>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <button onClick={() => handleDelete(item.id)} className="reply-button" style={{ marginBottom: '5px' }}>Delete</button>
                                    {item.status !== 'closed' && (
                                        <>
                                            <button onClick={() => handleCloseTicket(item.id)} className="reply-button" style={{ marginBottom: '5px' }}>Close</button>
                                            <button onClick={() => setActiveCommentId(item.id)} className="reply-button" style={{ marginBottom: '5px' }}>Comment</button>
                                        </>
                                    )}
                                    <button onClick={() => handleToggleComments(item.id)} className="reply-button" style={{ marginBottom: '5px' }}>
                                        {expandedCommentId === item.id ? 'Nascondi Commenti' : 'Visualizza Commenti'}
                                    </button>
                                </div>
                            )}
                            {/* Mostra i commenti */}
                            {expandedCommentId === item.id && comments[item.id] && comments[item.id].length > 0 ? (
                                <div className="comment-section">
                                    <strong>Comments:</strong>
                                    <ul>
                                        {comments[item.id].map((comment, index) => (
                                            <li key={index} className="comment-container">
                                                <div className="reply-container">
                                                    <span className="comment-text">{comment.comment_text}</span>
                                                    <span className="comment-author"> - {comment.author}</span> {/* Mostra l'autore del commento */}

                                                    {/* Visualizza le risposte per ciascun commento */}
                                                    <div className="replies-section">
                                                        <strong>Replies:</strong>
                                                        <ul>
                                                            {comment.replies && comment.replies.length > 0 ? (
                                                                comment.replies.map((reply, replyIndex) => (
                                                                    <li key={replyIndex} className="reply-container">
                                                                        <span className="reply-text">{reply.reply_text}</span>
                                                                        <span className="reply-author"> - {reply.author}</span>
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <p>No replies yet.</p>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* Contenitore dei pulsanti */}
                                                <div className="buttons-container">
                                                    <button onClick={() => handleDeleteComment(comment.id)} className="reply-button">Delete</button>
                                                    <button onClick={() => handleReplyToComment(comment.id)} className="reply-button">Reply</button>

                                                    {/* Textbox di risposta per ogni commento */}
                                                    {activeReplyId === comment.id && (
                                                        <div style={{ marginTop: '10px' }}>
                                                            <input
                                                                type="text"
                                                                value={author}
                                                                onChange={(e) => setAuthor(e.target.value)}
                                                                placeholder="Enter your name"
                                                                style={{ width: '100%', marginBottom: '5px' }}
                                                            />
                                                            <textarea
                                                                style={{ width: '100%', marginBottom: '5px' }}
                                                                value={replyText[comment.id] || ""}
                                                                onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                                                placeholder="Enter your reply here"
                                                            />
                                                            <button onClick={() => handleSubmitReply(comment.id)} className="reply-button" style={{ marginRight: '5px' }}>
                                                                Submit Reply
                                                            </button>
                                                            <button onClick={() => setActiveReplyId(null)} className="reply-button">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                expandedCommentId === item.id && <p>Nessun commento ancora.</p>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default VisualizzaTicket;
