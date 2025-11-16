# auth/auth_routes.py
from fastapi import APIRouter, HTTPException, Depends
from .auth_models import Token, User
from .auth_utils import verify_google_token, get_or_create_user, create_access_token
from .auth_middleware import get_current_user, require_auth
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])


class GoogleTokenRequest(BaseModel):
    credential: str  # ← Changed from access_token to credential


@router.post("/google", response_model=Token)
async def login_with_google(request: GoogleTokenRequest):
    """Login with Google OAuth token"""
    # Verify Google token
    google_user = await verify_google_token(request.credential)
    if not google_user:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    # Get or create user
    user = get_or_create_user(google_user)

    # Create JWT token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email})

    return Token(
        access_token=access_token,
        expires_in=60 * 60 * 24,  # 24 hours
        user=user
    )


@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(require_auth)):
    """Get current user information"""
    return current_user


@router.post("/logout")
async def logout():
    """Logout (client should delete token)"""
    return {"message": "Logged out successfully"}
