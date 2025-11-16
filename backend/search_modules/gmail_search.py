# search_modules/gmail_search.py - FIXED VERSION
import os
from typing import List, Dict, Any, Optional
from .base_search import BaseSearchModule, SearchResult
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import base64
import email


class GmailSearchModule(BaseSearchModule):
    def __init__(self, user_credentials: Optional[Dict] = None):
        """
        Initialize Gmail search module
        
        Args:
            user_credentials: Dict with 'access_token' and optional 'refresh_token'
        """
        super().__init__("gmail", "Gmail")
        self.credentials = None
        self.service = None
        self.user_credentials = user_credentials
        
        # If user credentials provided, initialize with them
        if user_credentials:
            self._initialize_service_with_credentials(user_credentials)
        else:
            # Fallback to file-based credentials (for backward compatibility)
            self.credentials_path = os.getenv(
                "GMAIL_CREDENTIALS_PATH", "gmail_credentials.json")
            self._initialize_service()

    def _initialize_service_with_credentials(self, creds_dict: Dict):
        """Initialize Gmail API service with user credentials"""
        try:
            # Create credentials object from dict
            self.credentials = Credentials(
                token=creds_dict.get('access_token'),
                refresh_token=creds_dict.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=os.getenv('GOOGLE_CLIENT_ID', '396804387135-sak8ueujt310gs9if8cv6374cakaoh0k.apps.googleusercontent.com'),
                client_secret=os.getenv('GOOGLE_CLIENT_SECRET', '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')
            )
            
            self.service = build('gmail', 'v1', credentials=self.credentials)
            self.is_connected = True
            print(f"✅ Gmail service initialized with user credentials")
        except Exception as e:
            print(f"❌ Gmail API initialization failed: {e}")
            self.is_connected = False

    def _initialize_service(self):
        """Initialize Gmail API service from file (legacy)"""
        try:
            if os.path.exists(self.credentials_path):
                self.credentials = Credentials.from_authorized_user_file(
                    self.credentials_path)
                self.service = build('gmail', 'v1', credentials=self.credentials)
                self.is_connected = True
            else:
                self.is_connected = False
        except Exception as e:
            print(f"Gmail API initialization failed: {e}")
            self.is_connected = False

    async def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        """Search Gmail using real Gmail API"""
        if not self.service:
            print("⚠️ Gmail service not initialized")
            return []

        results = []

        try:
            # Search Gmail
            search_results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=limit
            ).execute()

            messages = search_results.get('messages', [])

            for message in messages:
                # Get full message details
                msg = self.service.users().messages().get(
                    userId='me',
                    id=message['id'],
                    format='full'
                ).execute()

                # Extract email data
                headers = msg['payload'].get('headers', [])
                subject = next(
                    (h['value'] for h in headers if h['name'] == 'Subject'), 
                    'No Subject'
                )
                sender = next(
                    (h['value'] for h in headers if h['name'] == 'From'), 
                    'Unknown'
                )
                date = next(
                    (h['value'] for h in headers if h['name'] == 'Date'), 
                    ''
                )

                # Get email snippet
                snippet = msg.get('snippet', '')

                # Calculate relevance
                relevance_score = self.calculate_relevance_score(
                    query, subject, snippet
                )

                result = SearchResult(
                    id=f"gmail_{message['id']}",
                    title=f"✉️ {subject}",
                    snippet=snippet,
                    source="gmail",
                    source_url=f"https://mail.google.com/mail/u/0/#inbox/{message['id']}",
                    timestamp=date,
                    relevance_score=relevance_score,
                    metadata={
                        "sender": sender,
                        "message_id": message['id'],
                        "type": "email"
                    }
                )
                results.append(result)

        except Exception as e:
            print(f"❌ Gmail search error: {e}")
            import traceback
            traceback.print_exc()

        return results[:limit]

    async def get_connection_status(self) -> Dict[str, Any]:
        """Get connection status"""
        if not self.service:
            return {
                "connected": False,
                "error": "Gmail API not configured"
            }
        
        try:
            # Quick test - just check if we can access profile
            profile = self.service.users().getProfile(userId='me').execute()
            return {
                "connected": True,
                "email": profile.get('emailAddress'),
                "total_messages": profile.get('messagesTotal', 0),
                "last_indexed": "real-time"
            }
        except Exception as e:
            print(f"❌ Gmail status check failed: {e}")
            return {
                "connected": False,
                "error": str(e)
            }

    async def reindex(self) -> bool:
        """Gmail is real-time, no reindexing needed"""
        return True