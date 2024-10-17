import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './DettaglioTicket.css';

const DettaglioTicket = () => {
    const { id } = useParams();  // Ottieni l'ID del ticket dalla rotta
    const [ticket, setTicket] = useState(null);  // Stato per memorizzare i dettagli del ticket
    const [comments, setComments] = useState([]);  // Stato per memorizzare i commenti
    const [commentText, setCommentText] = useState("");  // Stato per il testo del nuovo commento
    const [showReplies, setShowReplies] = useState({}); // Stato per gestire la visibilità delle risposte
    const navigate = useNavigate();

    // Effettua il fetch per i dettagli del ticket quando il componente viene montato
    useEffect(() => {
        fetch(`http://localhost:3001/tickets/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setTicket(data);
            })
            .catch((error) => console.error("Error fetching ticket details:", error));
    }, [id]);

    // Effettua il fetch per i commenti del ticket
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`http://localhost:3001/tickets/${id}/comments`);
                const data = await res.json();
                setComments(data);  // Imposta i commenti
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };

        fetchComments();
    }, [id]);

    // Funzione per inviare un nuovo commento
    const handleSubmitComment = () => {
        if (commentText.trim() === "") {
            alert("Per favore, inserisci un commento prima di inviare.");
            return;
        }

        fetch(`http://localhost:3001/tickets/${id}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                comment_text: commentText,
                author: 'Nome Autore' // Modifica qui in base alla tua logica
            }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((newComment) => {
                // Aggiungi il nuovo commento direttamente alla lista
                setComments((prevComments) => [
                    ...prevComments,
                    { ...newComment, replies: [] } // Inizializza le risposte vuote
                ]);
                setCommentText("");  // Reset del campo di testo
            })
            .catch((error) => console.error('Error submitting comment:', error));
    };

    // Funzione per visualizzare/nascondere le risposte
    const toggleRepliesVisibility = (commentId) => {
        setShowReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId], // Inverte la visibilità
        }));
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
                        {comments.map((comment) => (
                            <li key={comment.id}> {/* Chiave unica per ogni commento */}
                                <div className="comment-container">
                                    <p>{comment.comment_text}</p>
                                    <small>{new Date(comment.created_at).toLocaleString()}</small>
                                    <button onClick={() => toggleRepliesVisibility(comment.id)}>
                                        {showReplies[comment.id] ? 'Nascondi Risposte' : 'Visualizza Risposte'}
                                    </button>
                                    {showReplies[comment.id] && comment.replies && comment.replies.length > 0 ? (
                                        <ul>
                                            {comment.replies.map((reply) => (
                                                <li key={`${reply.id}-${comment.id}`}> {/* Chiave unica per le risposte */}
                                                    <div className="reply-container">
                                                        <p>{reply.reply_text}</p>
                                                        <small>{new Date(reply.created_at).toLocaleString()} - {reply.author || 'Anonimo'}</small>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        showReplies[comment.id] && <p>Nessuna risposta disponibile.</p>
                                    )}
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

                {/* Bottone per aggiungere il commento */}
                <button onClick={handleSubmitComment}>Aggiungi Commento</button>
            </div>
        </div>
    );
};

export default DettaglioTicket;
