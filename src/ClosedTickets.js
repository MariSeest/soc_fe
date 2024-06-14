import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';

export const DynamicTablePage2 = () => {
    const data = [
        {
            "id": "1",
            "name": "name_1",
            "status": "status_1",
            "category": "category_1",
            "text": "text_1",
        },
        {
            "id": "2",
            "name": "name_2",
            "status": "status_2",
            "category": "category_2",
            "text": "text_2",
        },
    ];

    const navigate = useNavigate();

    const handleGoBack = (e) => {
        e.preventDefault();
        navigate('/VisualizzaTicket');
    };

    return (
        <div>
            <h2> Tickets Chiusi </h2>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Content</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.status}</td>
                        <td>{item.category}</td>
                        <td>{item.text}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={handleGoBack}>Go Back</button>
        </div>
    );
};

const ClosedTicketsPage = () => {
    const { user, isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    const handleGoBack = (e) => {
        e.preventDefault();
        navigate('/VisualizzaTicket');
    };

    return (
        isAuthenticated && (
            <div>
                <span>Welcome,</span>
                <img src={user.picture} alt={user.name}/>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <button onClick={handleGoBack}>Go Back</button>
                <DynamicTablePage2/>
            </div>
        )
    );
};

export default ClosedTicketsPage;



