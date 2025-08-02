
# Vitalit OS - Enterprise Hospital Management System

A comprehensive, production-ready hospital management system built with FastAPI, React, and modern web technologies.

## 🚀 Features

### 🔐 Enhanced Authentication & Security
- **Multi-Factor Authentication (MFA)** with TOTP
- **Password strength validation** with comprehensive rules
- **Session management** with refresh tokens
- **Account lockout protection** after failed attempts
- **Role-based access control** with granular permissions
- **Audit logging** for all security events

### 👥 Advanced Patient Management
- **Advanced patient search & filtering** with multiple criteria
- **Medical history timeline** with complete patient journey
- **Document upload system** for X-rays, lab reports, prescriptions
- **Emergency contact management** with quick access
- **Patient analytics dashboard** with demographics and trends

### 📅 Smart Appointment Scheduling
- **Calendar integration** with real-time availability
- **Automated conflict detection** to prevent double-booking
- **Smart slot finding** with preferred time optimization
- **Automated reminders** via email and SMS
- **Waitlist management** for cancellations
- **Doctor workload analytics**

### 📋 Comprehensive EHR System
- **Structured medical records** with specialty-specific templates
- **Progress tracking** over time with condition monitoring
- **Lab results integration** and document management
- **Export capabilities** in multiple formats (JSON, HTML, PDF)
- **Advanced search** with filters and date ranges
- **Condition analytics** and trend analysis

### 💰 Automated Billing & Insurance
- **Automated bill generation** based on appointments and services
- **Insurance claim processing** with coverage calculation
- **Payment gateway integration** with Stripe
- **Financial reporting** with revenue analytics
- **Outstanding bill tracking** and automated reminders
- **Multiple payment methods** support

### 📊 Analytics & Reporting
- **Real-time dashboard** with key performance indicators
- **Revenue analytics** with payment method breakdown
- **Patient demographics** and insurance coverage analysis
- **Doctor performance reports** with appointment metrics
- **Financial reports** with outstanding bill tracking
- **Custom date range reporting**

### 💬 Communication Hub
- **Internal messaging system** for staff communication
- **Email and SMS notifications** for patients and staff
- **Patient portal** with appointment and bill access
- **Broadcast messaging** to staff or patients
- **Notification management** with read/unread tracking

### 📦 Inventory Management
- **Automated reordering** with minimum quantity alerts
- **Expiry tracking** for medications and supplies
- **Supplier management** with contact information
- **Transaction history** with audit trails
- **Cost optimization** with usage analytics

## 🛠 Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **Celery** - Background task processing
- **Stripe** - Payment processing
- **JWT** - Authentication tokens

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management
- **Zustand** - State management
- **Recharts** - Data visualization

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer
- **PostgreSQL** - Production database
- **Redis** - Production caching
- **GitHub Actions** - CI/CD pipeline

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.10+

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/vitalit-os.git
cd vitalit-os
```

2. **Start the development environment**
```bash
# Start backend services
docker-compose -f docker-compose.dev.yml up -d

# Install frontend dependencies
cd frontend
npm install

# Start frontend development server
npm run dev

# Start backend development server
cd ../backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Production Deployment

1. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Configure production settings
# - Database URLs
# - Stripe API keys
# - SMTP settings
# - Security keys
```

2. **Deploy with Docker**
```bash
# Build and start production services
docker-compose up -d

# Run database migrations
docker-compose exec backend alembic upgrade head

# Seed initial data
docker-compose exec backend python -m backend.seed_data
```

## 📁 Project Structure

```
vitalit-os/
├── backend/                 # FastAPI backend
│   ├── routers/            # API route handlers
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth_enhanced.py    # Enhanced authentication
│   └── main.py             # FastAPI application
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── api/          # API client functions
│   │   └── types.ts      # TypeScript types
│   └── package.json
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Development services
└── README.md
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/vitalit_os
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key
REFRESH_SECRET_KEY=your-refresh-secret-key

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application
API_PREFIX=
LOG_LEVEL=INFO
```

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - Enhanced login with MFA support
- `POST /auth/login/mfa` - Login with MFA verification
- `POST /auth/refresh` - Refresh access tokens
- `POST /auth/mfa/setup` - Setup MFA for user
- `POST /auth/change-password` - Change password

### Patients
- `GET /patients/` - Advanced patient search with filtering
- `GET /patients/{id}/history` - Complete medical history
- `GET /patients/{id}/timeline` - Patient timeline
- `POST /patients/{id}/documents` - Upload patient documents
- `GET /patients/analytics/overview` - Patient analytics

### Appointments
- `POST /appointments/smart-schedule` - Smart appointment scheduling
- `GET /appointments/available-slots/{doctor_id}` - Available slots
- `GET /appointments/conflicts/{doctor_id}` - Check scheduling conflicts
- `GET /appointments/calendar/{doctor_id}` - Doctor calendar
- `POST /appointments/{id}/remind` - Send appointment reminder

### EHR
- `GET /ehr/templates` - Available EHR templates
- `POST /ehr/records/structured` - Create structured medical record
- `GET /ehr/progress/{patient_id}` - Patient progress tracking
- `GET /ehr/analytics/conditions` - Condition analytics
- `GET /ehr/records/{id}/export` - Export medical record

### Billing
- `POST /billing/generate-bill` - Generate automated bill
- `POST /billing/insurance/claim` - Process insurance claim
- `POST /billing/payment/create-intent` - Create payment intent
- `POST /billing/payment/process` - Process payment
- `GET /billing/reports/revenue` - Revenue reports

### Analytics
- `GET /analytics/dashboard/overview` - Dashboard overview
- `GET /analytics/dashboard/appointments` - Appointment metrics
- `GET /analytics/dashboard/financial` - Financial metrics
- `GET /analytics/dashboard/patients` - Patient metrics
- `GET /analytics/reports/performance` - Performance reports

### Communication
- `POST /communication/messages/send` - Send internal message
- `GET /communication/messages/inbox` - Get inbox messages
- `POST /communication/notifications/send` - Send notifications
- `POST /communication/broadcast` - Send broadcast message
- `GET /communication/portal/appointments/{patient_id}` - Patient portal

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Multi-Factor Authentication** with TOTP
- **Password strength validation** with comprehensive rules
- **Account lockout protection** after failed attempts
- **Session management** with automatic cleanup
- **Role-based access control** with granular permissions
- **Audit logging** for all security events
- **HTTPS enforcement** in production
- **CORS configuration** for secure cross-origin requests

## 📈 Performance & Scalability

- **Database indexing** for optimal query performance
- **Redis caching** for frequently accessed data
- **Background task processing** with Celery
- **Connection pooling** for database efficiency
- **API rate limiting** to prevent abuse
- **Horizontal scaling** support with load balancing
- **Monitoring and logging** for performance tracking

## 🧪 Testing

```bash
# Run backend tests
cd backend
pytest

# Run frontend tests
cd frontend
npm test

# Run integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@vitalit-os.com
- Documentation: https://docs.vitalit-os.com

## 🚀 Roadmap

- [ ] Mobile application (React Native)
- [ ] AI-powered diagnostic assistance
- [ ] Telemedicine integration
- [ ] Advanced reporting and analytics
- [ ] Third-party integrations (labs, pharmacies)
- [ ] Multi-language support
- [ ] Advanced inventory automation
- [ ] Patient satisfaction surveys
- [ ] Advanced security features
- [ ] Performance optimization

---

**Built with ❤️ for modern healthcare management**
