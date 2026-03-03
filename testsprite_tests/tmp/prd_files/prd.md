# Governe AI Deputados - Product Requirements Document

## 1. Product Overview
Governe AI Deputados is a comprehensive political management platform designed for Brazilian congressional representatives (deputados). It provides tools for managing constituents, legislative activities, office operations, and electoral analysis.

## 2. Target Users
- **Admin**: Full system access, user management
- **Vereador/Deputado**: Access to all political management features
- **Assessor**: Limited access to operational features

## 3. Core Features

### 3.1 Authentication
- Login with email and password
- JWT-based authentication
- Role-based access control (admin, vereador, assessor)

### 3.2 Dashboard (Home)
- KPI cards showing key metrics
- Recent activities feed
- Quick navigation to main features

### 3.3 Voter Management
- Register new voters with personal data
- List and search voters
- Edit voter information
- View voter details

### 3.4 Leader Management
- Register community leaders
- Track leader activities
- Associate leaders with cities/regions

### 3.5 Agenda/Appointments
- Schedule appointments
- View calendar of events
- CRUD operations for appointments
- Delete confirmation with modern modal dialogs

### 3.6 Legislative Bills Management
- Track legislative bills (PL, PEC, PLP, PDL, MPV, REQ, INC)
- Bill status tracking (em_tramitação, aprovado, rejeitado, arquivado, retirado)
- Authorship tracking (próprio, coautoria, acompanhamento)

### 3.7 CEAP Expense Tracking
- Record CEAP parliamentary expenses
- Monthly quota tracking with visual progress bar
- Category-based expense classification
- Supplier and document tracking

### 3.8 City Management
- Manage municipalities in Maranhão
- Set voter and leader goals per city
- Population tracking
- IBGE code mapping

### 3.9 Executive Requests
- Manage official requests (ofício, indicação, requerimento)
- Status tracking (enviado, em_análise, respondido, atendido, negado)
- Protocol number tracking

### 3.10 Staff Management
- Register and manage office staff
- Track staff details

### 3.11 Task Management
- Create and assign tasks
- Track task progress

### 3.12 Voting Records
- Track parliamentary voting records
- Historic vote analysis

### 3.13 Political Contacts
- Manage political contacts
- Track relationships (aliado, oposição, neutro)
- Contact details and roles

### 3.14 Election Analysis
- Electoral data visualization
- Municipal vote breakdown
- Historical election comparison

### 3.15 User Administration (Admin)
- Create/edit/delete users
- Activate/deactivate users
- Role assignment
- Filter and search users

## 4. Technical Requirements
- Frontend: React Native (Expo SDK 54) running on web
- Backend: NestJS REST API
- Authentication: JWT tokens
- Local development: Frontend on port 8081, Backend on port 3750

## 5. UI/UX Requirements
- Dark/light theme support
- Modern animated modal dialogs for confirmations and feedback
- Responsive design for web
- Bottom tab navigation for main sections
- Search and filter capabilities on all list pages
