from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from typing import Dict, List
import os
from dotenv import load_dotenv

load_dotenv()


class DentalChatAgent:
    """LangChain-based chat agent for dental X-ray consultation"""
    
    def __init__(self):
        """Initialize chat agent with OpenAI model"""
        # Get API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        
        # Initialize ChatOpenAI model
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            api_key=api_key
        )
        
        # Store conversation history by session
        self.conversation_history: Dict[str, List] = {}
        
        # Current X-ray context
        self.xray_context = None
        
        # Create prompt template
        self.prompt = self._create_prompt()
        
        # Create chain
        self.chain = self._create_chain()
    
    def _create_prompt(self) -> ChatPromptTemplate:
        """Create prompt template for dental assistant"""
        system_template = """You are a knowledgeable and empathetic dental AI assistant. Your role is to help patients understand their dental X-ray results and provide guidance.

IMPORTANT GUIDELINES:
1. You have access to the patient's X-ray analysis results
2. Explain dental conditions in simple, easy-to-understand language
3. Be empathetic and reassuring while being informative
4. If asked about specific detections, refer to the X-ray analysis data
5. Recommend seeing a dentist for professional treatment - you provide information, not diagnosis
6. If the user asks questions unrelated to dental health, politely redirect them to dental topics
7. Use the conversation history to maintain context

CURRENT X-RAY ANALYSIS:
{xray_context}

Remember: You are supportive, informative, and always encourage professional dental care when needed."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_template),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}")
        ])
        
        return prompt
    
    def _create_chain(self):
        """Create LangChain runnable chain"""
        
        def format_history(session_id: str) -> List:
            """Get formatted conversation history"""
            return self.conversation_history.get(session_id, [])
        
        def format_xray_context() -> str:
            """Format X-ray context for prompt - FIXED to use new field names"""
            if not self.xray_context:
                return "No X-ray analysis available yet."
            
            # Updated to use 'count' instead of 'total_detections'
            detections = self.xray_context.get('detections', {})
            total_count = detections.get('count', 0)
            
            context_parts = [
                f"Total Detections: {total_count}",
                "\nDetected Conditions:"
            ]
            
            # Updated to use 'classes' instead of 'by_class'
            classes = detections.get('classes', {})
            
            if classes:
                for class_name, count in classes.items():
                    readable_name = class_name.replace('_', ' ')
                    context_parts.append(f"- {readable_name}: {count}")
            else:
                context_parts.append("- No significant findings")
            
            summary = self.xray_context.get('summary', 'No summary available')
            context_parts.append(f"\nSummary: {summary}")
            
            return "\n".join(context_parts)
        
        # Build chain
        chain = (
            {
                "xray_context": RunnableLambda(lambda x: format_xray_context()),
                "history": RunnableLambda(lambda x: format_history(x["session_id"])),
                "input": RunnablePassthrough()
            }
            | self.prompt
            | self.llm
        )
        
        return chain
    
    def update_xray_context(self, analysis: Dict):
        """Update X-ray analysis context"""
        self.xray_context = analysis
        print("✅ X-ray context updated for chat agent")
        print(f"📊 Detection count: {analysis.get('detections', {}).get('count', 0)}")
    
    def chat(self, message: str, session_id: str = "default") -> str:
        """Process user message and return response"""
        
        # Initialize session history if needed
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        
        try:
            # Invoke chain
            response = self.chain.invoke({
                "input": message,
                "session_id": session_id
            })
            
            # Extract response text
            response_text = response.content
            
            # Update conversation history
            self.conversation_history[session_id].append(HumanMessage(content=message))
            self.conversation_history[session_id].append(AIMessage(content=response_text))
            
            # Keep only last 10 messages to avoid context overflow
            if len(self.conversation_history[session_id]) > 10:
                self.conversation_history[session_id] = self.conversation_history[session_id][-10:]
            
            return response_text
        
        except Exception as e:
            print(f"❌ Chat error: {str(e)}")
            return f"I apologize, but I encountered an error processing your message. Please try again."
    
    def clear_history(self, session_id: str):
        """Clear conversation history for a session"""
        if session_id in self.conversation_history:
            del self.conversation_history[session_id]
            print(f"🗑️ Cleared history for session: {session_id}")
    
    def get_history(self, session_id: str) -> List:
        """Get conversation history for a session"""
        return self.conversation_history.get(session_id, [])