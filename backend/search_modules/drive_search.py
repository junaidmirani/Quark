# search_modules/drive_search.py - FIXED VERSION
import os
from typing import List, Dict, Any, Optional
from .base_search import BaseSearchModule, SearchResult
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


class DriveSearchModule(BaseSearchModule):
    def __init__(self, user_credentials: Optional[Dict] = None):
        """
        Initialize Drive search module
        
        Args:
            user_credentials: Dict with 'access_token' and optional 'refresh_token'
        """
        super().__init__("drive", "Google Drive")
        self.credentials = None
        self.service = None
        self.user_credentials = user_credentials
        
        # If user credentials provided, initialize with them
        if user_credentials:
            self._initialize_service_with_credentials(user_credentials)
        else:
            # Fallback to file-based credentials
            self.credentials_path = os.getenv(
                "DRIVE_CREDENTIALS_PATH", "drive_credentials.json")
            self._initialize_service()

    def _initialize_service_with_credentials(self, creds_dict: Dict):
        """Initialize Drive API service with user credentials"""
        try:
            # Create credentials object from dict
            self.credentials = Credentials(
                token=creds_dict.get('access_token'),
                refresh_token=creds_dict.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=os.getenv('GOOGLE_CLIENT_ID', '396804387135-sak8ueujt310gs9if8cv6374cakaoh0k.apps.googleusercontent.com'),
                client_secret=os.getenv('GOOGLE_CLIENT_SECRET', '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')
            )
            
            self.service = build('drive', 'v3', credentials=self.credentials)
            self.is_connected = True
            print(f"✅ Drive service initialized with user credentials")
        except Exception as e:
            print(f"❌ Drive API initialization failed: {e}")
            self.is_connected = False

    def _initialize_service(self):
        """Initialize Drive API service from file (legacy)"""
        try:
            if os.path.exists(self.credentials_path):
                self.credentials = Credentials.from_authorized_user_file(
                    self.credentials_path)
                self.service = build('drive', 'v3', credentials=self.credentials)
                self.is_connected = True
            else:
                self.is_connected = False
        except Exception as e:
            print(f"Drive API initialization failed: {e}")
            self.is_connected = False

    async def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        """Search Google Drive using real Drive API"""
        if not self.service:
            print("⚠️ Drive service not initialized")
            return []

        results = []

        try:
            # Search Drive files
            search_results = self.service.files().list(
                q=f"fullText contains '{query}' or name contains '{query}'",
                pageSize=limit,
                fields="files(id,name,mimeType,modifiedTime,webViewLink,size,owners,iconLink)"
            ).execute()

            files = search_results.get('files', [])

            for file in files:
                # Get file content for snippet (for text files)
                snippet = f"📄 {file.get('mimeType', 'Unknown type')}"
                
                # Try to get a better snippet for supported types
                if 'text' in file.get('mimeType', '') or 'document' in file.get('mimeType', ''):
                    try:
                        content = self.service.files().get_media(
                            fileId=file['id']).execute()
                        if isinstance(content, bytes):
                            snippet = content.decode('utf-8', errors='ignore')[:200] + "..."
                    except:
                        snippet = f"{file.get('name', '')} - {file.get('mimeType', '')}"
                else:
                    snippet = f"{file.get('name', '')} - {file.get('mimeType', '')}"

                # Calculate relevance
                relevance_score = self.calculate_relevance_score(
                    query,
                    file.get('name', ''),
                    snippet
                )

                # Format file size
                size = file.get('size')
                size_str = self._format_size(int(size)) if size else 'Unknown size'

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
                        "size": size_str,
                        "owners": file.get('owners', [])
                    }
                )
                results.append(result)

        except Exception as e:
            print(f"❌ Drive search error: {e}")
            import traceback
            traceback.print_exc()

        return results[:limit]

    def _format_size(self, size_bytes):
        """Format file size in human readable format"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024**2:
            return f"{size_bytes/1024:.1f} KB"
        elif size_bytes < 1024**3:
            return f"{size_bytes/(1024**2):.1f} MB"
        else:
            return f"{size_bytes/(1024**3):.1f} GB"

    async def get_connection_status(self) -> Dict[str, Any]:
        """Get connection status"""
        if not self.service:
            return {
                "connected": False,
                "error": "Drive API not configured"
            }

        try:
            # Test API connection and get storage info
            about = self.service.about().get(fields="storageQuota,user").execute()
            return {
                "connected": True,
                "user_email": about.get('user', {}).get('emailAddress'),
                "storage_used": self._format_size(int(about.get('storageQuota', {}).get('usage', 0))),
                "storage_limit": self._format_size(int(about.get('storageQuota', {}).get('limit', 0))),
                "last_indexed": "real-time"
            }
        except Exception as e:
            print(f"❌ Drive status check failed: {e}")
            return {
                "connected": False,
                "error": str(e)
            }

    async def reindex(self) -> bool:
        """Drive is real-time, no reindexing needed"""
        return True