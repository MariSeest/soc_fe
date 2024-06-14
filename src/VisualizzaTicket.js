import React from "react";
import { useNavigate } from 'react-router-dom';

const DynamicTablePage = () => {
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
    const navigate = useNavigate(); // Using the useNavigate hook to get the navigation function

    const handleGoBack = (e) => {
        e.preventDefault();
        // Assuming the login is successful, you can redirect to the home page
        // Redirect to the home page
        navigate('/Home'); // Update '/home' with your actual home page route
    };

    const handleClosedTickets = (e) => {
        e.preventDefault();
        navigate('/ClosedTickets');
    };

    return (
        <div>
            <h2>Tutti i Ticket</h2>
            <button onClick={handleGoBack}>Torna alla Home</button>
            {/* This button should redirect to the Home page */}
            <button onClick={handleClosedTickets}>Closed Tickets</button>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Content</th>
                    {/* Add more table headers as needed */}
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
        </div>
    );
};

export default DynamicTablePage;


