import React from "react";
import { useNavigate } from 'react-router-dom';
import LogoutButton from "./logout";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./Login";
import Chat from './Chat'; // Importa il componente Chat
import './Home.css';

export const Home = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth0();

    const handleProfile = (e) => {
        e.preventDefault();
        navigate('/profile');
    }

    const handleVisualizza = (e) => {
        e.preventDefault();
        navigate('/visualizzaticket');
    }

    const handleRedir = (e) => {
        e.preventDefault();
        navigate('/apriunticket');
    }

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

                {/* Aggiungi l'icona per aprire la chat */}
                <button className="open-chat-button" onClick={() => document.querySelector('.chat-popup').style.display = 'flex'}>
                    Open Chat
                </button>

                {/* Componente Chat */}
                <Chat username={user.nickname} />
            </div>
        )
    );
};

export default Home;






