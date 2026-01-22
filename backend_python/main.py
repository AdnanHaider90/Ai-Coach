
import os
import uvicorn
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime
import uuid

# Load environment variables
load_dotenv()

# Initialize Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class CreateSessionRequest(BaseModel):
    coachType: str

class Session(BaseModel):
    id: str
    userId: str
    coachType: str
    createdAt: str

# Dependency to get user token
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    # DEBUG: Bypass auth for testing
    if token == "debug_token":
        return "00000000-0000-0000-0000-000000000001"

    # In a real app we'd verify the JWT. 
    # For MVP and to work with Supabase RLS, we might pass it to supabase client if needed,
    # or just trust it if we are using the anon key solely.
    # But ideally:
    # user = supabase.auth.get_user(token)
    # However, since we are a backend using the Anon key, we are technically "impersonating" a generic client unless we pass the token.
    # To properly use RLS, we should probably set the auth header on the supabase client request or use the user's token.
    
    # For simplicity in this MVP + Supabase setup:
    # We will assume the token is a valid Supabase JWT and we decode the user_id from it (or just use a mock ID if simple).
    # BETTER: Let's extract the sub/user_id from the JWT if possible, or just fail if invalid.
    
    try:
        user = supabase.auth.get_user(token)
        if not user:
             raise HTTPException(status_code=401, detail="Invalid token")
        return user.user.id
    except Exception as e:
        print(f"Auth error: {e}")
        # For development/MVP if auth is tricky without full backend setup, we might fallback or fail.
        # Let's try to be strict first.
        raise HTTPException(status_code=401, detail="Invalid authentication")

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Coach Backend (Python) is running"}

@app.get("/sessions", response_model=List[Session])
def get_sessions(authorization: str = Header(None)):
    # Extract user_id from token or use the token to query Supabase with RLS
    if not authorization:
         raise HTTPException(status_code=401, detail="Missing Token")
    
    token = authorization.replace("Bearer ", "")
    
    # We can use the supabase client with the user's token to respect RLS
    # This effectively makes this backend a proxy, but allows us to add logic.
    
    # Create a scoped client with the user's token
    # Note: the python client might not support easy "scoped" usage without re-init?
    # Actually, we can just pass the jwt to the headers in the select call?
    # Or simpler: Just verify user and query the table using the service/anon key but filtering by user_id manually 
    # (if RLS allows anon access which it usually does in Supabase default setups if policies exist).
    
    # Let's try manual filter for stability if RLS is tricky to proxy.
    if token == "debug_token":
        user_id = "00000000-0000-0000-0000-000000000001"
    else:
        user = supabase.auth.get_user(token)
        user_id = user.user.id

    # DB uses lowercase columns: userid, coachtype, createdat
    response = supabase.table("Session").select("*").eq("userid", user_id).order("createdat", desc=True).execute()
    
    # Map to model
    sessions = []
    for record in response.data:
        sessions.append(Session(
            id=str(record["id"]),
            userId=str(record["userid"]),
            coachType=record["coachtype"],
            createdAt=record["createdat"]
        ))
    return sessions

@app.post("/sessions", response_model=Session)
def create_session(req: CreateSessionRequest, authorization: str = Header(None)):
    if not authorization:
         raise HTTPException(status_code=401, detail="Missing Token")
    token = authorization.replace("Bearer ", "")
    
    if token == "debug_token":
        user_id = "00000000-0000-0000-0000-000000000001"
    else:
        user = supabase.auth.get_user(token)
        user_id = user.user.id
    
    new_session = {
        "id": str(uuid.uuid4()),
        "userid": user_id,
        "coachtype": req.coachType,
        "createdat": datetime.utcnow().isoformat()
    }
    
    data = supabase.table("Session").insert(new_session).execute()
    
    if len(data.data) > 0:
        record = data.data[0]
        return Session(
            id=str(record["id"]),
            userId=str(record["userid"]),
            coachType=record["coachtype"],
            createdAt=record["createdat"]
        )
    raise HTTPException(status_code=500, detail="Failed to create session")


class ChatRequest(BaseModel):
    sessionId: str
    message: str

class Message(BaseModel):
    id: str
    sessionId: str
    role: str
    content: str
    createdAt: str

@app.post("/chat")
def chat_with_coach(req: ChatRequest, authorization: str = Header(None)):
    if not authorization:
         raise HTTPException(status_code=401, detail="Missing Token")
    token = authorization.replace("Bearer ", "")
    
    # Verify user
    try:
        if token == "debug_token":
             user_id = "00000000-0000-0000-0000-000000000001"
        else:
            user = supabase.auth.get_user(token)
            user_id = user.user.id
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Save user message
    user_msg_id = str(uuid.uuid4())
    # Message table columns likely: sessionid, createdat
    supabase.table("Message").insert({
        "id": user_msg_id,
        "sessionid": req.sessionId,
        "role": "user",
        "content": req.message,
        "createdat": datetime.utcnow().isoformat()
    }).execute()

    # Get AI response (Gemini)
    ai_response_text = f"I am your AI Coach. I received: {req.message}. (Gemini integration pending API Key)"
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key and api_key.strip():
        try:
             from google import genai
             client = genai.Client(api_key=api_key)
             
             # Use gemini-2.0-flash model
             response = client.models.generate_content(
                 model="gemini-2.0-flash",
                 contents=f"You are a helpful AI Coach. The user says: {req.message}"
             )
             ai_response_text = response.text

        except Exception as e:
            print(f"Gemini error: {e}")
            ai_response_text = "I'm having trouble thinking right now, but I heard you."

    # Save AI message
    ai_msg_id = str(uuid.uuid4())
    supabase.table("Message").insert({
        "id": ai_msg_id,
        "sessionid": req.sessionId,
        "role": "assistant",
        "content": ai_response_text,
        "createdat": datetime.utcnow().isoformat()
    }).execute()

    return {"response": ai_response_text}

@app.get("/messages", response_model=List[Message])
def get_messages(sessionId: str, authorization: str = Header(None)):
    if not authorization:
         raise HTTPException(status_code=401, detail="Missing Token")
    token = authorization.replace("Bearer ", "")
    
    # Verify user (basic check)
    if token == "debug_token":
        user_id = "00000000-0000-0000-0000-000000000001"
    else:
        user = supabase.auth.get_user(token)
        user_id = user.user.id

    # For safety, we should also check if the session belongs to the user.
    session = supabase.table("Session").select("userid").eq("id", sessionId).execute()
    if not session.data or session.data[0]["userid"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this session")

    response = supabase.table("Message").select("*").eq("sessionid", sessionId).order("createdat", desc=False).execute()
    
    messages = []
    for record in response.data:
        messages.append(Message(
            id=str(record["id"]),
            sessionId=str(record["sessionid"]),
            role=record["role"],
            content=record["content"],
            createdAt=record["createdat"]
        ))
    return messages

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # Simple check if port is busy could be done here, or let uvicorn fail.
    # For MVP, we'll try 8000.
    uvicorn.run(app, host="0.0.0.0", port=port)
