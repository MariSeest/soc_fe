import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DettaglioTicket = () => {
    const { id } = useParams();  // Ottieni l'ID del ticket dalla rotta
    const [ticket, setTicket] = useState(null);  // Stato per memorizzare i dettagli del ticket
    const [comments, setComments] = useState([]);  // Stato per memorizzare i commenti
    const [commentText, setCommentText] = useState("");  // Stato per il testo del nuovo commento
    const navigate = useNavigate();

    // Effettua il fetch per i dettagli del ticket quando il componente viene montato
    useEffect(() => {
        fetch(`http://localhost:3001/ticket/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setTicket(data);
            })
            .catch((error) => console.error("Error fetching ticket details:", error));
    }, [id]);

    // Effettua il fetch per i commenti del ticket
    useEffect(() => {
        fetch(`http://localhost:3001/tickets/${id}/comments`)
            .then((res) => res.json())
            .then((data) => {
                setComments(data);  // Imposta i commenti
            })
            .catch((error) => console.error("Error fetching comments:", error));
    }, [id]);

    // Funzione per inviare un nuovo commento
    const handleSubmitComment = () => {
        if (commentText.trim() === "") {
            alert("Per favore, inserisci un commento prima di inviare.");
            return;
        }

        fetch(`http://localhost:3001/tickets/${id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: commentText }),  // Invia il commento al backend
        })
            .then((res) => res.json())
            .then(() => {
                setCommentText("");  // Reset del campo di testo
                // Ricarica i commenti per aggiornare la lista
                fetch(`http://localhost:3001/tickets/${id}/comments`)
                    .then((res) => res.json())
                    .then((data) => {
                        setComments(data);  // Aggiorna i commenti
                    })
                    .catch((error) => console.error("Error fetching comments after submission:", error));
            })
            .catch((error) => console.error('Error submitting comment:', error));
    };

    if (!ticket) {
        return <div>Loading ticket details...</div>;
    }

    return (
        <div className="container">
            <div className="button-container">
                <button onClick={() => navigate('/home')}>Torna alla Home</button>
            </div>

            <div className="ticket-content">
                <h2>Dettagli del Ticket {ticket.name}</h2>
                <p><strong>Status:</strong> {ticket.status}</p>
                <p><strong>Categoria:</strong> {ticket.category}</p>
                <p><strong>Severità:</strong> {ticket.severity}</p>
                <p><strong>Contenuto:</strong> {ticket.content}</p>
            </div>

            <div className="comment-section">
                <h3>Commenti:</h3>
                {comments.length > 0 ? (
                    <ul>
                        {comments.map((comment, index) => (
                            <li key={index}>
                                <div className="comment-container">
                                    <p>{comment.comment_text}</p>
                                    <small>{new Date(comment.created_at).toLocaleString()}</small>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nessun commento ancora.</p>
                )}

                {/* Textarea per aggiungere un nuovo commento */}
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Aggiungi un commento"
                />

                {/* Bottone per aggiungere il commento spostato sotto al textbox */}
                <button onClick={handleSubmitComment}>Aggiungi Commento</button>
            </div>
        </div>
    );
};

export default DettaglioTicket;




