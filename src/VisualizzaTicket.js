import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const VisualizzaTicket = () => {
    const [tickets, setTickets] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3001/tickets")
            .then((res) => res.json())
            .then((data) => setTickets(data));
    }, []);

    const handleDelete = (id) => {
        fetch(`http://localhost:3001/tickets/${id}`, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then(() => {
                setTickets(tickets.filter(ticket => ticket.id !== id));
            })
            .catch(error => console.error('Error deleting ticket:', error));
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
            <h2>Tutti i Ticket</h2>
            <button onClick={handleGoBack}>Torna alla Home</button>
            <button onClick={handleClosedTickets}>Closed Tickets</button>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Content</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {tickets.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.status}</td>
                        <td>{item.category}</td>
                        <td>{item.text}</td>
                        <td>
                            <button onClick={() => handleDelete(item.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default VisualizzaTicket;



