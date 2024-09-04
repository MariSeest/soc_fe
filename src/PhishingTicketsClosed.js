import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './VisualizzaTicket.css';

const PhishingTicketsClosed = () => {
    const [closedTickets, setClosedTickets] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3001/tickets?category=phishing&status=closed")
            .then((res) => res.json())
            .then((data) => {
                setClosedTickets(data);
            })
            .catch(error => console.error('Error fetching closed tickets:', error));
    }, []);

    return (
        <div>
            <div className="title-container">
                <h2>Phishing Tickets Chiusi</h2>
            </div>
            <button onClick={() => navigate('/PhishingTickets')}>Torna ai Ticket Aperti</button>
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
                {closedTickets.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.status}</td>
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

export default PhishingTicketsClosed;
