
# VITALIt OS - Enterprise Hospital Management System

A modern, full-stack hospital management system built with Next.js frontend and FastAPI backend, featuring Apple-like design aesthetics and enterprise-grade architecture.

## 🚀 Features

- **Modern UI/UX**: Apple-inspired design with glassmorphism, gradients, and smooth animations
- **Full Authentication**: JWT-based authentication with role-based access control
- **Real-time Dashboard**: Dynamic statistics and key performance indicators
- **Patient Management**: Comprehensive patient records and history
- **Appointment Scheduling**: Advanced appointment booking and management
- **Billing System**: Integrated billing and payment processing
- **Inventory Management**: Medical supplies and equipment tracking
- **Electronic Health Records**: Secure patient data management
- **Analytics Dashboard**: Data visualization and reporting
- **System Administration**: User management and system configuration

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Context** - State management
- **Framer Motion** - Smooth animations

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **SQLite** - Database (configurable for PostgreSQL/MySQL)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.10+
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vitalit-os
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

5. **Initialize database**
   ```bash
   cd backend
   python init_db.py
   python create_admin.py
   ```

6. **Start backend server**
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start frontend server**
   ```bash
   npm run dev
   ```

## 🔐 Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Dashboard**: http://localhost:3000/dashboard

## 📁 Project Structure

```
vitalit-os/
├── backend/                 # FastAPI backend
│   ├── routers/            # API route handlers
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # Authentication logic
│   ├── config.py           # Configuration settings
│   └── main.py             # FastAPI application
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── types.ts       # TypeScript types
│   └── package.json
├── requirements.txt        # Python dependencies
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables
```bash
# Database
DATABASE_URL=sqlite:///./hospital.db

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]

# API
TITLE=Vitalit OS API
VERSION=1.0.0
```

### Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication
NEXT_PUBLIC_AUTH_ENABLED=true
```

## 🚀 Deployment

### Backend Deployment
1. Set up production database (PostgreSQL/MySQL)
2. Configure environment variables
3. Use production WSGI server (Gunicorn)
4. Set up reverse proxy (Nginx)

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Configure environment variables

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention

## 📊 API Endpoints

### Authentication
- `POST /auth/token` - Login and get access token
- `POST /auth/refresh` - Refresh access token

### Patients
- `GET /patients` - List all patients
- `POST /patients` - Create new patient
- `GET /patients/{id}` - Get patient details
- `PUT /patients/{id}` - Update patient
- `DELETE /patients/{id}` - Delete patient

### Appointments
- `GET /appointments` - List appointments
- `POST /appointments` - Create appointment
- `GET /appointments/{id}` - Get appointment details
- `PUT /appointments/{id}` - Update appointment
- `DELETE /appointments/{id}` - Cancel appointment

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/analytics` - Get analytics data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the codebase structure

## 🔄 Development Workflow

1. **Backend Development**
   ```bash
   cd backend
   source ../venv/bin/activate
   python -m uvicorn main:app --reload
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Database Changes**
   ```bash
   cd backend
   python init_db.py  # Recreate tables
   python create_admin.py  # Create admin user
   ```

## 🎯 Roadmap

- [ ] Multi-tenant architecture
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Integration with medical devices
- [ ] Telemedicine features
- [ ] Advanced analytics
- [ ] Audit logging
- [ ] Backup and recovery

---

**Built with ❤️ for modern healthcare management**
