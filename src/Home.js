import React from "react";
import { useNavigate } from 'react-router-dom';
import LogoutButton from "./logout"
import {useAuth0} from "@auth0/auth0-react";
import LoginButton from "./Login";


export const Home = ({ username }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth0();

    const handleProfile=(e)=>{
        e.preventDefault();
        navigate ('/profile');
    }
    const handleVisualizza = (e) => {
        e.preventDefault();
        navigate('/visualizzaticket');
    }
    const handleRedir = (e)=>{e.preventDefault()
        navigate('/apriunticket');
    }
    return (
        isAuthenticated && (
        <div>
            {/* Toolbar */}
            <div className="toolbar">
                <span>Welcome, {username}</span>
                <img src={user.picture} alt={user.name}/>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <button onClick={handleVisualizza}>Visualizza Ticket</button>
                <button onClick={handleRedir}>Apri un Ticket</button>
                <button onClick={handleProfile}>Profile</button>
                <LogoutButton/>
            </div>

            {/* Main content */}
            <div className="main-content">
                {/* Your main content goes here */}
                <h1>SOCX</h1>
                {/* You can add more content */}
            </div>
        </div>
        )
    );
};

export default Home;


