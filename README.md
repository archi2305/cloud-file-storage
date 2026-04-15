# Cloud-Based Secure File Storage and Intelligent Sharing System

A beginner-friendly FastAPI backend project for secure file management with user authentication and AWS S3 integration.  
Users can sign up, log in, upload files, list their uploaded files, and download files securely through presigned URLs.

## Features

- User authentication (signup and login)
- File upload support with unique storage keys
- File listing with metadata (filename, owner, upload time)
- Secure file download using AWS S3 presigned URLs
- Clean modular project structure for easy extension

## Tech Stack

- FastAPI
- SQLite
- AWS S3
- boto3
- python-dotenv
- SQLAlchemy

## Setup Instructions

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd cloud-file-storage
```

### 2) Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3) Install dependencies

```bash
pip install -r requirements.txt
```

### 4) Create a `.env` file

Create a file named `.env` in the project root and add your AWS credentials and bucket details.

### 5) Run the server

```bash
uvicorn app.main:app --reload
```

Server will run at: `http://127.0.0.1:8000`  
Interactive docs: `http://127.0.0.1:8000/docs`

## `.env` Example

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name
```

## API Endpoints

### Authentication

- `POST /signup` - Register a new user
- `POST /login` - Log in an existing user

### File Operations

- `POST /upload` - Upload a file (form-data: `email`, `file`)
- `GET /files?email=<user_email>` - List uploaded files for a user
- `GET /download/{filename}` - Get secure download access for a file

## Folder Structure

```text
cloud-file-storage/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── file_routes.py
│   └── storage.py
├── uploads/
├── requirements.txt
├── .env.example
└── README.md
```

## Notes

- This project is intentionally simple and beginner-friendly.
- File storage is powered by AWS S3 through a clean storage abstraction.
- The structure is ready for future enhancements (JWT auth, sharing permissions, notifications, etc.).
