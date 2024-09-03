import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { useNavigate } from 'react-router-dom';
import './profile.css'; // Importa il CSS

const Profile = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate();

    const handleGoBack = (e) => {
        e.preventDefault();
        navigate('/Home');
    };

    if (isLoading) {
        return <div>Loading ...</div>;
    }

    return (
        isAuthenticated && (
            <div className="profile-container">
                <button onClick={handleGoBack}>Go Back</button>
                <img src={user.picture} alt={user.name} />
                <h2>{user.name}</h2>
                <p>{user.email}</p>
            </div>
        )
    );
};

export default Profile;
