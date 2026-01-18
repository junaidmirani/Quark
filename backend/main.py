import httpx
from fastapi.responses import RedirectResponse
from .user_credentials import (
    store_user_credential, 
    get_user_credential, 
    get_user_connected_services,
    user_credentials_db
)

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import asyncio
from search_modules.base_search import SearchResult
from datetime import datetime
import os
from pathlib import Path
from functools import lru_cache
from datetime import datetime, timedelta
from auth.auth_middleware import require_auth

# Import auth system
from auth.auth_routes import router as auth_router
from auth.auth_middleware import get_current_user, require_auth
from auth.auth_models import User

# Import search modules (unchanged)
from search_modules.gmail_search import GmailSearchModule
from search_modules.drive_search import DriveSearchModule
from search_modules.notion_search import NotionSearchModule
from search_modules.file_search import FileSearchModule
from search_modules.bookmark_search import BookmarkSearchModule
from search_modules.slack_search import SlackSearchModule

app = FastAPI(title="Quark API", version="2.0.0")

from dotenv import load_dotenv
load_dotenv()

# Update these lines:
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# ✅ FULL WORKING CORS CONFIG
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 👈 front-end origin
    allow_credentials=True,
    # 👈 allow POST, GET, OPTIONS, etc.
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include auth routes
app.include_router(auth_router)

# Pydantic models (unchanged)


# class SearchResult(BaseModel):
#     id: str
#     title: str
#     snippet: str
#     source: str
#     source_url: str
#     timestamp: Optional[str] = None
#     relevance_score: float = 0.0
#     metadata: Dict[str, Any] = {}


class SearchRequest(BaseModel):
    query: str
    sources: Optional[List[str]] = None
    limit: int = 20


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total_results: int
    search_time_ms: int
    sources_searched: List[str]
    user_id: Optional[str] = None


# Initialize search modules (unchanged)
search_modules = {
    "gmail": GmailSearchModule(),
    "drive": DriveSearchModule(),
    "notion": NotionSearchModule(),
    "files": FileSearchModule(),
    "bookmarks": BookmarkSearchModule(),
    "slack": SlackSearchModule()
}


@app.get("/")
async def root():
    return {"message": "Universal Search API with Authentication", "version": "2.0.0"}


# @app.get("/sources")
# async def get_available_sources(current_user: Optional[User] = Depends(get_current_user)):
#     """Get all available search sources and their status"""
#     sources = []
#     for name, module in search_modules.items():
#         status = await module.get_connection_status()
#         sources.append({
#             "name": name,
#             "display_name": module.display_name,
#             "connected": status["connected"],
#             "last_indexed": status.get("last_indexed"),
#             "total_items": status.get("total_items", 0),
#             # Sources that need user auth
#             "requires_auth": name in ["gmail", "drive", "notion", "slack"]
#         })
#     return {
#         "sources": sources,
#         "authenticated": current_user is not None,
#         "user_id": current_user.id if current_user else None
#     }
# In main.py - Add at the top


# Add this cache
sources_cache = {
    "data": None,
    "timestamp": None
}


@app.get("/sources")
async def get_available_sources(current_user: Optional[User] = Depends(get_current_user)):
    """Get all available search sources and their status - CACHED"""

    # Check cache (valid for 30 seconds)
    if sources_cache["data"] and sources_cache["timestamp"]:
        age = (datetime.now() - sources_cache["timestamp"]).seconds
        if age < 30:  # Cache for 30 seconds
            cached_data = sources_cache["data"]
            # Update connection status for current user
            if current_user:
                connected_services = get_user_connected_services(
                    current_user.id)
                for source in cached_data["sources"]:
                    if source["name"] in connected_services or source["name"] in ["files", "bookmarks"]:
                        source["connected"] = True
            return cached_data

    # Generate fresh data
    sources = []
    connected_services = []
    if current_user:
        connected_services = get_user_connected_services(current_user.id)

    # Don't await status checks - just return static data
    for name, module in search_modules.items():
        is_connected = name in connected_services or name in [
            "files", "bookmarks"]

        sources.append({
            "name": name,
            "display_name": module.display_name,
            "connected": is_connected,
            "last_indexed": "on-demand",
            "total_items": 0,  # Will update when searching
            "requires_auth": name in ["gmail", "drive", "notion", "slack"]
        })

    result = {
        "sources": sources,
        "authenticated": current_user is not None,
        "user_id": current_user.id if current_user else None
    }

    # Cache it
    sources_cache["data"] = result
    sources_cache["timestamp"] = datetime.now()

    return result

