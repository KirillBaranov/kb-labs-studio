import React, { useState } from 'react';

const mockMessages = [
    { id: 1, text: 'Привет! Как я могу помочь вам сегодня?', sender: 'assistant' },
    { id: 2, text: 'Мне нужна помощь с моим проектом.', sender: 'user' },
    { id: 3, text: 'Конечно! Расскажите подробнее.', sender: 'assistant' },
];

const KBAIAssistant = () => {
    const [messages, setMessages] = useState(mockMessages);
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = () => {
        if (inputValue.trim()) {
            const newMessage = { id: messages.length + 1, text: inputValue, sender: 'user' };
            setMessages([...messages, newMessage]);
            setInputValue('');
            // Здесь можно добавить логику для ответа от assistant
        }
    };

    return (
        <div className="kb-ai-assistant">
            <div className="messages">
                {messages.map((message) => (
                    <div key={message.id} className={message.sender === 'user' ? 'message user' : 'message assistant'}>
                        {message.text}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Введите сообщение..."
                />
                <button className="kb-button" onClick={handleSendMessage}>Отправить</button>
            </div>
        </div>
    );
};

export default KBAIAssistant;
