import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './PhishingTickets.css'; // Usa il CSS corretto

const PhishingTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [activeCommentId, setActiveCommentId] = useState(null); // Per sapere quale ticket è in commento
    const [commentText, setCommentText] = useState(""); // Testo del commento
    const [expandedCommentId, setExpandedCommentId] = useState(null); // Per sapere quale commento è espanso
    const [domain, setDomain] = useState(""); // Dominio del sito di phishing
    const [severity, setSeverity] = useState("Low"); // Default severity "Low"
    const [newComment, setNewComment] = useState(""); // Commento per il nuovo ticket
    const navigate = useNavigate();

    // Fetch solo ticket di phishing aperti
    useEffect(() => {
        fetch("http://localhost:3001/tickets?category=phishing&status=open")
            .then((res) => res.json())
            .then((data) => {
                setTickets(data); // Salva solo i ticket di categoria "phishing"
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
            .then((updatedTicket) => {
                setTickets(tickets.map(ticket => ticket.id === id ? { ...ticket, comments: updatedTicket.comments } : ticket));
                setActiveCommentId(null); // Chiudi il campo di commento attivo
                setCommentText(""); // Reset del campo di testo del commento
            })
            .catch(error => console.error('Error commenting on ticket:', error));
    };

    const handleCommentAndCloseTicket = (id) => {
        if (commentText.trim() === "") {
            alert("Inserisci un commento prima di chiudere.");
            return;
        }

        fetch(`http://localhost:3001/tickets/${id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: commentText }),
        })
            .then(() => {
                handleCloseTicket(id); // Chiude il ticket dopo aver inserito il commento
            })
            .catch(error => console.error('Error commenting and closing ticket:', error));
    };

    const handleToggleExpand = (id) => {
        setExpandedCommentId(expandedCommentId === id ? null : id); // Espandi o chiudi i commenti
    };

    const handleSubmitTicket = () => {
        // Verifica che il dominio e il commento siano inseriti
        if (!domain || !newComment) {
            alert("Inserisci un dominio e un commento.");
            return;
        }

        const newTicket = {
            name: "Phishing Report",
            category: "phishing", // Fissa la categoria a "phishing"
            text: `Domain: ${domain}`,
            status: "open",
            comments: [newComment]
        };

        fetch("http://localhost:3001/tickets", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTicket),
        })
            .then((res) => res.json())
            .then((ticket) => {
                setTickets([...tickets, ticket]);
                setDomain(""); // Reset del campo dominio
                setNewComment(""); // Reset del campo commento
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
                                    <button onClick={() => handleCommentAndCloseTicket(item.id)} style={{ marginBottom: '5px' }}>Commenta & Chiudi</button>
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
                            {expandedCommentId === item.id && item.comments && item.comments.length > 0 && (
                                <div className="comment-section">
                                    <strong>Commenti:</strong>
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

export default PhishingTickets;










