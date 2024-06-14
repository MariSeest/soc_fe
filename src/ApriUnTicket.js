import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import PopUpBox from './components/PopUpBox';

const App = ({ username }) => {
    const navigate = useNavigate(); // Initialize navigate
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [showPopUp, setShowPopUp] = useState(false); // State to manage the visibility of the pop-up box

    const handleGoBackHome = (e) => {
        e.preventDefault();
        navigate('/Home');
    }

    const handleOpenPopUp = () => {
        setShowPopUp(true);
    }

    const handleClosePopUp = () => {
        setShowPopUp(false);
    }

    return (isAuthenticated && (
            <div>
                {/* Toolbar */}
                <div className="toolbar">
                    <span>Welcome,</span>
                    <img src={user.picture} alt={user.name}/>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <button onClick={handleOpenPopUp}>Apri un ticket</button>
                    <p>oppure</p>
                    <button onClick={handleGoBackHome}> Torna alla Home</button>
                </div>
                {/* Render the PopUpBox component conditionally */}
                {showPopUp && <PopUpBox onClose={handleClosePopUp} />}
            </div>
        )
    );
};

export default App;


