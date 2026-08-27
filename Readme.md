# Project Management System

A full-stack project management system that allows users to create and manage projects, collaborate with team members, organize tasks and subtasks, and maintain project notes.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Protected routes
- Role-based access control

### Project Management
- Create and manage projects
- Edit and delete projects
- Project-specific access control
- Project member management

### Task Management
- Create, edit, and delete tasks
- Assign tasks to project members
- Update task status
- Task details page
- File attachments

### Subtask Management
- Create subtasks
- Edit subtasks
- Mark subtasks as completed or pending
- Delete subtasks

### Project Notes
- Add project notes
- Edit notes
- Delete notes
- Track note creator and creation time

### UI
- Responsive design
- Light and dark theme
- Clean project dashboard
- Loading and error states
- Success and error notifications

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Axios
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Other
- Git & GitHub
- REST API
- Postman
- MongoDB Atlas

## Project Structure

```text
project-management-system/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   └── ...
│
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── validators/
│   └── ...
│
└── README.md

Core Functionality

The application follows a REST API architecture where the React frontend communicates with the Express backend through API endpoints.

Users can:

Register and log in.
Create and manage projects.
Add and manage project members.
Create and assign tasks.
Break tasks into subtasks.
Track task and subtask progress.
Upload task attachments.
Add project-specific notes.
Manage project data based on their permissions.
Authentication & Authorization

The application uses JWT authentication to protect API endpoints.

Role-based permissions are used to control actions such as:

Managing projects
Managing project members
Creating and managing tasks
Managing subtasks
Managing project notes
Installation

Clone the repository:

git clone <repository-url>

Install frontend dependencies:

cd client
npm install

Install backend dependencies:

cd ../server
npm install
Environment Variables

Create a .env file in the backend directory and configure the required environment variables.

Example:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Add any additional environment variables required by the project.

Running the Project

Start the backend:

cd server
npm run dev

Start the frontend in a separate terminal:

cd client
npm run dev

The frontend will then be available through the Vite development server.

API

The backend provides REST API endpoints for:

Authentication
Projects
Project members
Tasks
Subtasks
Project notes

The APIs were tested using Postman during development.

Future Improvements
Real-time notifications
Task due dates and priorities
Project activity history
Search and filtering
Pagination
Email notifications
Deployment with production configuration
Author

Misbah Sheikh

Built as a full-stack project to practice React, Node.js, Express, MongoDB, REST APIs, authentication, authorization, and frontend application architecture.