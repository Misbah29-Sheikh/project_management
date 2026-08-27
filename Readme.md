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