import React, { useState, useEffect } from "react";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import './App.css';
import Home from "./Home";
import VisualizzaTicket from "./VisualizzaTicket";
import ApriUnTicket from "./ApriUnTicket";
import LoginButton from "./Login";
import LogoutButton from "./logout";
import Profile from "./profile";
import PageLoader from "./components/page-loader";
import {useAuth0} from "@auth0/auth0-react";
import {AuthenticationGuard} from "./components/authentication-guard";
import ClosedTickets from "./ClosedTickets"

function ConnectionBE(){
    const [message, setMessage] = useState("");

    useEffect(() => {

        fetch("http://localhost:3001/test")
            .then((res) => res.json())
            .then((data) => setMessage(data.message));


    }, []);

        return (
            <div className="ConnectionBE">
            <h1>{message}</h1>
            </div>
        );
}

function PageNotFound() {
    return <h1>Page not Found</h1>;
}

function App() {
    const { isLoading } = useAuth0();
    if(isLoading) {
        return <div><PageLoader/></div>;
    }

    return (
        <Routes>
            <Route path="/" element={<AuthenticationGuard component={Home} />}/>
            <Route path="/home" element={<AuthenticationGuard component={Home} />}/>
            <Route path="/login" element={<LoginButton />} />
            <Route path="/logout" element={<AuthenticationGuard component={LogoutButton}/>}/>
            <Route path="/profile" element={<AuthenticationGuard component={Profile}/>}/>
            <Route path="/visualizzaticket" element={<AuthenticationGuard component={VisualizzaTicket} />}/>
            <Route path="/apriunticket" element={<AuthenticationGuard component={ApriUnTicket} />}/>
            <Route path="/closedtickets" element={<AuthenticationGuard component={ClosedTickets} />} />
            <Route path="/ConnectionBE" element={<AuthenticationGuard component={ConnectionBE} />} />
            <Route
                path="*"
                element={<PageNotFound />}
            />
        </Routes>
    );
}

export default App;


