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

  const [showImagePreview, setShowImagePreview] =
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

  const openReceiverProfile =
    () => {
      if (!receiver?._id) {
        return;
      }

      navigate(
        `/profile/${receiver._id}`
      );
    };

  const openImagePreview =
    () => {
      if (!receiver?.profileImage) {
        return;
      }

      setShowImagePreview(true);
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 flex items-center justify-center px-4">

        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-7 text-center">

          <div className="w-10 h-10 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin mb-4"></div>

          <div className="text-3xl mb-2">
            💬
          </div>

          <p className="text-slate-700 font-semibold">
            Loading...
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Please wait a moment.
          </p>

        </div>

      </div>
    );
  }

  if (!receiverId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 px-4 py-6 sm:py-8">

        <div className="max-w-4xl mx-auto">

          <div className="mb-7">

            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
              💬 Messages
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-3">
              Your Conversations
            </h1>

            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Stay connected with your flatmates.
            </p>

          </div>

          {conversations.length === 0 ? (
            <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-10 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-50 to-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl mb-5">
                💬
              </div>

              <h2 className="text-xl font-bold text-slate-800">
                No conversations yet
              </h2>

              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                When you connect with a flatmate and start chatting, your conversations will appear here.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate('/listings')
                }
                className="mt-6 bg-indigo-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
              >
                Find Flatmates
              </button>

            </div>
          ) : (
            <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm overflow-hidden">

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
                    className="w-full flex items-center gap-4 p-4 sm:p-5 border-b border-slate-100 last:border-b-0 hover:bg-indigo-50/40 transition-colors text-left"
                  >

                    {conversation.profileImage ? (
                      <img
                        src={
                          conversation.profileImage
                        }
                        alt={`${conversation.name || 'User'} profile`}
                        className="w-12 h-12 rounded-full object-cover border border-indigo-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
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

                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-lg flex-shrink-0">
                      →
                    </div>

                  </button>
                )
              )}

            </div>
          )}

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 px-3 sm:px-4 py-4 sm:py-6">

      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-3xl shadow-sm border border-indigo-100 overflow-hidden">

          <div className="bg-gradient-to-r from-rose-200 via-pink-200 to-indigo-300 px-4 sm:px-5 py-4">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate('/chat')
                }
                className="w-9 h-9 rounded-xl bg-white/60 hover:bg-white/80 text-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
              >
                ←
              </button>

              <button
                type="button"
                onClick={
                  openImagePreview
                }
                disabled={
                  !receiver?.profileImage
                }
                className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-white/80 disabled:cursor-default"
                title={
                  receiver?.profileImage
                    ? 'View profile photo'
                    : ''
                }
              >

                {receiver?.profileImage ? (
                  <img
                    src={
                      receiver.profileImage
                    }
                    alt={`${receiver.name || 'Flatmate'} profile`}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-white text-indigo-500 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                    {(receiver?.name ||
                      'F')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

              </button>

              <button
                type="button"
                onClick={
                  openReceiverProfile
                }
                className="min-w-0 text-left rounded-xl px-1.5 py-1 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/70"
                title="View profile"
              >

                <h2 className="font-bold text-slate-800 text-lg truncate">
                  {receiver?.name ||
                    'Flatmate'}
                </h2>

                <div className="flex items-center gap-2">

                  <p className="text-xs text-slate-600">
                    Private conversation
                  </p>

                  {receiver?.userId && (
                    <>
                      <span className="text-slate-400">
                        •
                      </span>

                      <p className="text-xs text-slate-600 truncate">
                        @{receiver.userId}
                      </p>
                    </>
                  )}

                </div>

              </button>

            </div>

          </div>

          <div
            ref={
              messagesContainerRef
            }
            className="h-[500px] overflow-y-auto p-4 sm:p-5 bg-gradient-to-b from-slate-50 to-indigo-50/40 space-y-3"
          >

            {messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-20">

                <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-3xl mb-4 shadow-sm">
                  👋
                </div>

                <p className="font-semibold text-slate-600">
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
                      key={
                        message._id
                      }
                      className={`flex ${
                        isMine
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >

                      <div
                        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMine
                            ? 'bg-indigo-500 text-white rounded-br-sm'
                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                        }`}
                      >

                        <p className="break-words leading-relaxed">
                          {message.text}
                        </p>

                        <p
                          className={`text-[10px] mt-1 ${
                            isMine
                              ? 'text-indigo-100'
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
            className="relative flex gap-2 p-3 sm:p-4 border-t border-slate-100 bg-white"
          >

            {showEmojiPicker && (
              <div className="absolute bottom-20 left-3 z-50 shadow-lg">

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
              className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100 text-xl sm:text-2xl flex items-center justify-center transition-colors"
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
              className="flex-1 min-w-0 px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={
                sending ||
                !text.trim()
              }
              className="bg-indigo-500 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      </div>

      {showImagePreview &&
        receiver?.profileImage && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            onClick={() =>
              setShowImagePreview(false)
            }
          >

            <button
              type="button"
              onClick={() =>
                setShowImagePreview(false)
              }
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white text-2xl flex items-center justify-center"
              aria-label="Close image preview"
            >
              ×
            </button>

            <img
              src={
                receiver.profileImage
              }
              alt={`${receiver.name || 'Flatmate'} profile`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            />

          </div>
        )}

    </div>
  );
}

export default Chat;