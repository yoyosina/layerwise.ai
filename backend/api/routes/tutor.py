import os
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    history: List[ChatMessage]

async def stream_llm_response(history: List[ChatMessage]):
    # Use Groq for ultra-fast, free inference
    groq_api_key = os.environ.get("GROQ_API_KEY")
    
    formatted_history = []
    for msg in history:
        # Langchain schema mapping
        role_type = "human" if msg.role == "user" else "ai"
        formatted_history.append((role_type, msg.text))

    if groq_api_key:
        try:
            from langchain_groq import ChatGroq
            llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.7, streaming=True, api_key=groq_api_key)
            async for chunk in llm.astream(formatted_history):
                if chunk.content:
                    yield f"data: {json.dumps({'content': chunk.content})}\n\n"
            yield "data: [DONE]\n\n"
            return
        except Exception as e:
            print(f"Groq fallback required: {e}")
            # Fall through to Ollama

    # Fallback to local Ollama
    try:
        from langchain_community.chat_models import ChatOllama
        llm = ChatOllama(model="llama3", temperature=0.7)
        for chunk in llm.stream(formatted_history):
            if chunk.content:
                yield f"data: {json.dumps({'content': chunk.content})}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        error_msg = "Error connecting to AI. Please ensure an API key is set or Ollama is running."
        yield f"data: {json.dumps({'content': error_msg})}\n\n"
        yield "data: [DONE]\n\n"

@router.post("/chat")
async def chat_tutor(request: ChatRequest):
    return StreamingResponse(
        stream_llm_response(request.history), 
        media_type="text/event-stream"
    )
