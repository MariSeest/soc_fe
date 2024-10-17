import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import LogoutButton from "./logout";
import { useAuth0 } from "@auth0/auth0-react";
import Chat from './Chat'; // Importa il componente Chat
import './Home.css';

export const Home = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth0();

    const handleProfile = (e) => {
        e.preventDefault();
        navigate('/profile');
    };

    const handleRedir2 = (e) => {
        e.preventDefault();
        navigate('/SeverityHighTickets');
    };

    const handleRedir3 = (e) => {
        e.preventDefault();
        navigate('/SeverityMediumTickets');
    };

    const handleRedir4 = (e) => {
        e.preventDefault();
        navigate('/SeverityLowTickets');
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

    const handlePhishing = (e) => {
        e.preventDefault();
        navigate('/PhishingTickets');
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        isAuthenticated && (
            <div>
                {/* Spazio per evitare sovrapposizione tra header e contenuti */}
                <div style={{ height: '1cm' }}></div>

                <div className="header">
                    <div className="circle-container">
                        <h1>SOCX</h1>
                    </div>
                </div>

                <div className="toolbar">
                    <span>Welcome, {user.nickname}</span>
                    <img src={user.picture} alt={user.name}/>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <button onClick={handleVisualizza}>Visualizza Ticket</button>
                    <button onClick={handleRedir}>Apri un Ticket</button>
                    <button onClick={handlePhishing}>Phishing</button>
                    <button onClick={() => navigate('/profile')}>Profile</button>
                    <LogoutButton/>
                </div>

                {/* Centro della pagina: Bottoni di severity */}
                <div className="severity-buttons-container">
                    <button className="severity-box high" onClick={handleRedir2}>High</button>
                    <button className="severity-box medium" onClick={handleRedir3}>Medium</button>
                    <button className="severity-box low" onClick={handleRedir4}>Low</button>
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
