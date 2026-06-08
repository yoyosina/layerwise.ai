import requests
import jwt
from datetime import datetime, timedelta

def create_access_token():
    to_encode = {"sub": "1"} # user_id = 1
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, "super-secret-layerwise-key-change-in-prod", algorithm="HS256")

token = create_access_token()
print("Token:", token)

headers = {
    "Authorization": f"Bearer {token}"
}

data = {
    "code": "print('Hello World')",
    "language": "python"
}

response = requests.post("http://localhost:8000/api/workspace/evaluate", headers=headers, json=data)
print(response.status_code)
print(response.json())
