# CVCompare 🎯

**An AI-powered resume optimization platform that analyzes resumes against job descriptions and provides intelligent ATS scoring with personalized improvement recommendations.**

CVCompare helps job seekers optimize their resumes for Applicant Tracking Systems (ATS) by providing detailed analysis, scoring, and AI-driven suggestions to improve their chances of landing interviews.

## ✨ Key Features

### 📄 **Smart Resume Analysis**
- Upload PDF resumes with support for multiple formats
- Advanced parsing and text extraction
- Detailed content analysis and structure evaluation

### 🎯 **ATS Score Calculation**
- Sophisticated weighted scoring algorithm
- Real-time scoring with customizable weights
- Detailed breakdown by category (Skills, Experience, Education, Summary)

### 🔍 **Job Description Matching**
- Semantic analysis against job requirements
- Keyword matching and optimization suggestions
- Skills gap identification and recommendations

### 🤖 **AI-Powered Chat Assistant**
- Interactive chat interface for personalized advice
- Powered by Google Gemini AI
- Context-aware suggestions and improvements

### 👤 **User Management & History**
- Secure authentication with Clerk
- Resume analysis history tracking
- File management with UploadThing integration

### 📊 **Interactive Dashboards**
- Visual ATS score displays with progress indicators
- Section-by-section breakdown analysis
- Customizable scoring weights and formulas

## 🏗️ Technical Architecture

### 🔧 **Backend** (`/backend`)
- **Framework**: FastAPI 0.104.1 with async/await support
- **AI Integration**: Google Gemini 2.0 Flash for resume analysis and chat
- **LangChain Framework**: LangChain for AI model orchestration and chat message handling
- **Database**: MongoDB with Beanie ODM for document management
- **File Processing**: PyPDF2 for PDF parsing, python-docx for Word documents
- **Authentication**: JWT token validation with Clerk integration
- **Vector Store**: Semantic search capabilities for enhanced matching
- **API Design**: RESTful endpoints with comprehensive error handling

### 🎨 **Frontend** (`/client`)
- **Framework**: Next.js 15 with App Router and TypeScript
- **UI Library**: Tailwind CSS 4.0 with shadcn/ui components
- **Authentication**: Clerk for secure user management
- **File Upload**: UploadThing for reliable file handling
- **PDF Rendering**: pdfjs-dist for in-browser PDF viewing

### 🔄 **Data Flow**
1. **File Upload** → UploadThing → Secure Storage
2. **PDF Processing** → PyPDF2 → Text Extraction
3. **AI Analysis** → LangChain + Gemini AI → Structured Results
4. **Database Storage** → MongoDB → Historical Data
5. **Real-time Updates** → WebSocket → Live Chat Interface

## 📋 Prerequisites

### System Requirements
- **Python**: 3.8 or higher
- **Node.js**: 22 or higher  
- **npm**: 8+ or **yarn**: 1.22+
- **MongoDB**: Local instance or MongoDB Atlas
- **Git**: For version control
- **Astra VectorDB**: For vector database

### API Keys Required
- **Google Gemini API Key**: For AI-powered resume analysis
- **Clerk API Keys**: For user authentication (Publishable + Secret)
- **UploadThing API Keys**: For file upload functionality
- **MongoDB Connection String**: For database connectivity
- **Astra Application Token**: For Vector database connectivity 

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CVCompare
```

### 2. Backend Setup

#### Environment Configuration
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Create Backend Environment File
Create a `.env` file in the `/backend` directory:
```env
# Google AI Configuration
GOOGLE_API_KEY=your_gemini_api_key_here

#Astra DB Configuration
ASTRA_DB_APPLICATION_TOKEN=
ASTRA_DB_API_ENDPOINT=

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017/cvcompare
# Or for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/cvcompare

# Clerk Configuration (for JWT validation)
CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_secret_key
JWKS_ENDPOINT=

```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../client

# Install dependencies
npm install
# or
yarn install
```

#### Create Frontend Environment File
Create a `.env.local` file in the `/client` directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/upload
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/upload

# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# JWT Secret for backend verification
JWT_SECRET=

