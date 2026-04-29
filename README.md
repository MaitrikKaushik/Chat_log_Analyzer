# Chat Log Analyzer

A comprehensive Node.js and Express backend application designed to analyze chat logs. It incorporates real-time chat functionality, user authentication, sentiment analysis, and file uploads.

## Features

* **User Authentication & Authorization**: Secure login and registration using Passport.js, Express Session, and JWT. Passwords are encrypted using bcryptjs.
* **Real-time Chat**: Interactive chat rooms powered by Socket.io for live communication.
* **Sentiment Analysis**: Analyze chat messages or logs to determine the overall sentiment (positive, negative, or neutral) using the `sentiment` package.
* **File Uploads**: Supports uploading chat log files securely utilizing Multer.
* **Database Integration**: MongoDB integration via Mongoose for storing user profiles and chat history.
* **Server-side Rendering**: EJS templating engine is used for dynamic and responsive frontend views.

## Technologies Used

* **Backend**: Node.js, Express.js
* **Database**: MongoDB, Mongoose, Connect-Mongo (for session storage)
* **Authentication**: Passport.js, JSON Web Tokens (JWT), express-session
* **Real-time Engine**: Socket.io
* **File Handling**: Multer
* **Templating**: EJS (Embedded JavaScript)
* **Utilities**: Bcryptjs (password hashing), dotenv (environment variables management)

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v14 or higher)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MaitrikKaushik/Chat_log_Analyzer.git
   ```
2. Navigate into the project directory:
   ```bash
   cd Chat-Log-Analyzer
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret
```

### Running the Application

* **Development mode** (uses nodemon to auto-restart on changes):
  ```bash
  npm run dev
  ```
* **Production mode**:
  ```bash
  npm start
  ```

Once the server is running, you can access the application at `http://localhost:3000`.

## License

This project is licensed under the ISC License.
