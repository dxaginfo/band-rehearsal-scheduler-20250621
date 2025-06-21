# Band Rehearsal Scheduler

A comprehensive web application designed to help bands and musical groups efficiently manage their rehearsal schedules, track attendance, and optimize rehearsal times.

## Features

- **User Authentication & Management**: Secure login and registration with role-based access control
- **Band Management**: Create and manage multiple bands with customizable membership roles
- **Rehearsal Scheduling**: Schedule single or recurring rehearsals with automatic conflict detection
- **Availability Management**: Members can set their regular availability patterns and exceptions
- **RSVP & Attendance Tracking**: Track member responses and actual attendance
- **Notifications System**: Email and SMS reminders for upcoming rehearsals
- **Optimal Time Suggestions**: AI-powered recommendations for optimal rehearsal times
- **Resource Management**: Attach setlists, sheet music, and reference recordings

## Technology Stack

### Frontend
- React.js with TypeScript
- Redux Toolkit for state management
- Material-UI component library
- FullCalendar.js for calendar views
- Formik with Yup for form validation

### Backend
- Node.js with Express.js
- PostgreSQL database with Sequelize ORM
- Redis for caching and real-time features
- JWT authentication with OAuth 2.0 integration

### DevOps & Infrastructure
- Docker containerization
- CI/CD with GitHub Actions
- AWS hosting (EC2, RDS, S3)
- Sentry for error tracking

## Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL (v13+)
- Redis (v6+)

### Setup Development Environment

1. Clone the repository
   ```bash
   git clone https://github.com/dxaginfo/band-rehearsal-scheduler-20250621.git
   cd band-rehearsal-scheduler-20250621
   ```

2. Install dependencies
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables
   ```bash
   # In the server directory
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

4. Initialize the database
   ```bash
   cd server
   npm run db:migrate
   npm run db:seed
   ```

5. Start the development servers
   ```bash
   # Start backend server (from server directory)
   npm run dev

   # Start frontend server (from client directory)
   npm start
   ```

6. Access the application at `http://localhost:3000`

## Deployment

### Docker Deployment

1. Build the Docker images
   ```bash
   docker-compose build
   ```

2. Start the containers
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

Follow the detailed deployment guide in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

```
band-rehearsal-scheduler/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   ├── src/                # React components and logic
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux state management
│   │   ├── services/       # API service calls
│   │   └── utils/          # Utility functions
│   └── package.json        # Frontend dependencies
├── server/                 # Backend Node.js application
│   ├── src/                # Server source code
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── db/             # Database models and migrations
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── package.json        # Backend dependencies
├── docker-compose.yml      # Docker configuration
├── .github/                # GitHub Actions workflows
└── docs/                   # Documentation files
```

## API Documentation

API documentation is available at `/api/docs` when running the server locally.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

DX AG - dxag.info@gmail.com

Project Link: [https://github.com/dxaginfo/band-rehearsal-scheduler-20250621](https://github.com/dxaginfo/band-rehearsal-scheduler-20250621)