# Clerk Configuration
CLERK_SECRET_KEY=

UPLOADTHING_TOKEN=

```

#### Build the Project
```bash
npm run build
# or
yarn build
```

## 🚀 Running the Application

### Development Mode

#### Start the Backend Server
```bash
cd backend

# Make sure virtual environment is activated
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

#Start with fastapi
cd app
fastapi dev ./app.py

```
The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

#### Start the Frontend Development Server
```bash
cd client

# Start development server
npm run dev
# or
yarn dev
```
The application will be available at `http://localhost:3000`

### Production Mode

#### Backend Production
```bash
cd backend
cd app
fastapi run ./app.py
```

#### Frontend Production
```bash
cd client
npm run build && npm start
# or
yarn build && yarn start
```

## 📁 Project Structure

```
CVCompare/
├── 📁 backend/                          # FastAPI Backend Application
│   ├── 📄 requirements.txt             # Python dependencies
│   ├── 📄 prompt.txt                   # AI analysis prompt template
│   ├── 📄 system_prompt.txt            # AI system prompt configuration
│   ├── 📁 __pycache__/                 # Python bytecode cache
│   └── 📁 app/                         # Main application package
│       ├── 📄 app.py                   # FastAPI application & routes
│       ├── 📄 database.py              # MongoDB connection & configuration
│       ├── 📄 middleware.py            # Authentication & CORS middleware
│       ├── 📄 models.py                # Pydantic models & schemas
│       ├── 📄 rag.py                   # RAG (Retrieval-Augmented Generation)
│       ├── 📄 utils.py                 # Utility functions & helpers
│       ├── 📄 vector_store.py          # Vector database operations
│       ├── 📄 webhooks.py              # Webhook handlers
│       └── 📁 __pycache__/             # Python bytecode cache
│
├── 📁 client/                          # Next.js Frontend Application
│   ├── 📄 package.json                # Node.js dependencies & scripts
│   ├── 📄 next.config.ts              # Next.js configuration
│   ├── 📄 tailwind.config.ts          # Tailwind CSS configuration
│   ├── 📄 tsconfig.json               # TypeScript configuration
│   ├── 📄 components.json             # shadcn/ui component configuration
│   ├── 📄 eslint.config.mjs           # ESLint configuration
│   ├── 📄 postcss.config.mjs          # PostCSS configuration
│   ├── 📁 public/                     # Static assets
│   └── 📁 src/                        # Source code
│       ├── 📄 middleware.ts           # Clerk authentication middleware
│       ├── 📁 app/                    # Next.js App Router pages
│       │   ├── 📄 layout.tsx          # Root layout with providers
│       │   ├── 📄 page.tsx            # Landing/home page
│       │   ├── 📄 globals.css         # Global styles
│       │   ├── 📁 analysis/           # Resume analysis page
│       │   │   └── 📄 page.tsx
│       │   ├── 📁 api/                # API routes
│       │   │   └── 📁 uploadthing/    # File upload API endpoints
│       │   ├── 📁 history/            # Analysis history page
│       │   │   └── 📄 page.tsx
│       │   ├── 📁 sign-in/            # Authentication pages
│       │   │   └── 📁 [[...sign-in]]/
│       │   ├── 📁 sign-up/
│       │   │   └── 📁 [[...sign-up]]/
│       │   └── 📁 upload/             # File upload page
│       │       └── 📄 page.tsx
│       ├── 📁 components/             # React components
│       │   ├── 📄 AnalysisDisplay.tsx      # Main analysis results
│       │   ├── 📄 ATSCalculation.tsx       # ATS scoring logic
│       │   ├── 📄 ATSScoreDisplay.tsx      # Score visualization
│       │   ├── 📄 ChatInterface.tsx        # AI chat component
│       │   ├── 📄 FileChanger.tsx          # File management
│       │   ├── 📄 FileUpload.tsx           # Basic file upload
│       │   ├── 📄 FormulaExplanation.tsx   # Scoring formula help
│       │   ├── 📄 JobDescriptionHighlighter.tsx  # Text highlighting
│       │   ├── 📄 JobDescriptionInput.tsx  # Job description form
│       │   ├── 📄 Navbar.tsx               # Navigation component
│       │   ├── 📄 PDFViewer.tsx            # PDF display component
│       │   ├── 📄 SectionBreakdown.tsx     # Detailed score breakdown
│       │   ├── 📄 UploadThingFileUpload.tsx # Enhanced file upload
│       │   ├── 📄 WeightControls.tsx       # Scoring weight controls
│       │   └── 📁 ui/                      # shadcn/ui components
│       │       ├── 📄 badge.tsx
│       │       ├── 📄 button.tsx
│       │       ├── 📄 card.tsx
│       │       ├── 📄 input.tsx
│       │       ├── 📄 label.tsx
│       │       ├── 📄 progress.tsx
│       │       ├── 📄 slider.tsx
│       │       ├── 📄 tabs.tsx
│       │       └── 📄 textarea.tsx
│       ├── 📁 contexts/               # React context providers
│       │   └── 📄 fileContext.tsx     # File state management
│       ├── 📁 hooks/                  # Custom React hooks
│       │   ├── 📄 useAuthenticatedFetch.ts  # API calls with auth
│       │   └── 📄 useRequestDeduplication.ts # Request optimization
│       └── 📁 lib/                    # Utility libraries
│           ├── 📄 atsCalculations.ts  # ATS scoring algorithms
│           ├── 📄 schemas.ts          # Zod validation schemas
│           ├── 📄 sectionDetails.ts   # Analysis section definitions
│           ├── 📄 server-actions.ts   # Server-side actions
│           ├── 📄 types.d.ts          # TypeScript type definitions
│           ├── 📄 uploadthing.ts      # UploadThing configuration
│           ├── 📄 utapi.ts            # UploadThing API helpers
│           └── 📄 utils.ts            # General utility functions
│
└── 📄 README.md                       # Project documentation
```

