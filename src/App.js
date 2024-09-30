import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";  // Importa Link
import './App.css';
import Home from "./Home";
import VisualizzaTicket from "./VisualizzaTicket";
import ApriUnTicket from "./ApriUnTicket";
import LoginButton from "./Login";
import LogoutButton from "./logout";
import Profile from "./profile";
import PageLoader from "./components/page-loader";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthenticationGuard } from "./components/authentication-guard";
import ClosedTickets from "./ClosedTickets";
import SeverityHighTickets from './SeverityHighTickets';
import SeverityMediumTickets from './SeverityMediumTickets';
import SeverityLowTickets from './SeverityLowTickets';
import PhishingTickets from './PhishingTickets';
import PhishingTicketsClosed from "./PhishingTicketsClosed";
import DettaglioTicket from './DettaglioTicket'; // Importa il nuovo componente
import ErrorBoundary from './ErrorBoundary';  // Importa ErrorBoundary

function App() {
    const { isLoading } = useAuth0();
    const [data, setData] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetch(`${apiUrl}/data`)
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, [apiUrl]);

    if (isLoading) {
        return <div><PageLoader /></div>;
    }

    return (
            <Routes>
                <Route path="/" element={<AuthenticationGuard component={Home} />} />
                <Route path="/home" element={<AuthenticationGuard component={Home} />} />
                <Route path="/login" element={<LoginButton />} />
                <Route path="/logout" element={<AuthenticationGuard component={LogoutButton} />} />
                <Route path="/profile" element={<AuthenticationGuard component={Profile} />} />
                <Route path="/visualizzaticket" element={<AuthenticationGuard component={VisualizzaTicket} />} />
                <Route path="/apriunticket" element={<AuthenticationGuard component={ApriUnTicket} />} />
                <Route path="/closedtickets" element={<AuthenticationGuard component={ClosedTickets} />} />
                <Route path="/SeverityHighTickets" element={<AuthenticationGuard component={SeverityHighTickets} />} />
                <Route path="/SeverityMediumTickets" element={<AuthenticationGuard component={SeverityMediumTickets} />} />
                <Route path="/SeverityLowTickets" element={<AuthenticationGuard component={SeverityLowTickets} />} />
                <Route path="/PhishingTickets" element={
                    <ErrorBoundary>
                        <AuthenticationGuard component={PhishingTickets} />
                    </ErrorBoundary>
                } />
                <Route path="/PhishingTicketsClosed" element={<AuthenticationGuard component={PhishingTicketsClosed} />} />
                <Route path="/ticket/:id" element={<AuthenticationGuard component={DettaglioTicket} />} />
            </Routes>
    );
}

export default App;
