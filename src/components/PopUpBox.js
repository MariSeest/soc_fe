import React, { useState } from 'react';

const PopUpBox = ({ onClose }) => {
    const [textInput1, setTextInput1] = useState('');
    const [textInput2, setTextInput2] = useState('');
    const [selectedCategoryOptions, setSelectedCategoryOptions] = useState([]);
    const [selectedPriorityOptions, setSelectedPriorityOptions] = useState([]);


    const handleTextInput1Change = (event) => {
        setTextInput1(event.target.value);
    };

    const handleTextInput2Change = (event) => {
        setTextInput2(event.target.value);
    };


    const handleCategorySelectorChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        setSelectedCategoryOptions(selectedOptions);
    };

    const handlePrioritySelectorChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        setSelectedPriorityOptions(selectedOptions);
    };

    const handleSubmit = () => {
        // Handle submission logic here
        // For example, you can send the data to the server or perform any other action
        console.log('Text Input 1:', textInput1);
        console.log('Text Input 2:', textInput2);
        console.log('Selected Category Options:', selectedCategoryOptions);
        console.log('Selected Priority Options:', selectedPriorityOptions);
        onClose();
    };

    return (
        <div className="popup">
            <div className="popup-inner">
                <h2>Open Tickets</h2>
                <label>
                    Titolo Evento:
                    <input type="text" value={textInput1} onChange={handleTextInput1Change}/>
                </label>
                <label>
                    Descrizione Evento:
                    <input type="text" value={textInput2} onChange={handleTextInput2Change}/>
                </label>
                <label>
                    Category:
                    <select multiple value={selectedCategoryOptions} onChange={handleCategorySelectorChange}>
                        <option value="Phishing">Phishing</option>
                        <option value="Incident">Incident</option>
                        <option value="Early Warning">Early Warning</option>
                        <option value="Data Leakage">Data Leakage</option>
                    </select>
                </label>
                <label>
                    Priority:
                    <select multiple value={selectedPriorityOptions} onChange={handlePrioritySelectorChange}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </label>
                <button onClick={handleSubmit}>Submit</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default PopUpBox;