## 🧮 ATS Scoring Algorithm

CVCompare uses a sophisticated multi-factor scoring system that mirrors how real ATS systems evaluate resumes:

### 📊 **Weighted Scoring Model**
```
Total ATS Score = (Skills × 40%) + (Experience × 35%) + (Education × 15%) + (Summary × 10%)
```

### 🔍 **Detailed Scoring Breakdown**

#### 1. **Skills Analysis (40% weight)**
- **Technical Skills Matching** (60% of skills score)
  - Programming languages, tools, frameworks
  - Technology stack alignment
  - Certification and expertise levels
  
- **Soft Skills Assessment** (25% of skills score)
  - Communication, leadership, teamwork
  - Industry-standard soft skills
  - Behavioral competencies
  
- **Domain Expertise** (15% of skills score)
  - Industry-specific knowledge
  - Specialized domain skills
  - Professional certifications

#### 2. **Work Experience Evaluation (35% weight)**
- **Relevance Score** (50% of experience score)
  - Job title alignment
  - Industry experience
  - Role responsibility matching
  
- **Keyword Density** (30% of experience score)
  - Important terms frequency
  - Action verb usage
  - Quantifiable achievements
  
- **Semantic Analysis** (20% of experience score)
  - Contextual understanding
  - Experience progression
  - Impact statements

#### 3. **Education Assessment (15% weight)**
- **Degree Requirements** (60% of education score)
  - Required vs. actual degree level
  - Field of study alignment
  - Academic achievements
  
- **Additional Qualifications** (40% of education score)
  - Professional certifications
  - Continued education
  - Relevant coursework

#### 4. **Summary Optimization (10% weight)**
- **Keyword Integration** (50% of summary score)
  - Job-relevant keywords
  - Industry terminology
  - Skills highlighting
  
- **Value Proposition** (50% of summary score)
  - Clear career objectives
  - Unique selling points
  - Professional branding

### 🎛️ **Customizable Weights**
Users can adjust scoring weights based on specific job requirements:
- **Technical Roles**: Increase Skills weight to 50-60%
- **Management Positions**: Increase Experience weight to 45-50%
- **Academic Positions**: Increase Education weight to 25-30%
- **Executive Roles**: Increase Summary weight to 15-20%

