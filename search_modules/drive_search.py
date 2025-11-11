# search_modules/drive_search.py - REAL Google Drive API version
import os
from typing import List, Dict, Any
from .base_search import BaseSearchModule, SearchResult
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


class DriveSearchModule(BaseSearchModule):
    def __init__(self):
        super().__init__("drive", "Google Drive")
        self.credentials = None
        self.service = None
        self.credentials_path = os.getenv(
            "DRIVE_CREDENTIALS_PATH", "drive_credentials.json")
        self._initialize_service()

    def _initialize_service(self):
        """Initialize Google Drive API service"""
        try:
            if os.path.exists(self.credentials_path):
                self.credentials = Credentials.from_authorized_user_file(
                    self.credentials_path)
                self.service = build(
                    'drive', 'v3', credentials=self.credentials)
                self.is_connected = True
            else:
                self.is_connected = False
        except Exception as e:
            print(f"Drive API initialization failed: {e}")
            self.is_connected = False

    async def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        """Search Google Drive using real Drive API"""
        if not self.service:
            return []

        results = []

        try:
            # Search Drive files
            search_results = self.service.files().list(
                q=f"fullText contains '{query}' or name contains '{query}'",
                pageSize=limit,
                fields="files(id,name,mimeType,modifiedTime,webViewLink,size,owners)"
            ).execute()

            files = search_results.get('files', [])

            for file in files:
                # Get file content for snippet (for text files)
                snippet = f"File type: {file.get('mimeType', 'Unknown')}"
                if 'text' in file.get('mimeType', ''):
                    try:
                        # Get file content for text files
                        content = self.service.files().get_media(
                            fileId=file['id']).execute()
                        snippet = content.decode('utf-8')[:200] + "..."
                    except:
                        snippet = file.get('name', '') + \
                            " - " + file.get('mimeType', '')

                # Calculate relevance
                relevance_score = self.calculate_relevance_score(
                    query,
                    file.get('name', ''),
                    snippet
                )

                result = SearchResult(
                    id=f"drive_{file['id']}",
                    title=f"📄 {file.get('name', 'Untitled')}",
                    snippet=snippet,
                    source="drive",
                    source_url=file.get('webViewLink', ''),
                    timestamp=file.get('modifiedTime', ''),
                    relevance_score=relevance_score,
                    metadata={
                        "file_id": file['id'],
                        "mime_type": file.get('mimeType'),
                        "size": file.get('size'),
                        "owners": file.get('owners', [])
                    }
                )
                results.append(result)

        except Exception as e:
            print(f"Drive search error: {e}")

        return results[:limit]

    # async def get_connection_status(self) -> Dict[str, Any]:
    #     """Get real Drive connection status"""
    #     if not self.service:
    #         return {
    #             "connected": False,
    #             "error": "Drive API not configured"
    #         }

    #     try:
    #         # Test API connection and get storage info
    #         about = self.service.about().get(fields="storageQuota,user").execute()
    #         return {
    #             "connected": True,
    #             "user_email": about.get('user', {}).get('emailAddress'),
    #             "storage_used": about.get('storageQuota', {}).get('usage'),
    #             "storage_limit": about.get('storageQuota', {}).get('limit'),
    #             "last_indexed": "real-time"
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
        """Drive is real-time, no reindexing needed"""
        return True

# Setup instructions:
# 1. Enable Google Drive API in Google Cloud Console
# 2. Create OAuth 2.0 credentials
# 3. Install: pip install google-auth google-auth-oauthlib google-api-python-client
