import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';  // Importa Link
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
                            {/* Azioni per eliminare, commentare e chiudere */}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default VisualizzaTicket;





















