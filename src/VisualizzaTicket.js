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
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3001/tickets")
            .then((res) => res.json())
            .then((data) => {
                setTickets(data);
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
        if (commentText.trim() === "") {
            alert("Please enter a comment before submitting.");
            return;
        }

        fetch(`http://localhost:3001/tickets/${id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: commentText }),  // Invia il commento
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(updatedTicket => {
                // Aggiorna il ticket con i nuovi commenti
                setTickets(tickets.map(ticket =>
                    ticket.id === id ? { ...ticket, comments: updatedTicket.comments } : ticket
                ));
                setCommentText("");  // Pulisci la textarea
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
                // Aggiorna i commenti senza il commento eliminato
                setComments((prevComments) => ({
                    ...prevComments,
                    [expandedCommentId]: prevComments[expandedCommentId].filter(comment => comment.id !== commentId),
                }));
            })
            .catch((error) => console.error('Error deleting comment:', error));
    };
    const [replyText, setReplyText] = useState("");  // Stato per memorizzare la risposta

    const handleReplyToComment = (commentId) => {
        const reply = prompt('Inserisci la tua risposta:');  // Puoi cambiare questo con un campo di input nella UI

        if (!reply) {
            return;  // Se non viene inserita nessuna risposta
        }

        fetch(`http://localhost:3001/comments/${commentId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reply }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Error replying to comment');
                }
                // Aggiorna lo stato con la nuova risposta
                // Potresti voler aggiornare i commenti per mostrare le risposte
                console.log(`Reply added to comment ${commentId}`);
            })
            .catch((error) => console.error('Error replying to comment:', error));
    };

    const handleCancelComment = () => {
        setActiveCommentId(null);  // Resetta il commento attivo
        setCommentText("");  // Pulisci il campo di testo del commento
        setExpandedCommentId(null);  // Chiudi la sezione commenti
    };

    // Funzione per gestire il click su "Visualizza Commenti"
    const handleToggleComments = (id) => {
        if (expandedCommentId === id) {
            setExpandedCommentId(null);  // Nascondi commenti
        } else {
            // Effettua la chiamata API per ottenere i commenti del ticket specifico
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

            <div className="filter-container">
                <label>Filtra per Categoria:</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">Tutte</option>
                    <option value="DDOS">DDOS</option>
                    <option value="Exfiltration">Exfiltration</option>
                    <option value="Support">Support</option>
                </select>

                <label>Filtra per Severity:</label>
                <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                    <option value="">Tutte</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
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
                                    <textarea
                                        style={{ width: '100%', marginBottom: '5px' }}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Enter your comment here"
                                    />
                                    <button onClick={() => handleSubmitComment(item.id)} style={{ marginBottom: '5px' }}>Submit</button>
                                    <button onClick={handleCancelComment} style={{ marginBottom: '5px' }}>Cancel</button>
                                </div>
                            ) : (
                                <div>
                                    <button onClick={() => handleDelete(item.id)} style={{ marginBottom: '5px' }}>Delete</button>
                                    {item.status !== 'closed' && (
                                        <>
                                            <button onClick={() => handleCloseTicket(item.id)} style={{ marginBottom: '5px' }}>Close</button>
                                            <button onClick={() => setActiveCommentId(item.id)} style={{ marginBottom: '5px' }}>Comment</button>
                                        </>
                                    )}
                                    <button onClick={() => handleToggleComments(item.id)} style={{ marginBottom: '5px' }}>
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
                                            <li key={index}>
                                                {comment.comment_text}
                                                <button onClick={() => handleDeleteComment(comment.id)} style={{ marginLeft: '10px' }}>Delete</button>
                                                <button onClick={() => handleReplyToComment(comment.id)} style={{ marginLeft: '5px' }}>Reply</button>
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





























