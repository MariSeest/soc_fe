import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './PhishingTickets.css'; // Usa il CSS corretto

const PhishingTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [activeCommentId, setActiveCommentId] = useState(null); // Per sapere quale ticket è in commento
    const [commentText, setCommentText] = useState(""); // Testo del commento
    const [expandedCommentId, setExpandedCommentId] = useState(null); // Per sapere quale commento è espanso
    const [comments, setComments] = useState({}); // Stato per memorizzare i commenti per ogni ticket
    const [activeReplyId, setActiveReplyId] = useState(null); // Stato per tracciare il commento a cui si sta rispondendo
    const [replyText, setReplyText] = useState({}); // Stato per il testo della risposta
    const [domain, setDomain] = useState(""); // Dominio del sito di phishing
    const [severity, setSeverity] = useState("Low"); // Default severity "Low"
    const [newComment, setNewComment] = useState(""); // Commento per il nuovo ticket
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
        fetch(`http://localhost:3001/tickets/phishing/${id}/close`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then(() => {
                setTickets(tickets.map(ticket => ticket.id === id ? { ...ticket, status: 'closed' } : ticket));
                navigate('/PhishingTicketsClosed'); // Naviga ai ticket chiusi di phishing
            })
            .catch(error => console.error('Error closing ticket:', error));
    };

    const handleSubmitComment = (id) => {
        if (commentText.trim() === "") {
            alert("Inserisci un commento prima di inviare.");
            return;
        }

        fetch(`http://localhost:3001/tickets/${id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: commentText }),
        })
            .then((res) => res.json())
            .then(newComment => {
                setComments((prevComments) => {
                    const updatedComments = { ...prevComments };
                    updatedComments[id] = updatedComments[id] || [];
                    updatedComments[id].push(newComment);
                    return updatedComments;
                });

                setCommentText("");  // Reset del campo di testo
                setExpandedCommentId(id); // Espandi la sezione commenti
            })
            .catch(error => console.error('Error commenting on ticket:', error));
    };

    const handleReplyToComment = (commentId) => {
        setActiveReplyId(activeReplyId === commentId ? null : commentId);  // Toggle della textbox di risposta
    };

    const handleSubmitReply = (commentId) => {
        if (replyText[commentId]?.trim() === "") {
            alert("Inserisci una risposta prima di inviare.");
            return;
        }

        fetch(`http://localhost:3001/comments/${commentId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reply: replyText[commentId] }),
        })
            .then((res) => res.json())
            .then(() => {
                setComments((prevComments) => {
                    const updatedComments = { ...prevComments };
                    const updatedComment = updatedComments[expandedCommentId].find(comment => comment.id === commentId);
                    if (updatedComment) {
                        updatedComment.replies = updatedComment.replies || [];
                        updatedComment.replies.push({ reply_text: replyText[commentId] });
                    }
                    return updatedComments;
                });

                setReplyText(prevState => ({ ...prevState, [commentId]: "" }));  // Reset della textbox
                setActiveReplyId(null);  // Chiudi la textbox di risposta
            })
            .catch(error => console.error('Error replying to comment:', error));
    };

    const handleToggleExpand = (id) => {
        if (expandedCommentId === id) {
            setExpandedCommentId(null); // Nascondi commenti
        } else {
            fetch(`http://localhost:3001/tickets/${id}/comments`)
                .then((res) => res.json())
                .then((data) => {
                    setComments((prevComments) => ({ ...prevComments, [id]: data }));
                    setExpandedCommentId(id);  // Mostra i commenti
                })
                .catch(error => console.error("Error fetching comments:", error));
        }
    };

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
                    <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Inserisci il dominio..." />

                    <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>

                <div className="textarea-container">
                    <label>Commento:</label>
                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Inserisci un commento..." />
                </div>

                <button className="submit-ticket" onClick={handleSubmitTicket}>Apri Ticket</button>
            </div>

            {/* Tabella per i ticket aperti */}
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
                {tickets.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td className={item.status === 'closed' ? 'status-closed' : 'status-open'}>
                            {item.status}
                        </td>
                        <td>{item.category}</td>
                        <td>{item.severity}</td>
                        <td>{item.text}</td>
                        <td>
                            {activeCommentId === item.id ? (
                                <div>
                                    <textarea
                                        style={{ width: '100%', marginBottom: '5px' }}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Inserisci un commento..."
                                    />
                                    <button onClick={() => handleSubmitComment(item.id)} style={{ marginBottom: '5px' }}>Commenta</button>
                                    <button onClick={() => setActiveCommentId(null)} style={{ marginBottom: '5px' }}>Annulla</button>
                                </div>
                            ) : (
                                <div>
                                    <button onClick={() => handleCloseTicket(item.id)} style={{ marginBottom: '5px' }}>Chiudi</button>
                                    <button onClick={() => setActiveCommentId(item.id)} style={{ marginBottom: '5px' }}>Commenta</button>
                                    <button onClick={() => handleToggleExpand(item.id)} style={{ marginBottom: '5px' }}>
                                        {expandedCommentId === item.id ? 'Nascondi Commenti' : 'Mostra Commenti'}
                                    </button>
                                </div>
                            )}
                            {expandedCommentId === item.id && comments[item.id] && comments[item.id].length > 0 && (
                                <div className="comment-section">
                                    <strong>Commenti:</strong>
                                    <ul>
                                        {comments[item.id].map((comment, index) => (
                                            <li key={index} className="comment-container">
                                                <span>{comment.comment_text}</span>
                                                <button onClick={() => handleReplyToComment(comment.id)}>Rispondi</button>

                                                {activeReplyId === comment.id && (
                                                    <div>
                                                        <textarea
                                                            value={replyText[comment.id] || ""}
                                                            onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                                                            placeholder="Inserisci una risposta..."
                                                        />
                                                        <button onClick={() => handleSubmitReply(comment.id)}>Invia</button>
                                                    </div>
                                                )}

                                                {comment.replies && comment.replies.length > 0 && (
                                                    <ul>
                                                        {comment.replies.map((reply, replyIndex) => (
                                                            <li key={replyIndex}>{reply.reply_text}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default PhishingTickets;