### 📈 **Scoring Scale**
- **90-100**: Excellent match - High ATS compatibility
- **80-89**: Very good match - Strong candidate profile
- **70-79**: Good match - Competitive with improvements
- **60-69**: Fair match - Needs optimization
- **Below 60**: Poor match - Significant improvements needed


### Customization Options

#### 🎯 **ATS Scoring Weights**
Modify default weights in `client/src/lib/atsCalculations.ts`:
```typescript
export const DEFAULT_WEIGHTS = {
  skills: 40,        // Technical & soft skills importance
  experience: 35,    // Work experience relevance
  education: 15,     // Educational background
  summary: 10        // Professional summary quality
};
```

#### 🤖 **AI Prompts**
Customize AI behavior by editing:
- `backend/prompt.txt`: Main analysis prompt template
- `backend/system_prompt.txt`: System-level AI instructions

#### 🎨 **UI Styling**
- **Global Styles**: `client/src/app/globals.css`
- **Component Styles**: Individual component files with Tailwind classes
- **Theme Configuration**: `client/tailwind.config.ts`

#### 📊 **Scoring Thresholds**
Adjust score ranges in `client/src/lib/atsCalculations.ts`:
```typescript
export const SCORE_THRESHOLDS = {
  excellent: 90,
  veryGood: 80,
  good: 70,
  fair: 60,
  poor: 0
};
```


### Performance Optimization

#### Backend Optimization
- Use async/await for all I/O operations
- Implement caching for expensive operations
- Optimize database queries
- Use background tasks for long operations

#### Frontend Optimization
- Use Next.js Image component for images
- Implement code splitting with dynamic imports
- Optimize bundle size with webpack-bundle-analyzer
- Use React.memo for expensive components

## 📦 Dependencies & Tech Stack

### Backend Dependencies (`requirements.txt`)

#### Core Framework
- **FastAPI** `0.104.1` - Modern, fast web framework for building APIs
- **uvicorn** `0.24.0` - ASGI server for FastAPI applications
- **python-multipart** `0.0.6` - File upload support

#### AI & Machine Learning
- **Google Gemini AI** - Advanced language model for resume analysis
- **LangChain** - Framework for LLM application development and chat workflows
- **nltk** `3.8.1` - Natural language processing toolkit

#### Database & ODM
- **beanie** `1.23.0` - Async MongoDB ODM based on Pydantic
- **motor** `3.3.2` - Async MongoDB driver

#### File Processing
- **PyPDF2** `3.0.1` - PDF file parsing and text extraction

#### Authentication & Security
- **pyjwt** `2.8.0` - JSON Web Token implementation
- **python-dotenv** `1.0.0` - Environment variable management

#### HTTP & Networking
- **httpx** `0.25.2` - Async HTTP client library

### Frontend Dependencies (`package.json`)

#### Core Framework
- **Next.js** `15.3.3` - React framework with app router
- **React** `^19.0.0` - UI library for building interfaces
- **TypeScript** `^5` - Type-safe JavaScript

#### UI & Styling
- **Tailwind CSS** `^4` - Utility-first CSS framework
- **shadcn/ui** components:
  - `@radix-ui/react-*` - Accessible component primitives
  - `class-variance-authority` - CSS class management
  - `tailwindcss-animate` - Animation utilities

#### Authentication
- **Clerk** `^6.22.0` - Complete authentication solution

#### File Management
- **UploadThing** `^7.7.2` - File upload service
- **@uploadthing/react** `^7.3.1` - React components for UploadThing

#### PDF Processing
- **pdfjs-dist** `^5.3.31` - PDF rendering in browser
- **react-pdf** `^9.2.1` - React PDF viewer component
- **react-pdf-highlighter** `^8.0.0-rc.0` - PDF text highlighting

#### Data Management
- **@tanstack/react-table** `^8.21.3` - Table data management
- **zod** `^3.25.64` - Schema validation library

#### UI Enhancements
- **lucide-react** `^0.514.0` - Beautiful icon library
- **react-markdown** `^10.1.0` - Markdown rendering
- **sonner** `^2.0.5` - Toast notification system

## �📄 License

This project is licensed under the MIT License 


