import React from "react";
import { useNavigate } from 'react-router-dom';
import LogoutButton from "./logout";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./Login";
import Chat from './Chat'; // Importa il componente Chat

export const Home = ({ username }) => {
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

    return (
        isAuthenticated && (
            <div>
                <div className="toolbar">
                    <span>Welcome, {username}</span>
                    <img src={user.picture} alt={user.name} />
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <button onClick={handleVisualizza}>Visualizza Ticket</button>
                    <button onClick={handleRedir}>Apri un Ticket</button>
                    <button onClick={handleProfile}>Profile</button>
                    <LogoutButton />
                </div>

                <div className="main-content">
                    <h1>SOCX</h1>
                </div>

                {/* Aggiungi l'icona per aprire la chat */}
                <button onClick={() => document.querySelector('.chat-popup').style.display = 'flex'}>
                    Open Chat
                </button>

                {/* Componente Chat */}
                <Chat />
            </div>
        )
    );
};

export default Home;




