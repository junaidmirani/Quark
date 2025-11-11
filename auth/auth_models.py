# auth/auth_models.py - Create this file
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import jwt
import os

class User(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime
    last_login: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User

class GoogleUserInfo(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
