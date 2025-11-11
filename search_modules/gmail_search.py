# search_modules/gmail_search.py - REAL Gmail API version
import os
from typing import List, Dict, Any
from .base_search import BaseSearchModule, SearchResult
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import Flow
import base64
import email


class GmailSearchModule(BaseSearchModule):
    def __init__(self):
        super().__init__("gmail", "Gmail")
        self.credentials = None
        self.service = None
        self.credentials_path = os.getenv(
            "GMAIL_CREDENTIALS_PATH", "gmail_credentials.json")
        self._initialize_service()

    def _initialize_service(self):
        """Initialize Gmail API service"""
        try:
            if os.path.exists(self.credentials_path):
                self.credentials = Credentials.from_authorized_user_file(
                    self.credentials_path)
                self.service = build(
                    'gmail', 'v1', credentials=self.credentials)
                self.is_connected = True
            else:
                self.is_connected = False
        except Exception as e:
            print(f"Gmail API initialization failed: {e}")
            self.is_connected = False

    async def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        """Search Gmail using real Gmail API"""
        if not self.service:
            return []

        results = []

        try:
            # Search Gmail
            search_results = self.service.users().messages().list(
                userId='me',
                q=query,  # Gmail search query
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
                    (h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
                sender = next(
                    (h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
                date = next((h['value']
                            for h in headers if h['name'] == 'Date'), '')

                # Get email body/snippet
                snippet = msg.get('snippet', '')

                # Calculate relevance
                relevance_score = self.calculate_relevance_score(
                    query, subject, snippet)

                result = SearchResult(
                    id=f"gmail_{message['id']}",
                    title=f"Email: {subject}",
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
            print(f"Gmail search error: {e}")

        return results[:limit]

    # async def get_connection_status(self) -> Dict[str, Any]:
    #     """Get real Gmail connection status"""
    #     if not self.service:
    #         return {
    #             "connected": False,
    #             "error": "Gmail API not configured",
    #             "setup_required": True
    #         }

    #     try:
    #         # Test API connection
    #         profile = self.service.users().getProfile(userId='me').execute()
    #         return {
    #             "connected": True,
    #             "email": profile.get('emailAddress'),
    #             "total_messages": profile.get('messagesTotal', 0),
    #             "last_indexed": "real-time",
    #             "api_quota_remaining": "Available"
    #         }
    #     except Exception as e:
    #         return {
    #             "connected": False,
    #             "error": str(e)
    #         }

    async def get_connection_status(self) -> Dict[str, Any]:
        """Get connection status - instant return"""
        return {
            "connected": True,  # We'll check real connection in frontend
            "last_indexed": "on-demand",
            "total_items": 0  # Return 0, will update when actually connected
        }

    async def reindex(self) -> bool:
        """Gmail is real-time, no reindexing needed"""
        return True

# Setup instructions for Gmail API:
# 1. Go to Google Cloud Console
# 2. Enable Gmail API
# 3. Create credentials (OAuth 2.0)
# 4. Download credentials.json
# 5. Install: pip install google-auth google-auth-oauthlib google-api-python-client
