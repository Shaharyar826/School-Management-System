# School Management System

A comprehensive School Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication with JWT
- Role-based access control (Admin/Principal/Teacher/Student/Accountant)
- Student management
- Teacher management
- Attendance tracking
- Fee management with arrears support
- Bulk student upload with historical fee generation
- Salary management
- Events and notices
- Meeting notifications
- Profile management

## Production Deployment

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Environment Setup

1. Create a `.env` file in the backend directory based on the `.env.example` template:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

### Automatic Deployment

Run the deployment script to prepare the application for production:

```bash
node deploy.js
```

This script will:
- Install backend dependencies
- Install frontend dependencies
- Build the frontend
- Copy the frontend build to the backend
- Configure the server to serve static files

### Manual Deployment

If you prefer to deploy manually, follow these steps:

1. Install backend dependencies:
   ```bash
   cd backend
   npm install --production
   ```

2. Install frontend dependencies and build:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. Copy the frontend build to the backend:
   ```bash
   mkdir -p ../backend/public
   cp -r build/* ../backend/public/
   ```

4. Start the server:
   ```bash
   cd ../backend
   npm start
   ```

### Security Features

The application includes several security features:

- Helmet.js for setting secure HTTP headers
- Rate limiting to prevent brute force attacks
- CORS protection
- Request body size limits
- Compression for improved performance
- JWT authentication with secure cookies
- Input validation and sanitization

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── templates/
│   ├── utils/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── deploy.js
└── README.md
```

## Bulk Student Upload with Arrears

The system supports bulk student upload with automatic fee record generation:

### Template Columns
- **Standard Fields**: firstName, lastName, rollNumber, class, section, gender, monthlyFee, etc.
- **Arrears Column**: Optional field to specify number of previous months with unpaid fees

### Fee Generation Logic
- Creates fee records from admission date to current month
- Marks last N months as "unpaid" based on arrears value
- Marks earlier months as "paid"
- Current month is always "pending" until due date

### Example
- **Admission Date**: December 2, 2023
- **Arrears**: 5
- **Current Date**: September 2025
- **Result**: 
  - Fee records from January 2024 to September 2025
  - Last 5 months (May-September 2025) marked as unpaid
  - Earlier months (January 2024 - April 2025) marked as paid

## License

This project is licensed under the MIT License.
