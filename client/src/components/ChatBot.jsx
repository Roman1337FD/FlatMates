import { useEffect, useState } from 'react';
import axios from 'axios';

function ChatBot({ receiverId, receiverName = 'Flatmate' }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const senderId = localStorage.getItem('userId');

  useEffect(() => {
    if (!senderId || !receiverId) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chat?senderId=${senderId}&receiverId=${receiverId}`
        );

        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    fetchMessages();
  }, [receiverId, senderId]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!text.trim() || !senderId || !receiverId) return;

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/chat',
        {
          senderId,
          receiverId,
          text: text.trim()
        }
      );

      setMessages((prev) => [...prev, response.data]);
      setText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Message send nahi hua.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
      
      <div className="bg-slate-900 text-white px-4 py-3">
        <h3 className="font-semibold">Chat with {receiverName}</h3>
        <p className="text-xs text-slate-300">
          FlatMate Chat
        </p>
      </div>

      <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400 mt-10">
            No messages yet.
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === senderId;

            return (
              <div
                key={message._id}
                className={`flex ${
                  isMine ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                    isMine
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2 p-3 border-t border-slate-200"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatBot;