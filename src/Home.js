import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import LogoutButton from "./logout";
import { useAuth0 } from "@auth0/auth0-react";
import Chat from './Chat'; // Importa il componente Chat
import './Home.css';

export const Home = () => {
    const [tickets, setTickets] = useState([]);
    const [ticketsByCategory, setTicketsByCategory] = useState({});
    const [isChatOpen, setIsChatOpen] = useState(false);
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth0();

    useEffect(() => {
        // Funzione per recuperare i ticket
        const fetchTickets = async () => {
            try {
                const response = await fetch("http://localhost:3001/tickets");
                const data = await response.json();

                // Filtra solo i ticket "open"
                const openTickets = data.filter(ticket => ticket.status === 'open');

                // Conta i ticket per categoria
                const categoryCounts = openTickets.reduce((acc, ticket) => {
                    acc[ticket.category] = (acc[ticket.category] || 0) + 1;
                    return acc;
                }, {});

                setTicketsByCategory(categoryCounts);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            }
        };

        fetchTickets();
    }, []);

    const handleProfile = (e) => {
        e.preventDefault();
        navigate('/profile');
    };

    const handleVisualizza = (e) => {
        e.preventDefault();
        navigate('/visualizzaticket');
    };

    const handleRedir = (e) => {
        e.preventDefault();
        navigate('/apriunticket');
    };

    const toggleChat = () => {
        setIsChatOpen(prevState => !prevState);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        isAuthenticated && (
            <div>
                <div className="header">
                    <div className="circle-container">
                        <h1>SOCX</h1>
                    </div>
                </div>
                <div className="toolbar">
                    <span>Welcome, {user.nickname}</span>
                    <img src={user.picture} alt={user.name} />
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <button onClick={handleVisualizza}>Visualizza Ticket</button>
                    <button onClick={handleRedir}>Apri un Ticket</button>
                    <button onClick={handleProfile}>Profile</button>
                    <LogoutButton />
                </div>

                {/* Centro della pagina: Numero di ticket aperti per categoria */}
                <div className="ticket-stats-container">
                    <div className="ticket-stats">
                        <h2>Open Tickets by Category</h2>
                        {Object.keys(ticketsByCategory).length === 0 ? (
                            <p>No open tickets</p>
                        ) : (
                            <ul>
                                {Object.entries(ticketsByCategory).map(([category, count]) => (
                                    <li key={category}>
                                        {category}: {count} {count === 1 ? "ticket" : "tickets"}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Pulsante per aprire/chiudere la chat */}
                <button className="open-chat-button" onClick={toggleChat}>
                    {isChatOpen ? 'Close Chat' : 'Open Chat'}
                </button>

                {/* Componente Chat visibile solo se isChatOpen è true */}
                {isChatOpen && <Chat username={user.nickname} />}
            </div>
        )
    );
};

export default Home;








