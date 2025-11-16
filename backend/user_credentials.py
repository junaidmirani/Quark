# user_credentials.py - NEW FILE
from typing import Dict, Optional

# In-memory storage (replace with database later)
user_credentials_db = {}


def store_user_credential(user_id: str, service: str, credentials: dict):
    """Store user's credentials for a service"""
    if user_id not in user_credentials_db:
        user_credentials_db[user_id] = {}

    user_credentials_db[user_id][service] = credentials
    print(f"✅ Stored {service} credentials for user {user_id}")


def get_user_credential(user_id: str, service: str) -> Optional[dict]:
    """Get user's credentials for a service"""
    return user_credentials_db.get(user_id, {}).get(service)


def get_user_connected_services(user_id: str) -> list:
    """Get list of services user has connected"""
    return list(user_credentials_db.get(user_id, {}).keys())