# @app.post("/search", response_model=SearchResponse)
# async def universal_search(
#     request: SearchRequest,
#     current_user: Optional[User] = Depends(get_current_user)
# ):
#     """Universal search across all or specified sources"""
#     start_time = datetime.now()

#     # Determine which sources to search
#     sources_to_search = request.sources or list(search_modules.keys())

#     # Filter sources based on authentication
#     if not current_user:
#         # Without auth, only allow public sources
#         public_sources = ["files", "bookmarks"]
#         sources_to_search = [
#             s for s in sources_to_search if s in public_sources]

#     # Run searches in parallel
#     search_tasks = []
#     for source_name in sources_to_search:
#         if source_name in search_modules:
#             module = search_modules[source_name]
#             task = asyncio.create_task(module.search(
#                 request.query, limit=request.limit))
#             search_tasks.append((source_name, task))

#     # Collect results
#     all_results = []
#     for source_name, task in search_tasks:
#         try:
#             results = await task
#             all_results.extend(results)
#         except Exception as e:
#             print(f"Error searching {source_name}: {e}")
#             continue

#     # Sort by relevance score (descending)
#     all_results.sort(key=lambda x: x.relevance_score, reverse=True)

#     # Limit results
#     limited_results = all_results[:request.limit]

#     search_time = (datetime.now() - start_time).total_seconds() * 1000

#     return SearchResponse(
#         results=limited_results,
#         total_results=len(all_results),
#         search_time_ms=int(search_time),
#         sources_searched=sources_to_search,
#         user_id=current_user.id if current_user else None
#     )
# In main.py - UPDATE THIS FUNCTION


