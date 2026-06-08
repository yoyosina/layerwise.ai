import asyncio
from api.routes.tutor import stream_llm_response, ChatMessage

async def main():
    print("Testing AI Tutor streaming response...")
    history = [
        ChatMessage(role="user", text="Hello AI Tutor, are you working?")
    ]
    
    async for chunk in stream_llm_response(history):
        print(chunk, end="")
        
if __name__ == "__main__":
    asyncio.run(main())
