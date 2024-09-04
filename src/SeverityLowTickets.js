import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './VisualizzaTicket.css';

const SeverityLowTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3001/tickets")
            .then((res) => res.json())
            .then((data) => {
                const lowSeverityTickets = data.filter(ticket => ticket.severity === 'Low');
                setTickets(lowSeverityTickets);
                setFilteredTickets(lowSeverityTickets);
            })
            .catch(error => console.error('Error fetching tickets:', error));
    }, []);

    const handleGoBack = (e) => {
        e.preventDefault();
        navigate('/home');
    };

    return (
        <div>
            <div className="title-container">
                <h2>Low Severity Tickets</h2>
            </div>
            <div className="button-container">
                <button onClick={handleGoBack}>Torna alla Home</button>
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
                        <td>{item.severity}</td>
                        <td>{item.text}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default SeverityLowTickets;
