from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from mistralai.client import Mistral

from app.config import get_settings

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@router.post("")
async def chat_endpoint(request: ChatRequest, settings = Depends(get_settings)):
    api_key = settings.MISTRAL_API_KEY
    client = Mistral(api_key=api_key) if api_key else None

    if not client:
        # Mock response if API key is not configured
        def mock_generate():
            yield "[MOCK] I received your message. Please add your MISTRAL_API_KEY in .env to enable real AI."
        return StreamingResponse(mock_generate(), media_type="text/plain")

    try:
        api_messages = [
            {
                "role": "system",
                "content": "You are the CarbonTrack Sentinel Assistant, an AI focused EXCLUSIVELY on sustainability, carbon tracking, calculating emissions and all domains centered around carbon. You MUST strictly decline to answer any questions or requests that are not related to these core topics (e.g., politely refuse to provide recipes, general trivia, or unrelated programming help). Always guide the user back to carbon tracking. Be concise and professional."
            }
        ]
        for msg in request.messages:
            api_messages.append({"role": msg.role, "content": msg.content})

        def generate():
            chat_response = client.chat.stream(
                model="mistral-small-latest",
                messages=api_messages
            )
            for chunk in chat_response:
                content = chunk.data.choices[0].delta.content
                if content:
                    yield content

        return StreamingResponse(generate(), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
