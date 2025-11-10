from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import uvicorn
import os
from pathlib import Path
import shutil

from model_handler import DentalModelHandler
from chat_agent import DentalChatAgent

# Initialize FastAPI app
app = FastAPI(title="Dental AI Assistant API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Initialize model handler and chat agent (loaded once)
model_handler = None
chat_agent = None

# Store current analysis results
current_analysis = {}


@app.on_event("startup")
async def startup_event():
    """Load models once on startup"""
    global model_handler, chat_agent
    print("🚀 Loading YOLO model and initializing chat agent...")
    model_handler = DentalModelHandler()
    chat_agent = DentalChatAgent()
    print("✅ Models loaded successfully!")


# Pydantic models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class ChatResponse(BaseModel):
    response: str
    session_id: str


class AnalysisResponse(BaseModel):
    success: bool
    message: str
    detections: Dict
    output_image_path: str
    analysis_summary: str


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "message": "Dental AI Assistant API is running",
        "endpoints": {
            "upload": "/api/upload-xray",
            "chat": "/api/chat",
            "get_image": "/api/image/{filename}",
            "current_analysis": "/api/current-analysis"
        }
    }


@app.post("/api/upload-xray", response_model=AnalysisResponse)
async def upload_xray(file: UploadFile = File(...)):
    """
    Upload and analyze dental X-ray image
    """
    global current_analysis
    
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"📁 File saved: {file_path}")
        
        # Run inference
        print("🔍 Running YOLO inference...")
        result = model_handler.predict(str(file_path))
        
        # Visualize and save output
        output_filename = f"analyzed_{file.filename}"
        output_path = OUTPUT_DIR / output_filename
        model_handler.visualize_result(result, str(output_path))
        
        # Extract detections
        detections = model_handler.extract_detections(result)
        
        # Generate analysis summary
        analysis_summary = model_handler.generate_summary(detections)
        
        # Store current analysis for chat context
        current_analysis = {
            "detections": detections,
            "summary": analysis_summary,
            "image_path": str(file_path),
            "output_path": str(output_path)
        }
        
        # Update chat agent context
        chat_agent.update_xray_context(current_analysis)
        
        return AnalysisResponse(
            success=True,
            message="X-ray analyzed successfully",
            detections=detections,
            output_image_path=output_filename,
            analysis_summary=analysis_summary
        )
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with dental assistant about X-ray results
    """
    try:
        if not current_analysis:
            return ChatResponse(
                response="Please upload an X-ray image first so I can assist you with the analysis.",
                session_id=request.session_id
            )
        
        # Get response from chat agent
        response = chat_agent.chat(request.message, request.session_id)
        
        return ChatResponse(
            response=response,
            session_id=request.session_id
        )
    
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.get("/api/image/{filename}")
async def get_image(filename: str):
    """
    Retrieve analyzed image
    """
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)


@app.get("/api/current-analysis")
async def get_current_analysis():
    """
    Get current X-ray analysis
    """
    if not current_analysis:
        return {"message": "No analysis available. Please upload an X-ray first."}
    
    return {
        "success": True,
        "analysis": current_analysis
    }


@app.delete("/api/clear-session/{session_id}")
async def clear_session(session_id: str):
    """
    Clear chat history for a session
    """
    chat_agent.clear_history(session_id)
    return {"message": f"Session {session_id} cleared successfully"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)