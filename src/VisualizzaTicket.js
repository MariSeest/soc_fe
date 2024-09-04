import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './VisualizzaTicket.css';

const VisualizzaTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]); // Stato per ticket filtrati
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [expandedCommentId, setExpandedCommentId] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState(''); // Stato per filtro categoria
    const [severityFilter, setSeverityFilter] = useState(''); // Stato per filtro severity
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

    const handleCommentTicket = (id) => {
        setActiveCommentId(id);
        setExpandedCommentId(id);
    };

    const handleCancelComment = () => {
        setActiveCommentId(null);
        setCommentText("");
        setExpandedCommentId(null);
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
            body: JSON.stringify({ comment: commentText }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(updatedTicket => {
                setTickets(tickets.map(ticket =>
                    ticket.id === id ? { ...ticket, comments: updatedTicket.comments } : ticket
                ));
                setActiveCommentId(null);
                setCommentText("");
                setExpandedCommentId(id);
            })
            .catch(error => console.error('Error commenting on ticket:', error));
    };

    const handleCommentAndCloseTicket = (id) => {
        if (commentText.trim() === "") {
            alert("Please enter a comment before submitting.");
            return;
        }

        fetch(`http://localhost:3001/tickets/${id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: commentText }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(() => {
                handleCloseTicket(id);
            })
            .catch(error => console.error('Error commenting and closing ticket:', error));
    };

    const handleToggleExpand = (id) => {
        setExpandedCommentId(expandedCommentId === id ? null : id);
    };

    const handleGoBack = (e) => {
        e.preventDefault();
        navigate('/home');
    };

    const handleClosedTickets = (e) => {
        e.preventDefault();
        navigate('/closedtickets');
    };

    return (
        <div>
            <div className="title-container">
                <h2>Tutti i Ticket</h2>
            </div>

            <div className="button-container">
                <button onClick={handleGoBack}>Torna alla Home</button>
                <button onClick={handleClosedTickets}>Closed Tickets</button>
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
                    <th>Severity</th> {/* Aggiungiamo la colonna severity */}
                    <th>Content</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredTickets.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td className={item.status === 'closed' ? 'status-closed' : 'status-open'}>
                            {item.status}
                        </td>
                        <td>{item.category}</td>
                        <td>{item.severity}</td> {/* Mostra la severity */}
                        <td>{item.text}</td>
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
                                    <button onClick={() => handleCommentAndCloseTicket(item.id)}>Submit & Close</button>
                                    <button onClick={handleCancelComment} style={{ marginBottom: '5px' }}>Cancel</button>
                                </div>
                            ) : (
                                <div>
                                    <button onClick={() => handleDelete(item.id)} style={{ marginBottom: '5px' }}>Delete</button>
                                    {item.status !== 'closed' && (
                                        <>
                                            <button onClick={() => handleCloseTicket(item.id)} style={{ marginBottom: '5px' }}>Close</button>
                                            <button onClick={() => handleCommentTicket(item.id)} style={{ marginBottom: '5px' }}>Comment</button>
                                            <button onClick={() => handleCommentAndCloseTicket(item.id)} style={{ marginBottom: '5px' }}>Comment & Close</button>
                                        </>
                                    )}
                                    <button onClick={() => handleToggleExpand(item.id)}>
                                        {expandedCommentId === item.id ? '▲' : '▼'}
                                    </button>
                                </div>
                            )}
                            {expandedCommentId === item.id && item.comments && item.comments.length > 0 && (
                                <div className="comment-section">
                                    <strong>Comments:</strong>
                                    <ul>
                                        {item.comments.map((comment, index) => (
                                            <li key={index}>{comment}</li>
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

export default VisualizzaTicket;




















