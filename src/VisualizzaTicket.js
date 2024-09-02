import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const VisualizzaTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [expandedCommentId, setExpandedCommentId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3001/tickets")
            .then((res) => res.json())
            .then((data) => setTickets(data));
    }, []);

    const handleDelete = (id) => {
        fetch(`http://localhost:3001/tickets/${id}`, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then(() => {
                setTickets(tickets.filter(ticket => ticket.id !== id));
            })
            .catch(error => console.error('Error deleting ticket:', error));
    };

    const handleCloseTicket = (id) => {
        fetch(`http://localhost:3001/tickets/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'closed' }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then((updatedTicket) => {
                console.log("Ticket closed:", updatedTicket);
                setTickets(tickets.filter(ticket => ticket.status !== 'closed'));
                navigate('/closedtickets');
            })
            .catch(error => console.error('Error closing ticket:', error));
    };

    const handleCommentTicket = (id) => {
        setActiveCommentId(id);
        setExpandedCommentId(id); // Espandi automaticamente la cella per mostrare l'area di commento
    };

    const handleCancelComment = () => {
        setActiveCommentId(null);
        setCommentText("");
        setExpandedCommentId(null); // Collassa la cella quando annulli l'azione di commento
    };

    const handleSubmitComment = (id) => {
        if (commentText.trim() === "") {
            alert("Please enter a comment before submitting.");
            return;
        }

        fetch(`http://localhost:3001/tickets/${id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: commentText }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(updatedTicket => {
                setTickets(tickets.map(ticket =>
                    ticket.id === id ? { ...ticket, comments: updatedTicket.comments } : ticket
                ));
                setActiveCommentId(null);
                setCommentText("");
                setExpandedCommentId(id); // Automatically expand to show the new comment
            })
            .catch(error => console.error('Error commenting on ticket:', error));
    };

    const handleCommentAndCloseTicket = (id) => {
        if (commentText.trim() === "") {
            alert("Please enter a comment before submitting.");
            return;
        }

        fetch(`http://localhost:3001/tickets/${id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: commentText }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(() => {
                handleCloseTicket(id); // Once the comment is submitted, close the ticket
            })
            .catch(error => console.error('Error commenting and closing ticket:', error));
    };

    const handleToggleExpand = (id) => {
        setExpandedCommentId(expandedCommentId === id ? null : id);
    };

    const handleGoBack = (e) => {
        e.preventDefault();
        navigate('/home');
    };

    const handleClosedTickets = (e) => {
        e.preventDefault();
        navigate('/closedtickets');
    };

    return (
        <div>
            <div style={{
                backgroundColor: 'lightblue',
                padding: '10px 0',
                textAlign: 'center',
                marginBottom: '20px',
                width: '100vw',
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                boxSizing: 'border-box'
            }}>
                <h2 style={{ margin: 0, fontSize: '4vw' }}>Tutti i Ticket</h2>
            </div>

            <div style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                display: 'flex',
                flexDirection: 'column',
                padding: '10px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '10px',
                zIndex: 1000
            }}>
                <button onClick={handleGoBack} style={{ marginBottom: '10px' }}>Torna alla Home</button>
                <button onClick={handleClosedTickets}>Closed Tickets</button>
            </div>

            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                <tr style={{backgroundColor:'lightblue'}}>
                    <th style={{ border: '2px solid black', padding: '8px' }}>ID</th>
                    <th style={{ border: '2px solid black', padding: '8px' }}>Name</th>
                    <th style={{ border: '2px solid black', padding: '8px' }}>Status</th>
                    <th style={{ border: '2px solid black', padding: '8px' }}>Category</th>
                    <th style={{ border: '2px solid black', padding: '8px' }}>Content</th>
                    <th style={{ border: '2px solid black', padding: '8px' }}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {tickets.map((item) => (
                    <tr key={item.id}>
                        <td style={{ border: '2px solid black', padding: '8px' , backgroundColor:'aqua'}}>{item.id}</td>
                        <td style={{ border: '2px solid black', padding: '8px',backgroundColor:'aqua' }}>{item.name}</td>
                        <td style={{
                            border: '2px solid black',
                            padding: '8px',
                            backgroundColor:'aqua',
                            color: item.status === 'closed' ? 'red' : 'green'  // Colore condizionale
                        }}>
                            {item.status}
                        </td>
                        <td style={{ border: '2px solid black', padding: '8px', backgroundColor:'aqua' }}>{item.category}</td>
                        <td style={{ border: '2px solid black', padding: '8px',backgroundColor:'aqua' }}>{item.text}</td>
                        <td style={{ border: '2px solid black', padding: '8px' ,backgroundColor:'aqua'}}>
                            {activeCommentId === item.id ? (
                                <div>
                                    <textarea
                                        style={{ width: '100%', marginBottom: '5px' }}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Enter your comment here"
                                    />
                                    <button onClick={() => handleSubmitComment(item.id)} style={{ marginBottom: '5px' }}>Submit</button>
                                    <button onClick={() => handleCommentAndCloseTicket(item.id)}>Submit & Close</button>
                                    <button onClick={handleCancelComment} style={{ marginBottom: '5px' }}>Cancel</button>
                                </div>
                            ) : (
                                <div>
                                    <button onClick={() => handleDelete(item.id)} style={{ marginBottom: '5px' }}>Delete</button>
                                    {item.status !== 'closed' && (
                                        <>
                                            <button onClick={() => handleCloseTicket(item.id)} style={{ marginBottom: '5px' }}>Close</button>
                                            <button onClick={() => handleCommentTicket(item.id)} style={{ marginBottom: '5px' }}>Comment</button>
                                            <button onClick={() => handleCommentAndCloseTicket(item.id)} style={{ marginBottom: '5px' }}>Comment & Close</button>
                                        </>
                                    )}
                                    <button onClick={() => handleToggleExpand(item.id)}>
                                        {expandedCommentId === item.id ? '▲' : '▼'}
                                    </button>
                                </div>
                            )}
                            {expandedCommentId === item.id && item.comments && item.comments.length > 0 && (
                                <div style={{ marginTop: '10px', padding: '5px', borderTop: '1px solid #ccc' }}>
                                    <strong>Comments:</strong>
                                    <ul>
                                        {item.comments.map((comment, index) => (
                                            <li key={index}>{comment}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default VisualizzaTicket;

















