import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

function Chat() {
  const { userId: receiverId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const senderId = localStorage.getItem('userId');

  useEffect(() => {
    if (!senderId) {
      navigate('/login');
      return;
    }

    const socket = io('http://localhost:5000');

    socket.emit('join_user', senderId);

    socket.on('receive_message', (message) => {
      const messageSenderId =
        typeof message.senderId === 'object'
          ? message.senderId._id
          : message.senderId;

      const messageReceiverId =
        typeof message.receiverId === 'object'
          ? message.receiverId._id
          : message.receiverId;

      const isCurrentChat =
        (String(messageSenderId) === String(senderId) &&
          String(messageReceiverId) === String(receiverId)) ||
        (String(messageSenderId) === String(receiverId) &&
          String(messageReceiverId) === String(senderId));

      if (isCurrentChat) {
        setMessages((prev) => {
          const exists = prev.some(
            (item) => item._id === message._id
          );

          if (exists) {
            return prev;
          }

          return [...prev, message];
        });
      }

      if (!receiverId) {
        setConversations((prev) =>
          prev.map((conversation) => {
            if (
              String(conversation.userId) ===
              String(messageSenderId)
            ) {
              return {
                ...conversation,
                lastMessage: message.text,
                lastMessageTime: message.createdAt
              };
            }

            return conversation;
          })
        );
      }
    });

    return () => {
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [senderId, receiverId, navigate]);

  useEffect(() => {
    if (!senderId) {
      return;
    }

    if (receiverId) {
      const markChatNotificationsRead = async () => {
        try {
          await axios.put(
            'http://localhost:5000/api/notifications/chat/read',
            {
              userId: senderId,
              senderId: receiverId
            }
          );
        } catch (error) {
          console.error(
            'Failed to mark chat notifications as read:',
            error
          );
        }
      };

      markChatNotificationsRead();

      return;
    }

    const loadConversations = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `http://localhost:5000/api/chat/conversations?userId=${senderId}`
        );

        setConversations(
          response.data.conversations || []
        );
      } catch (error) {
        console.error(
          'Failed to load conversations:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [senderId, receiverId]);

  useEffect(() => {
    if (!senderId || !receiverId) {
      return;
    }

    const loadChat = async () => {
      try {
        setLoading(true);

        const [messagesResponse, usersResponse] =
          await Promise.all([
            axios.get(
              `http://localhost:5000/api/chat?senderId=${senderId}&receiverId=${receiverId}`
            ),
            axios.get(
              'http://localhost:5000/api/auth/users'
            )
          ]);

        setMessages(messagesResponse.data);

        const users =
          usersResponse.data.users || [];

        const targetUser = users.find(
          (user) =>
            String(user._id) ===
            String(receiverId)
        );

        setReceiver(targetUser || null);
      } catch (error) {
        console.error(
          'Failed to load chat:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [senderId, receiverId]);

  const handleSend = async (e) => {
    e.preventDefault();

    const cleanText = text.trim();

    if (!cleanText || !senderId || !receiverId) {
      return;
    }

    try {
      setSending(true);

      const response = await axios.post(
        'http://localhost:5000/api/chat',
        {
          senderId,
          receiverId,
          text: cleanText
        }
      );

      setMessages((prev) => {
        const exists = prev.some(
          (item) =>
            item._id === response.data._id
        );

        if (exists) {
          return prev;
        }

        return [...prev, response.data];
      });

      setText('');
    } catch (error) {
      console.error(
        'Failed to send message:',
        error
      );

      alert('Message send nahi hua.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
        <div className="text-4xl mb-3">
          💬
        </div>

        <p className="text-slate-600 font-medium">
          Loading...
        </p>
      </div>
    );
  }

  if (!receiverId) {
    return (
      <div className="max-w-3xl mx-auto mt-6">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Messages
          </h1>

          <p className="text-slate-500 mt-1">
            Your private conversations
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-3xl mb-4">
              💬
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              No conversations yet
            </h2>

            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
              When you connect with a flatmate and
              start chatting, your conversations will
              appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/listings')
              }
              className="mt-6 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Find Flatmates
            </button>

          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {conversations.map(
              (conversation) => (
                <button
                  key={conversation.userId}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/chat/${conversation.userId}`
                    )
                  }
                  className="w-full flex items-center gap-4 p-4 md:p-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition text-left"
                >

                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {(conversation.name || 'F')
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center justify-between gap-3">

                      <h2 className="font-bold text-slate-800 truncate">
                        {conversation.name}
                      </h2>

                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {conversation.lastMessageTime
                          ? new Date(
                              conversation.lastMessageTime
                            ).toLocaleDateString()
                          : ''}
                      </span>

                    </div>

                    <p className="text-sm text-slate-500 truncate mt-1">
                      {conversation.lastMessage}
                    </p>

                  </div>

                  <div className="text-slate-400 text-xl">
                    →
                  </div>

                </button>
              )
            )}

          </div>
        )}

      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

      <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-3">

        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
        >
          ←
        </button>

        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
          {(receiver?.name || 'F')
            .charAt(0)
            .toUpperCase()}
        </div>

        <div>
          <h2 className="font-semibold text-lg">
            {receiver?.name || 'Flatmate'}
          </h2>

          <p className="text-xs text-slate-300">
            Private conversation
          </p>
        </div>

      </div>

      <div className="h-[500px] overflow-y-auto p-5 bg-slate-50 space-y-3">

        {messages.length === 0 ? (
          <div className="text-center text-slate-400 mt-20">

            <div className="text-4xl mb-3">
              👋
            </div>

            <p className="font-medium">
              No messages yet
            </p>

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
              String(messageSenderId) ===
              String(senderId);

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
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                  }`}
                >
                  <p>
                    {message.text}
                  </p>

                  <p
                    className={`text-[10px] mt-1 ${
                      isMine
                        ? 'text-indigo-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {message.createdAt
                      ? new Date(
                          message.createdAt
                        ).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit'
                          }
                        )
                      : ''}
                  </p>
                </div>

              </div>
            );
          })
        )}

      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-3 p-4 border-t border-slate-200 bg-white"
      >

        <input
          type="text"
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={
            sending || !text.trim()
          }
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {sending ? '...' : 'Send'}
        </button>

      </form>

    </div>
  );
}

export default Chat;