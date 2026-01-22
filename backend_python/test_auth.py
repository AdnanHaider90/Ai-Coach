import os
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

# Try a very standard email
email = f"my.test.account.{int(time.time())}@gmail.com"
password = "StrongPassword99!"

print(f"Attempting to sign up user: {email}")

try:
    response = supabase.auth.sign_up({
        "email": email,
        "password": password
    })
    print("Signup object:", response)
    
    # Check if user object exists (Supabase Python client returns an object with 'user' and 'session' attributes usually, or a User object)
    if hasattr(response, 'user') and response.user:
        print("User ID:", response.user.id)
        if hasattr(response, 'session') and response.session:
            print("ACCESS_TOKEN_START:" + response.session.access_token + ":ACCESS_TOKEN_END")
        else:
            print("No session returned. Email confirmation might be required.")
    else:
        # Sometimes response might be different version
        print("Response structure might be different:", dir(response))

except Exception as e:
    print(f"Signup Exception: {e}")
