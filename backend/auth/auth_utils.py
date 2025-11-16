# auth/auth_utils.py
import jwt
import httpx
from datetime import datetime, timedelta
from typing import Optional
from .auth_models import User, GoogleUserInfo
import os

SECRET_KEY = os.getenv(
    "JWT_SECRET", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# In-memory user storage (replace with database in production)
users_db = {}


def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


async def verify_google_token(token: str) -> Optional[GoogleUserInfo]:
    """Verify Google OAuth token and get user info"""
    try:
        # Use Google's tokeninfo endpoint to verify the JWT
        async with httpx.AsyncClient() as client:
            # Method 1: Try tokeninfo endpoint (for ID tokens)
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token}",
                timeout=10.0
            )

            if response.status_code == 200:
                data = response.json()

                # Validate the token
                if "email" not in data:
                    print(f"❌ No email in token response")
                    return None

                # Check if token is for your app
                expected_client_id = "396804387135-sak8ueujt310gs9if8cv6374cakaoh0k.apps.googleusercontent.com"
                if data.get("aud") != expected_client_id and data.get("azp") != expected_client_id:
                    print(
                        f"❌ Token audience mismatch. Expected: {expected_client_id}, Got: {data.get('aud')}")
                    return None

                # Create GoogleUserInfo from the token data
                return GoogleUserInfo(
                    id=data.get("sub"),  # Google user ID
                    email=data.get("email"),
                    name=data.get("name", data.get("email")),
                    picture=data.get("picture")
                )
            else:
                print(
                    f"❌ Google token verification failed: {response.status_code}")
                print(f"Response: {response.text}")
                return None

    except Exception as e:
        print(f"❌ Error verifying Google token: {e}")
        import traceback
        traceback.print_exc()
        return None


def get_or_create_user(google_user: GoogleUserInfo) -> User:
    """Get existing user or create new one"""
    now = datetime.utcnow()

    if google_user.id in users_db:
        # Update last login
        user = users_db[google_user.id]
        user.last_login = now
        print(f"✅ Existing user logged in: {user.email}")
        return user
    else:
        # Create new user
        user = User(
            id=google_user.id,
            email=google_user.email,
            name=google_user.name,
            picture=google_user.picture,
            created_at=now,
            last_login=now
        )
        users_db[google_user.id] = user
        print(f"✅ New user created: {user.email}")
        return user


def get_user_by_id(user_id: str) -> Optional[User]:
    """Get user by ID"""
    return users_db.get(user_id)