@app.post("/search", response_model=SearchResponse)
async def universal_search(
    request: SearchRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Universal search across all or specified sources"""
    start_time = datetime.now()

    # Determine which sources to search
    sources_to_search = request.sources or list(search_modules.keys())

    # Filter sources based on authentication
    if not current_user:
        # Without auth, only allow public sources
        public_sources = ["files", "bookmarks"]
        sources_to_search = [
            s for s in sources_to_search if s in public_sources]

    # 🆕 CREATE PER-USER MODULE INSTANCES
    user_search_modules = {}
    for source_name in sources_to_search:
        if source_name in ["files", "bookmarks"]:
            # Public sources - use global module
            user_search_modules[source_name] = search_modules[source_name]
        else:
            # Private sources - need user credentials
            if current_user:
                user_creds = get_user_credential(current_user.id, source_name)
                if user_creds:
                    # Create module instance with user's credentials
                    if source_name == "gmail":
                        user_search_modules[source_name] = GmailSearchModule(
                            user_credentials=user_creds)
                    elif source_name == "drive":
                        user_search_modules[source_name] = DriveSearchModule(
                            user_credentials=user_creds)
                    elif source_name == "notion":
                        user_search_modules[source_name] = NotionSearchModule(
                            user_credentials=user_creds)
                    elif source_name == "slack":
                        user_search_modules[source_name] = SlackSearchModule(
                            user_credentials=user_creds)

    # Run searches in parallel using user-specific modules
    search_tasks = []
    for source_name, module in user_search_modules.items():
        task = asyncio.create_task(module.search(
            request.query, limit=request.limit))
        search_tasks.append((source_name, task))

    # Collect results (rest of the code stays the same)
    all_results = []
    for source_name, task in search_tasks:
        try:
            results = await task
            all_results.extend(results)
        except Exception as e:
            print(f"Error searching {source_name}: {e}")
            continue

    all_results.sort(key=lambda x: x.relevance_score, reverse=True)
    limited_results = all_results[:request.limit]
    search_time = (datetime.now() - start_time).total_seconds() * 1000

    return SearchResponse(
        results=limited_results,
        total_results=len(all_results),
        search_time_ms=int(search_time),
        sources_searched=list(user_search_modules.keys()),
        user_id=current_user.id if current_user else None
    )


@app.post("/sources/{source_name}/reindex")
async def reindex_source(
    source_name: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_auth)  # Require auth for reindexing
):
    """Trigger reindexing of a specific source"""
    if source_name not in search_modules:
        raise HTTPException(status_code=404, detail="Source not found")

    module = search_modules[source_name]
    background_tasks.add_task(module.reindex)

    return {"message": f"Reindexing {source_name} started in background", "user_id": current_user.id}


@app.get("/sources/{source_name}/status")
async def get_source_status(
    source_name: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get detailed status of a specific source"""
    if source_name not in search_modules:
        raise HTTPException(status_code=404, detail="Source not found")

    module = search_modules[source_name]
    status = await module.get_connection_status()
    status["user_authenticated"] = current_user is not None
    return status


@app.post("/connect/gmail")
async def connect_gmail(
    credentials: dict,
    current_user: User = Depends(require_auth)
):
    """Connect user's Gmail account"""
    # Store the OAuth credentials
    store_user_credential(current_user.id, "gmail", credentials)
    return {"message": "Gmail connected successfully"}


@app.post("/connect/drive")
async def connect_drive(
    credentials: dict,
    current_user: User = Depends(require_auth)
):
    """Connect user's Drive account"""
    store_user_credential(current_user.id, "drive", credentials)
    return {"message": "Drive connected successfully"}


@app.post("/connect/notion")
async def connect_notion(
    api_key: str,
    current_user: User = Depends(require_auth)
):
    """Connect user's Notion workspace"""
    store_user_credential(current_user.id, "notion", {"api_key": api_key})
    return {"message": "Notion connected successfully"}

# //////////////////////////
# Add these imports at the top

# Your existing Google Client ID
GOOGLE_CLIENT_ID = "396804387135-sak8ueujt310gs9if8cv6374cakaoh0k.apps.googleusercontent.com"
# Get this from Google Cloud Console
GOOGLE_CLIENT_SECRET = "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"

# main.py - Update OAuth callbacks to get user from state
# Replace the gmail_oauth_callback in main.py with this fixed version

@app.get("/oauth/gmail/callback")
async def gmail_oauth_callback(code: str, state: Optional[str] = None):
    """Handle Gmail OAuth callback - FIXED VERSION"""
    try:
        # Decode the user token from state
        if not state:
            print("❌ No state parameter in callback")
            return RedirectResponse(
                url='http://localhost:3000/sources?error=missing_auth_state'
            )

        # Verify the token
        from auth.auth_utils import verify_token
        payload = verify_token(state)

        if not payload:
            print("❌ Invalid auth token in state")
            return RedirectResponse(
                url='http://localhost:3000/sources?error=invalid_auth_token'
            )

        user_id = payload.get("sub")
        print(f"🔐 Processing Gmail OAuth for user: {user_id}")

        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': GOOGLE_CLIENT_ID,
                    'client_secret': GOOGLE_CLIENT_SECRET,
                    'redirect_uri': 'http://localhost:8000/oauth/gmail/callback',
                    'grant_type': 'authorization_code'
                }
            )

            if token_response.status_code == 200:
                tokens = token_response.json()
                access_token = tokens.get('access_token')
                refresh_token = tokens.get('refresh_token')
                
                print(f"✅ Got tokens:")
                print(f"   - Access token: {access_token[:20]}..." if access_token else "   - No access token!")
                print(f"   - Refresh token: {refresh_token[:20]}..." if refresh_token else "   - No refresh token!")

                # Store credentials with both tokens
                store_user_credential(user_id, "gmail", {
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'type': 'oauth',
                    'token_type': tokens.get('token_type', 'Bearer'),
                    'expires_in': tokens.get('expires_in')
                })

                print(f"✅ Gmail connected for user {user_id}")
                
                # Verify the connection works
                try:
                    from search_modules.gmail_search import GmailSearchModule
                    gmail_module = GmailSearchModule(user_credentials={
                        'access_token': access_token,
                        'refresh_token': refresh_token
                    })
                    
                    if gmail_module.service:
                        profile = gmail_module.service.users().getProfile(userId='me').execute()
                        print(f"✅ Gmail verified: {profile.get('emailAddress')} ({profile.get('messagesTotal')} messages)")
                    else:
                        print("⚠️ Gmail service not initialized")
                except Exception as e:
                    print(f"⚠️ Gmail verification failed: {e}")

                return RedirectResponse(
                    url=f'http://localhost:3000/sources?gmail_connected=true'
                )
            else:
                error_data = token_response.json()
                print(f"❌ Token exchange failed: {token_response.status_code}")
                print(f"   Error: {error_data}")
                return RedirectResponse(
                    url=f'http://localhost:3000/sources?error=gmail_token_exchange_failed'
                )

    except Exception as e:
        print(f"❌ Gmail OAuth error: {e}")
        import traceback
        traceback.print_exc()
        return RedirectResponse(
            url=f'http://localhost:3000/sources?error=gmail_auth_failed'
        )

