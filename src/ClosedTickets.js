import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';

const ClosedTickets = () => {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3001/tickets")
            .then((res) => res.json())
            .then((data) => {
                const closedTickets = data.filter(ticket => ticket.status === "closed");
                setTickets(closedTickets);
            })
            .catch(error => console.error('Error fetching closed tickets:', error));
    }, []);

    const navigate = useNavigate();

    const handleGoBack = (e) => {
        e.preventDefault();
        navigate('/VisualizzaTicket');
    };

    return (
        <div>
            <h2>Tickets Chiusi</h2>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Content</th>
                    <th>Comments</th>
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
                            {item.comments && item.comments.length > 0 ? (
                                <ul>
                                    {item.comments.map((comment, index) => (
                                        <li key={index}>{comment}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span>No comments</span>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={handleGoBack}>Go Back</button>
        </div>
    );
};

const ClosedTicketsPage = () => {
    const { user, isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    const handleGoBack = (e) => {
        e.preventDefault();
        navigate('/VisualizzaTicket');
    };

    return (
        isAuthenticated && (
            <div>
                <span>Welcome,</span>
                <img src={user.picture} alt={user.name} />
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <button onClick={handleGoBack}>Go Back</button>
                <ClosedTickets />
            </div>
        )
    );
};

export default ClosedTicketsPage;






