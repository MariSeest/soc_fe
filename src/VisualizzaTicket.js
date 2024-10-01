import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import './VisualizzaTicket.css';

const VisualizzaTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [expandedCommentId, setExpandedCommentId] = useState(null); // Per visualizzare i commenti
    const [categoryFilter, setCategoryFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [comments, setComments] = useState({});
    const [showSidebar, setShowSidebar] = useState(false); // Stato per visualizzare la barra laterale
    const [showOnlyComments, setShowOnlyComments] = useState(false); // Stato per visualizzare solo i commenti
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

    // Funzione per recuperare e visualizzare solo i commenti
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
                setShowOnlyComments(true); // Mostra solo i commenti
                setShowSidebar(true); // Apri la barra laterale
            })
            .catch((error) => console.error("Error fetching comments:", error));
    };

    const handleCloseSidebar = () => {
        setShowSidebar(false); // Nascondi la barra laterale
        setExpandedCommentId(null); // Resetta l'ID attivo
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

            {/* Barra laterale per visualizzare solo lo storico dei commenti */}
            {showSidebar && (
                <div className="sidebar">
                    <div className="sidebar-content">
                        <h3>Storico dei Commenti</h3>
                        <button className="sidebar-close" onClick={handleCloseSidebar}>Chiudi</button>

                        {/* Storico dei commenti */}
                        <div className="comments-container">
                            {comments[expandedCommentId]?.length > 0 ? (
                                comments[expandedCommentId].map((comment) => (
                                    <div key={comment.id} className="comment-container">
                                        <p>{comment.comment_text}</p>
                                        <span className="comment-author">- {comment.author}</span>
                                    </div>
                                ))
                            ) : (
                                <p>Nessun commento ancora.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisualizzaTicket;
