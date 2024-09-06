import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const DettaglioTicket = () => {
    const { id } = useParams();  // Ottieni l'ID del ticket dalla rotta
    const [ticket, setTicket] = useState(null);  // Stato per memorizzare i dettagli del ticket
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        // Recupera i dettagli del ticket dal backend
        fetch(`http://localhost:3001/ticket/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setTicket(data);
            })
            .catch((error) => console.error("Error fetching ticket details:", error));
    }, [id]);

    const handleSubmitComment = () => {
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
            .then((res) => res.json())
            .then((updatedTicket) => {
                setTicket(updatedTicket);  // Aggiorna i dettagli del ticket con il nuovo commento
                setCommentText("");  // Reset del campo di testo
            })
            .catch((error) => console.error('Error submitting comment:', error));
    };

    if (!ticket) {
        return <div>Loading ticket details...</div>;
    }

    return (
        <div>
            <h2>Dettagli del Ticket {ticket.name}</h2>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Categoria:</strong> {ticket.category}</p>
            <p><strong>Severità:</strong> {ticket.severity}</p>
            <p><strong>Contenuto:</strong> {ticket.content}</p>

            <h3>Commenti:</h3>
            {ticket.comments && ticket.comments.length > 0 ? (
                <ul>
                    {ticket.comments.map((comment, index) => (
                        <li key={index}>{comment}</li>
                    ))}
                </ul>
            ) : (
                <p>Nessun commento ancora.</p>
            )}

            <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Aggiungi un commento"
            />
            <button onClick={handleSubmitComment}>Aggiungi Commento</button>
        </div>
    );
};

export default DettaglioTicket;
