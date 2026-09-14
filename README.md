# Taskflow

**The Warehouse Task Delegating App**

Taskflow is a **ticketing system** and **to-do list** application designed specifically for **warehouse environments**. It streamlines task delegation, allowing teams to manage, track, and complete tasks efficiently.

---

## Features

- **Task Delegation**: Assign tasks to team members with clear priorities and deadlines.
- **Ticketing System**: Create, track, and resolve tickets for warehouse operations.
- **To-Do Lists**: Organize daily tasks and track progress in real-time.
- **Warehouse Optimization**: Tailored for warehouse workflows, improving productivity and accountability.

---

## Project Structure

```
taskflow/
├── backend_flask/       # Flask-based backend API
├── frontend_react/      # React-based frontend application
├── docker-compose.yml   # Docker configuration for PostgreSQL
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

---

## Getting Started

### Prerequisites

- Docker
- Docker Compose
- Node.js (for frontend)
- Python 3.x (for backend)

### Installation

1. **Clone the Repository**
  ```bash
   git clone https://github.com/Floris-1096069/taskflow.git
   cd taskflow
  ```
2. **Set Up the Backend**  
 Navigate to the `backend_flask` directory and install dependencies:
  ```bash
   cd backend_flask
   pip install -r requirements.txt
  ```

   Start the Flask server:
3. **Set Up the Frontend**  
 Navigate to the `frontend_react` directory and install dependencies:
  ```bash
   cd ../frontend_react
   npm install
  ```

   Start the React development server:
4. **Run with Docker**  
 Use Docker Compose to set up the PostgreSQL database and other services:
  ```bash
   docker-compose up -d
  ```

---

## Usage

- Access the frontend at `http://localhost:3000` (or the port configured in your React app).
- Use the backend API at `http://localhost:5000` (or the port configured in your Flask app).
- Log in with your credentials and start delegating tasks or creating tickets.

---

## Contributing

Contributions are welcome! Open an issue or submit a pull request for any improvements or bug fixes.

---

## License

This project is open-source and available for use under the [MIT License](LICENSE).
