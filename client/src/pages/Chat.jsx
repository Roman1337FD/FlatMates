import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Chat() {
  const { userId: receiverId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const senderId = localStorage.getItem('userId');

  useEffect(() => {
    if (!senderId || !receiverId) {
      navigate('/login');
      return;
    }

    const loadChat = async () => {
      try {
        const [messagesResponse, usersResponse] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/chat?senderId=${senderId}&receiverId=${receiverId}`
          ),
          axios.get(
            'http://localhost:5000/api/auth/users'
          )
        ]);

        setMessages(messagesResponse.data);

        const users = usersResponse.data.users || [];

        const targetUser = users.find(
          (user) => String(user._id) === String(receiverId)
        );

        setReceiver(targetUser);
      } catch (error) {
        console.error('Failed to load chat:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [receiverId, senderId, navigate]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!text.trim() || !senderId || !receiverId) {
      return;
    }

    try {
      setSending(true);

      const response = await axios.post(
        'http://localhost:5000/api/chat',
        {
          senderId,
          receiverId,
          text: text.trim()
        }
      );

      setMessages((prev) => [
        ...prev,
        response.data
      ]);

      setText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Message send nahi hua.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow border border-slate-200 p-8 text-center">
        <p className="text-slate-600">
          Loading chat...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">

        <div>
          <h2 className="font-semibold text-lg">
            Chat with {receiver?.name || 'Flatmate'}
          </h2>

          <p className="text-xs text-slate-300">
            FlatMate Chat
          </p>
        </div>

        <button
          onClick={() => navigate('/listings')}
          className="text-sm bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-600"
        >
          Back
        </button>

      </div>

      <div className="h-[500px] overflow-y-auto p-5 bg-slate-50 space-y-3">

        {messages.length === 0 ? (
          <div className="text-center text-slate-400 mt-20">
            <p>No messages yet.</p>
            <p className="text-sm mt-1">
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {

            const messageSenderId =
              typeof message.senderId === 'object'
                ? message.senderId._id
                : message.senderId;

            const isMine =
              String(messageSenderId) === String(senderId);

            return (
              <div
                key={message._id}
                className={`flex ${
                  isMine
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >

                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
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
        className="flex gap-3 p-4 border-t border-slate-200"
      >

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={sending}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {sending ? '...' : 'Send'}
        </button>

      </form>

    </div>
  );
}

export default Chat;