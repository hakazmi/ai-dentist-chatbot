# 🦷 Dental AI Assistant

An intelligent dental X-ray analysis system powered by AI that helps dentists and patients understand dental conditions through automated detection and interactive consultation.

---

## 🌟 Introduction

The **Dental AI Assistant** is a comprehensive AI-powered platform designed to revolutionize dental diagnostics.  
It combines **state-of-the-art computer vision** with **natural language processing (NLP)** to provide:

- **Automated Detection:** Identifies various dental conditions from OPG (Orthopantomogram) X-ray images  
- **Visual Analysis:** Highlights detected issues with color-coded annotations  
- **Interactive Consultation:** AI-powered chatbot for answering questions about the analysis  
- **Confidence Scoring:** Provides confidence levels for each detection to assist clinical decision-making  

This system is designed to assist dental professionals in their diagnostic workflow and help patients better understand their dental health.

---

## ✨ Features

### 🔍 X-ray Analysis

- **Multi-class Detection:** Detects 6 different dental conditions:
  - Healthy Teeth  
  - Caries (Cavities)  
  - Impacted Teeth  
  - Broken Down Crown/Root  
  - Infections  
  - Fractured Teeth  

- **Visual Annotations:** Color-coded bounding boxes and masks overlay on X-ray images  
- **Confidence Levels:** Three-tier confidence system  
  - High ≥ 80%  
  - Medium 60–79%  
  - Low < 60%  
- **Detailed Reports:** Comprehensive detection summary with class-wise breakdown  

---

### 💬 AI Chat Assistant

- **Context-Aware:** Understands the current X-ray analysis context  
- **Markdown Support:** Rich text formatting for better readability  
- **Medical Knowledge:** Provides information about dental conditions  
- **Empathetic Responses:** Designed to be supportive and informative  
- **Session Management:** Maintains conversation history for contextual responses  

---

### 🎨 User Interface

- **Modern Design:** Clean, intuitive React-based interface  
- **Real-time Updates:** Live analysis results and streaming chat responses  
- **Responsive Layout:** Works seamlessly on different screen sizes  
- **Image Panel:** Side-by-side view of analyzed X-ray and chat interface  
- **Authentication:** Secure login system for user management  

---

## 🔄 How It Works

### Workflow

1. **User Authentication**
   - User logs in with credentials  
   - Session is created and maintained  

2. **X-ray Upload**
   - User uploads an OPG X-ray image (JPG, PNG, etc.)  
   - Image is sent to the backend via REST API  

3. **AI Analysis**
   - YOLO model processes the X-ray image  
   - Detects and classifies dental conditions  
   - Generates bounding boxes and segmentation masks  
   - Calculates confidence scores for each detection  

4. **Visualization**
   - Annotated image is created with color-coded overlays  
   - Results are sent back to frontend  
   - User sees the analyzed X-ray with detections highlighted  

5. **Interactive Consultation**
   - User can ask questions about the analysis  
   - Chat agent uses GPT-4 to provide informed responses  
   - Conversation maintains context of the X-ray analysis  
   - Responses are formatted with markdown for clarity  

6. **Report Generation**
   - Detailed summary of all detections  
   - Class-wise breakdown with counts  
   - Confidence-based recommendations  
   - Severity assessment  

---

### Detection Confidence Levels

| Confidence Level | Range       | Meaning              |
|------------------|-------------|----------------------|
| 🔴 High          | ≥ 80%       | Strong detection, likely accurate |
| 🟡 Medium        | 60–79%      | Moderate detection, needs verification |
| ⚪ Low           | < 60%       | Weak detection, marked as “Lower Detection” |

---

## 🛠️ Technology Stack

### Backend
- **FastAPI:** Modern, fast web framework for APIs  
- **Python 3.10:** Core programming language  
- **Ultralytics YOLO:** Object detection model  
- **OpenCV:** Image processing library  
- **LangChain:** Framework for LLM-based applications  
- **OpenAI GPT-4:** Large language model for chatbot responses  
- **Hugging Face:** Model hosting and deployment  

### Frontend
- **React 18:** Interactive UI framework  
- **TypeScript:** Type-safe JavaScript  
- **Vite:** Fast frontend build tool  
- **Tailwind CSS:** Utility-first CSS framework  
- **Lucide React:** Icon library  
- **React Markdown:** For rendering chat messages  

### DevOps
- **Docker:** Containerization platform  
- **Docker Compose:** Multi-container orchestration  
- **Nginx:** Production web server  
- **Uvicorn:** ASGI server for FastAPI  

---

## 📦 Prerequisites

### For Local Development
- Python 3.10 or higher  
- Node.js 18 or higher  
- npm or yarn  
- OpenAI API key  

### For Docker Deployment
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)  
- Docker Compose  
- OpenAI API key  

---

## 🚀 Installation & Setup

### Running Locally

#### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dental-ai-assistant.git
   cd dental-ai-assistant
```
2. **Create virtual environment**
```bash
python -m venv test
# Windows
test\Scripts\activate
# Linux/Mac
source test/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create .env file**
```bash
# Create .env file in root directory
OPENAI_API_KEY=your_openai_api_key_here
```

5. **Run the backend** 
```bash
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- Backend available at: http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd project
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

- Frontend available at: http://localhost:5173

### Running with Docker
**Prerequisites**
- Docker & Docker Compose installed
- OpenAI API key

**Steps**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/dental-ai-assistant.git
cd dental-ai-assistant
```bash

2. **Create .env file**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. **Build and run with Docker Compose**
```bash
docker-compose up --build


#Or run in detached mode:

docker-compose up -d --build
```

4. **Access the application**

- Frontend: http://localhost

- Backend API: http://localhost:8000

- API Docs: http://localhost:8000/docs



## 📖 Usage Guide
1. **Login**

- Open the application in your browser

- Enter your credentials (default: any email and name)

- Click Sign In

2. **Upload X-ray**

- Click Upload X-ray button

- Select an OPG X-ray image (JPG, PNG, etc.)

- Wait 2–5 seconds for analysis

3. **View Results**

- Analyzed X-ray appears with color-coded detections

- Click View Analysis for detailed panel

- Review detection counts, classes, and confidence levels

4. **Ask Questions**

- Type your question in the chat input
- **Examples:**

- “What is an impacted tooth?”

- “How serious are the detected issues?”

- “What treatment options are available?”

- “Should I see a dentist immediately?”

- Get AI-powered responses with medical context

5. **Logout**

- Click the Logout button in the top-right corner
