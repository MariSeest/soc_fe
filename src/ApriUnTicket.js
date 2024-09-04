import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import './ApriUnTicket.css';

const ApriUnTicket = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();
    const [ticket, setTicket] = useState({
        name: "",
        status: "open",
        category: "Exfiltration", // Categoria di default
        severity: "Medium", // Severity di default
        text: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTicket(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/tickets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ticket)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Ticket created:", data);
                navigate("/visualizzaticket");
            })
            .catch(error => {
                console.error("Error creating ticket:", error);
            });
    };

    return (
        isAuthenticated && (
            <div className="container">
                <h2>Apri un Ticket</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Nome:
                        <input type="text" name="name" value={ticket.name} onChange={handleChange} required />
                    </label>
                    <label>
                        Categoria:
                        <select name="category" value={ticket.category} onChange={handleChange} required>
                            <option value="Exfiltration">Exfiltration</option>
                            <option value="DDOS">DDOS</option>
                            <option value="Support">Support</option>
                        </select>
                    </label>
                    <label>
                        Gravità (Severity):
                        <select name="severity" value={ticket.severity} onChange={handleChange} required>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </label>
                    <label>
                        Descrizione:
                        <textarea name="text" value={ticket.text} onChange={handleChange} required />
                    </label>
                    <button type="submit">Invia</button>
                </form>
                <button onClick={() => navigate('/home')}>Torna alla Home</button>
            </div>
        )
    );
};

export default ApriUnTicket;






