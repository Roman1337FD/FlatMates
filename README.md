# FlatMate.GN

FlatMate.GN is a full-stack web application designed to help students and professionals in Greater Noida find compatible flatmates based on lifestyle, budget, daily habits, and personal preferences.

The application combines profile-based matching, AI compatibility analysis, private messaging, notifications, and profile management into one platform.

## Features

### Authentication

- User registration with email verification OTP
- Secure login using Email or User ID
- Password validation
- Forgot Password with OTP verification
- Password reset flow
- JWT-based authentication
- Protected routes

### User Profiles

- Create and manage personal profile
- Custom User ID
- Profile picture upload
- Profession and gender information
- Target area selection
- Monthly budget range
- Sleep schedule preference
- Food preference
- Smoking preference
- Cleanliness preference
- Personal bio

### Flatmate Matching

- Find registered flatmates
- AI-based compatibility matching
- Matching based on:
  - Preferred area
  - Budget
  - Sleep schedule
  - Food preference
  - Smoking preference
  - Cleanliness
- Match percentage
- Matching habits
- Potential differences
- Fallback compatibility calculation when AI service is unavailable

### Profiles

- View your own profile
- Edit profile information
- View other users' public profiles
- View public User IDs
- View profile pictures
- Profile navigation from flatmate cards and chat

### Private Chat

- One-to-one private messaging
- Real-time messages using Socket.IO
- Message timestamps
- Emoji picker
- Message character limit
- Conversation list
- Profile picture in conversations
- User profile access from chat
- Full profile image preview from chat

### Notifications

- Real-time message notifications
- Unread notification counter
- Notification dropdown
- Mark individual notifications as read
- Mark all notifications as read
- Automatically mark chat notifications as read when opening a conversation

### Security

- JWT authentication
- Protected API routes
- Authenticated Socket.IO connections
- Password hashing with bcrypt
- OTP hashing
- OTP expiry
- OTP attempt limits
- OTP resend cooldown
- Input validation
- Protected user profile updates
- File upload validation and size limits

## Tech Stack

### Frontend

- React
- React Router
- Axios
- Tailwind CSS
- Socket.IO Client
- Emoji Picker
- Vite

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcrypt
- Multer
- Nodemailer

### AI

- Google Gemini API for compatibility matching

## Project Structure

```text
FlatMates/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   │
│   │   ├── components/
│   │   │   ├── MatchCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProfileSetup.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── PublicProfile.jsx
│   │   │   ├── Listings.jsx
│   │   │   ├── Chat.jsx
│   │   │   └── Privacy.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authControllers.js
│   │   ├── matchControllers.js
│   │   ├── messageController.js
│   │   └── notificationController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── models/
│   │   ├── user.js
│   │   ├── messages.js
│   │   ├── notification.js
│   │   └── pendingRegistration.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── uploadRoutes.js
│   │
│   ├── services/
│   │   └── emailService.js
│   │
│   ├── uploads/
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md