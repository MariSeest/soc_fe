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
    const [news, setNews] = useState([]);
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth0();

    useEffect(() => {
        // Funzione per recuperare le news
        const fetchNews = async () => {
            try {
                const response = await fetch("https://www.cybersecurity360.it/news/");
                const text = await response.text();

                // Esegui il parsing dell'HTML per estrarre i titoli (assicurati di usare il selettore giusto)
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const titles = Array.from(doc.querySelectorAll('.title-class-selector')) // Cambia con il giusto selettore
                    .slice(0, 5)
                    .map(el => el.textContent);

                setNews(titles);
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        };

        fetchNews();
    }, []);

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

const handlePhishing=(e) => {
    e.preventDefault();
    navigate('/PhishingTickets');
};

    if (isLoading) return <div>Loading...</div>;

    return (
        isAuthenticated && (
            <div>
                {/* Banner dinamico per le news */}
                <div className="news-banner">
                    <marquee>
                        {news.length > 0 ? (
                            news.map((title, index) => (
                                <span key={index}>{title} | </span>
                            ))
                        ) : (
                            <span>Loading latest news...</span>
                        )}
                    </marquee>
                </div>

                {/* Spazio per evitare sovrapposizione tra header e news banner */}
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












