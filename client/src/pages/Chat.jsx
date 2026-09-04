import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import api from '../api/axios';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

const MAX_MESSAGE_LENGTH = 1000;

function Chat() {
  const { userId: receiverId } =
    useParams();

  const navigate = useNavigate();

  const [conversations, setConversations] =
    useState([]);

  const [messages, setMessages] =
    useState([]);

  const [receiver, setReceiver] =
    useState(null);

  const [text, setText] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const messagesContainerRef =
    useRef(null);

  const senderId =
    localStorage.getItem('userId');

  const token =
    localStorage.getItem('token');

  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    'http://localhost:5000';

  useEffect(() => {
    if (!senderId || !token) {
      navigate('/login');
      return;
    }

    const socket = io(
      socketUrl,
      {
        auth: {
          token
        }
      }
    );

    socket.on(
      'connect',
      () => {
        console.log(
          'Socket connected:',
          socket.id
        );
      }
    );

    socket.on(
      'connect_error',
      (error) => {
        console.error(
          'Socket connection error:',
          error.message
        );
      }
    );

    socket.on(
      'receive_message',
      (message) => {
        const messageSenderId =
          typeof message.senderId ===
          'object'
            ? message.senderId?._id
            : message.senderId;

        const messageReceiverId =
          typeof message.receiverId ===
          'object'
            ? message.receiverId?._id
            : message.receiverId;

        const isCurrentChat =
          (String(messageSenderId) ===
            String(senderId) &&
            String(messageReceiverId) ===
            String(receiverId)) ||
          (String(messageSenderId) ===
            String(receiverId) &&
            String(messageReceiverId) ===
            String(senderId));

        if (isCurrentChat) {
          setMessages((prev) => {
            const exists = prev.some(
              (item) =>
                String(item._id) ===
                String(message._id)
            );

            if (exists) {
              return prev;
            }

            return [
              ...prev,
              message
            ];
          });

          if (
            String(messageSenderId) ===
            String(receiverId)
          ) {
            api.put(
              '/notifications/chat/read',
              {
                senderId: receiverId
              }
            )
              .then(() => {
                window.dispatchEvent(
                  new CustomEvent(
                    'notifications-updated',
                    {
                      detail: {
                        senderId:
                          receiverId
                      }
                    }
                  )
                );
              })
              .catch((error) => {
                console.error(
                  'Failed to mark incoming message notification as read:',
                  error
                );
              });
          }
        }

        if (!receiverId) {
          setConversations((prev) => {
            const existingConversation =
              prev.find(
                (conversation) =>
                  String(
                    conversation.userId
                  ) ===
                  String(messageSenderId)
              );

            if (existingConversation) {
              return prev.map(
                (conversation) => {
                  if (
                    String(
                      conversation.userId
                    ) ===
                    String(messageSenderId)
                  ) {
                    return {
                      ...conversation,
                      lastMessage:
                        message.text,
                      lastMessageTime:
                        message.createdAt
                    };
                  }

                  return conversation;
                }
              );
            }

            return prev;
          });
        }
      }
    );

    return () => {
      socket.off(
        'receive_message'
      );

      socket.off(
        'connect'
      );

      socket.off(
        'connect_error'
      );

      socket.disconnect();
    };
  }, [
    senderId,
    token,
    receiverId,
    navigate,
    socketUrl
  ]);

  useEffect(() => {
    if (!senderId || !token) {
      return;
    }

    if (receiverId) {
      const markChatNotificationsRead =
        async () => {
          try {
            await api.put(
              '/notifications/chat/read',
              {
                senderId: receiverId
              }
            );

            window.dispatchEvent(
              new CustomEvent(
                'notifications-updated',
                {
                  detail: {
                    senderId:
                      receiverId
                  }
                }
              )
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

    const loadConversations =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get(
              '/chat/conversations'
            );

          const conversationData =
            response.data?.conversations ||
            [];

          const enrichedConversations =
            await Promise.all(
              conversationData.map(
                async (
                  conversation
                ) => {
                  try {
                    const profileResponse =
                      await api.get(
                        `/auth/public-profile/${encodeURIComponent(
                          conversation.userId
                        )}`
                      );

                    const profile =
                      profileResponse.data?.user ||
                      profileResponse.data;

                    return {
                      ...conversation,
                      profileImage:
                        profile?.profileImage ||
                        ''
                    };
                  } catch (profileError) {
                    console.error(
                      `Failed to load profile image for ${conversation.name}:`,
                      profileError
                    );

                    return {
                      ...conversation,
                      profileImage: ''
                    };
                  }
                }
              )
            );

          setConversations(
            enrichedConversations
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
  }, [
    senderId,
    token,
    receiverId
  ]);

  useEffect(() => {
    if (
      !senderId ||
      !token ||
      !receiverId
    ) {
      return;
    }

    const loadChat = async () => {
      try {
        setLoading(true);

        const [
          messagesResponse,
          receiverResponse
        ] = await Promise.all([
          api.get(
            `/chat?receiverId=${encodeURIComponent(
              receiverId
            )}`
          ),
          api.get(
            `/auth/public-profile/${encodeURIComponent(
              receiverId
            )}`
          )
        ]);

        setMessages(
          Array.isArray(
            messagesResponse.data
          )
            ? messagesResponse.data
            : []
        );

        setReceiver(
          receiverResponse.data?.user ||
            receiverResponse.data ||
            null
        );
      } catch (error) {
        console.error(
          'Failed to load chat:',
          error
        );

        setMessages([]);
        setReceiver(null);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [
    senderId,
    token,
    receiverId
  ]);

  useEffect(() => {
    if (
      !loading &&
      receiverId
    ) {
      requestAnimationFrame(() => {
        const container =
          messagesContainerRef.current;

        if (container) {
          container.scrollTop =
            container.scrollHeight;
        }
      });
    }
  }, [
    messages,
    loading,
    receiverId
  ]);

  const handleEmojiClick = (
    emojiData
  ) => {
    setText((prev) => {
      const updated =
        prev + emojiData.emoji;

      return updated.slice(
        0,
        MAX_MESSAGE_LENGTH
      );
    });

    setShowEmojiPicker(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();

    const cleanText =
      text.trim();

    if (
      !cleanText ||
      !senderId ||
      !token ||
      !receiverId
    ) {
      return;
    }

    if (
      cleanText.length >
      MAX_MESSAGE_LENGTH
    ) {
      alert(
        `Message must be ${MAX_MESSAGE_LENGTH} characters or less.`
      );
      return;
    }

    if (
      String(senderId) ===
      String(receiverId)
    ) {
      alert(
        'You cannot message yourself.'
      );
      return;
    }

    try {
      setSending(true);

      const response =
        await api.post(
          '/chat',
          {
            receiverId,
            text: cleanText
          }
        );

      if (!response.data?._id) {
        throw new Error(
          'Invalid message response'
        );
      }

      setMessages((prev) => {
        const exists = prev.some(
          (item) =>
            String(item._id) ===
            String(
              response.data._id
            )
        );

        if (exists) {
          return prev;
        }

        return [
          ...prev,
          response.data
        ];
      });

      setText('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error(
        'Failed to send message:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Message send nahi hua.'
      );
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
                  key={
                    conversation.userId
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      `/chat/${conversation.userId}`
                    )
                  }
                  className="w-full flex items-center gap-4 p-4 md:p-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition text-left"
                >

                  {conversation.profileImage ? (
                    <img
                      src={
                        conversation.profileImage
                      }
                      alt={`${conversation.name || 'User'} profile`}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {(
                        conversation.name ||
                        'F'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

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
                      {
                        conversation.lastMessage
                      }
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
          onClick={() =>
            navigate('/chat')
          }
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
        >
          ←
        </button>

        {receiver?.profileImage ? (
          <img
            src={receiver.profileImage}
            alt={`${receiver.name || 'Flatmate'} profile`}
            className="w-10 h-10 rounded-full object-cover border border-white/20"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
            {(receiver?.name || 'F')
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        <div>

          <h2 className="font-semibold text-lg">
            {receiver?.name ||
              'Flatmate'}
          </h2>

          <p className="text-xs text-slate-300">
            Private conversation
          </p>

        </div>

      </div>

      <div
        ref={messagesContainerRef}
        className="h-[500px] overflow-y-auto p-5 bg-slate-50 space-y-3"
      >

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
          messages.map(
            (message) => {
              const messageSenderId =
                typeof message.senderId ===
                'object'
                  ? message.senderId?._id
                  : message.senderId;

              const isMine =
                String(
                  messageSenderId
                ) ===
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

                    <p className="break-words">
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
            }
          )
        )}

      </div>

      <form
        onSubmit={handleSend}
        className="relative flex gap-2 p-4 border-t border-slate-200 bg-white"
      >

        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-50">

            <EmojiPicker
              onEmojiClick={
                handleEmojiClick
              }
              width={320}
              height={400}
            />

          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setShowEmojiPicker(
              (prev) => !prev
            )
          }
          className="w-12 h-12 flex-shrink-0 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-2xl flex items-center justify-center transition"
          title="Add emoji"
        >
          😊
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) =>
            setText(
              e.target.value.slice(
                0,
                MAX_MESSAGE_LENGTH
              )
            )
          }
          maxLength={
            MAX_MESSAGE_LENGTH
          }
          placeholder="Type a message..."
          className="flex-1 min-w-0 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={
            sending ||
            !text.trim()
          }
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {sending
            ? '...'
            : 'Send'}
        </button>

      </form>

      {text.length > 0 && (
        <div className="px-4 pb-3 text-right text-xs text-slate-400">
          {text.length}/{MAX_MESSAGE_LENGTH}
        </div>
      )}

    </div>
  );
}

export default Chat;