@app.get("/oauth/drive/callback")
async def drive_oauth_callback(code: str, state: Optional[str] = None):
    """Handle Drive OAuth callback"""
    try:
        if not state:
            return RedirectResponse(
                url='http://localhost:3000/sources?error=missing_auth_state'
            )

        from auth.auth_utils import verify_token
        payload = verify_token(state)

        if not payload:
            return RedirectResponse(
                url='http://localhost:3000/sources?error=invalid_auth_token'
            )

        user_id = payload.get("sub")

        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': GOOGLE_CLIENT_ID,
                    'client_secret': GOOGLE_CLIENT_SECRET,
                    'redirect_uri': 'http://localhost:8000/oauth/drive/callback',
                    'grant_type': 'authorization_code'
                }
            )

            if token_response.status_code == 200:
                tokens = token_response.json()
                access_token = tokens.get('access_token')

                store_user_credential(user_id, "drive", {
                    'access_token': access_token,
                    'type': 'oauth'
                })

                print(f"✅ Drive connected for user {user_id}")

                return RedirectResponse(
                    url='http://localhost:3000/sources?drive_connected=true'
                )
            else:
                return RedirectResponse(
                    url='http://localhost:3000/sources?error=drive_token_exchange_failed'
                )

    except Exception as e:
        print(f"❌ Drive OAuth error: {e}")
        import traceback
        traceback.print_exc()
        return RedirectResponse(
            url='http://localhost:3000/sources?error=drive_auth_failed'
        )

# Add this debug endpoint to main.py to test Gmail connection

@app.get("/debug/gmail/{user_id}")
async def debug_gmail_connection(user_id: str):
    """Debug endpoint to test Gmail connection"""
    try:
        # Get user credentials
       
        gmail_creds = get_user_credential(user_id, "gmail")
        
        if not gmail_creds:
            return {"error": "No Gmail credentials found for user"}
        
        # Try to create Gmail module
        from search_modules.gmail_search import GmailSearchModule
        gmail_module = GmailSearchModule(user_credentials=gmail_creds)
        
        # Check if service initialized
        if not gmail_module.service:
            return {
                "error": "Gmail service not initialized",
                "credentials": {
                    "has_access_token": "access_token" in gmail_creds,
                    "has_refresh_token": "refresh_token" in gmail_creds
                }
            }
        
        # Try to get profile
        try:
            from googleapiclient.discovery import build
            service = gmail_module.service
            profile = service.users().getProfile(userId='me').execute()
            
            return {
                "status": "success",
                "email": profile.get('emailAddress'),
                "total_messages": profile.get('messagesTotal'),
                "credentials_stored": True,
                "service_initialized": True
            }
        except Exception as e:
            return {
                "error": "Gmail API call failed",
                "message": str(e),
                "service_initialized": gmail_module.service is not None
            }
            
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.get("/debug/credentials")
async def debug_credentials(current_user: User = Depends(require_auth)):
    """Debug: Show what credentials are stored"""
   
    
    services = get_user_connected_services(current_user.id)
    creds = user_credentials_db.get(current_user.id, {})
    
    # Mask tokens for security
    masked_creds = {}
    for service, cred in creds.items():
        masked_creds[service] = {
            key: f"{val[:10]}..." if isinstance(val, str) and len(val) > 10 else val
            for key, val in cred.items()
        }
    
    return {
        "user_id": current_user.id,
        "connected_services": services,
        "credentials": masked_creds
    }
# ///////////////////////////
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
