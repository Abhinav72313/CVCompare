# ResumeFitter

A powerful AI-driven application that analyzes resumes against job descriptions and provides detailed ATS (Applicant Tracking System) scoring and optimization recommendations.

## 🚀 Features

- **Resume Analysis**: Upload PDF resumes and get comprehensive analysis
- **Job Description Matching**: Compare resumes against specific job requirements
- **ATS Score Calculation**: Get detailed scoring with weighted metrics
- **Skills Gap Analysis**: Identify missing technical and soft skills
- **Semantic Alignment**: Analyze how well your resume matches job descriptions
- **Interactive UI**: Modern, responsive interface built with Next.js and Tailwind CSS
- **Real-time Chat**: AI-powered chat interface for resume optimization suggestions

## 🏗️ Architecture

This project consists of two main components:

### Backend (`/backend`)
- **Framework**: FastAPI (Python)
- **AI Integration**: Google Gemini AI for resume analysis
- **File Processing**: PDF parsing with PyPDF2  support
- **API**: RESTful endpoints for resume analysis and chat functionality

### Frontend (`/client`)
- **Framework**: Next.js 15 with TypeScript
- **UI Library**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **PDF Viewing**: Built-in PDF viewer with pdfjs-dist
- **Icons**: Lucide React icons

## 📋 Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 18 or higher
- **npm** or **yarn**
- **Google Gemini API Key**: Required for AI analysis

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ResumeFitter
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GOOGLE_API_KEY=your_gemini_api_key_here" > .env
```

### 3. Frontend Setup
```bash
cd ../client

# Install dependencies
npm install

# Build the project
npm run build
```

## 🚀 Running the Application

### Start the Backend Server
```bash
cd backend
python main.py
```
The API will be available at `http://localhost:8000`

### Start the Frontend Development Server
```bash
cd client
npm run dev
```
The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
ResumeFitter/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── prompt.txt          # AI analysis prompt template
│   ├── system_prompt.txt   # AI system prompt
│   └── .env               # Environment variables (create this)
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   │   ├── page.tsx   # Home page
│   │   │   ├── layout.tsx # Root layout
│   │   │   └── analysis/  # Analysis page
│   │   ├── components/    # React components
│   │   │   ├── AnalysisDisplay.tsx     # Main analysis display
│   │   │   ├── ATSScoreDisplay.tsx     # ATS scoring interface
│   │   │   ├── ChatInterface.tsx       # AI chat component
│   │   │   ├── FileUpload.tsx         # File upload component
│   │   │   ├── PDFViewer.tsx          # PDF viewing component
│   │   │   └── ui/                    # shadcn/ui components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/          # Utility functions and schemas
│   │   └── ...
│   ├── package.json      # Node.js dependencies
│   └── ...
├── README.md            # This file
└── .gitignore          # Git ignore rules
```

## 🎯 Usage

1. **Upload Resume**: Start by uploading a PDF resume on the home page
2. **Enter Job Description**: Paste or type the job description you want to match against
3. **Analyze**: Click analyze to get comprehensive ATS scoring and recommendations
4. **Review Results**: Examine the detailed breakdown including:
   - Overall ATS score with weighted metrics
   - Skills analysis (technical, soft, domain expertise)
   - Work experience relevance
   - Education alignment
   - Summary optimization suggestions
5. **Chat for Improvements**: Use the AI chat interface for personalized optimization advice

## 🧮 ATS Scoring Algorithm

The application uses a sophisticated weighted scoring system:

- **Skills** (40%): Technical skills, soft skills, domain expertise
- **Work Experience** (35%): Relevance, keyword matching, semantic analysis
- **Education** (15%): Degree requirements, field alignment
- **Summary** (10%): Keyword optimization, value proposition strength

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `/backend` directory:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### Customization

- **Scoring Weights**: Modify weights in `client/src/lib/atsCalculations.ts`
- **AI Prompts**: Update prompts in `backend/prompt.txt` and `backend/system_prompt.txt`
- **UI Styling**: Customize styles in `client/src/app/globals.css` and component files

## 🧪 Development

### Backend Development
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd client
npm run dev
```

### Code Quality
```bash
# Frontend linting
cd client
npm run lint

# Type checking
npx tsc --noEmit
```

## 📦 Dependencies

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Google Gemini**: AI integration for resume analysis
- **PyPDF2**: PDF file processing
- **python-docx**: DOCX file support
- **uvicorn**: ASGI server for FastAPI

### Frontend
- **Next.js**: React framework with app router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern React component library
- **Lucide React**: Beautiful icons
- **pdfjs-dist**: PDF rendering in browser

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔮 Future Enhancements

- [ ] Support for more file formats (DOCX, TXT)
- [ ] Resume template suggestions
- [ ] Batch processing for multiple resumes
- [ ] Advanced analytics and reporting
- [ ] Integration with job boards
- [ ] Machine learning model improvements
- [ ] Multi-language support

