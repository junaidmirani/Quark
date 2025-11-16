# search_modules/bookmark_search.py - REAL browser bookmarks
import os
import json
import sqlite3
from pathlib import Path
from typing import List, Dict, Any
from .base_search import BaseSearchModule, SearchResult
from datetime import datetime


class BookmarkSearchModule(BaseSearchModule):
    def __init__(self):
        super().__init__("bookmarks", "Browser Bookmarks")
        self.bookmark_paths = self._get_bookmark_paths()
        self.bookmarks = []
        self._load_bookmarks()

    def _get_bookmark_paths(self) -> Dict[str, Path]:
        """Get paths to browser bookmark files"""
        home = Path.home()
        paths = {}

        # Chrome bookmarks
        chrome_paths = [
            home / "AppData/Local/Google/Chrome/User Data/Default/Bookmarks",  # Windows
            home / "Library/Application Support/Google/Chrome/Default/Bookmarks",  # macOS
            home / ".config/google-chrome/Default/Bookmarks",  # Linux
        ]
        for path in chrome_paths:
            if path.exists():
                paths["Chrome"] = path
                break

        # Firefox bookmarks (more complex, using places.sqlite)
        firefox_paths = [
            home / "AppData/Roaming/Mozilla/Firefox/Profiles",  # Windows
            home / "Library/Application Support/Firefox/Profiles",  # macOS
            home / ".mozilla/firefox",  # Linux
        ]
        for base_path in firefox_paths:
            if base_path.exists():
                # Find profile directory
                for profile_dir in base_path.glob("*.default*"):
                    places_db = profile_dir / "places.sqlite"
                    if places_db.exists():
                        paths["Firefox"] = places_db
                        break

        # Edge bookmarks
        edge_paths = [
            home / "AppData/Local/Microsoft/Edge/User Data/Default/Bookmarks",  # Windows
            home / "Library/Application Support/Microsoft Edge/Default/Bookmarks",  # macOS
        ]
        for path in edge_paths:
            if path.exists():
                paths["Edge"] = path
                break

        return paths

    def _load_bookmarks(self):
        """Load bookmarks from all browsers"""
        self.bookmarks = []

        for browser, path in self.bookmark_paths.items():
            try:
                if browser == "Firefox":
                    self._load_firefox_bookmarks(path)
                else:
                    self._load_chromium_bookmarks(path, browser)
            except Exception as e:
                print(f"Error loading {browser} bookmarks: {e}")

        self.is_connected = len(self.bookmarks) > 0

    def _load_chromium_bookmarks(self, path: Path, browser: str):
        """Load Chrome/Edge bookmarks"""
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        def extract_bookmarks(node, folder_path=""):
            if node.get('type') == 'url':
                self.bookmarks.append({
                    "id": node.get('id', ''),
                    "title": node.get('name', ''),
                    "url": node.get('url', ''),
                    "date_added": node.get('date_added', ''),
                    "browser": browser,
                    "folder": folder_path
                })
            elif node.get('type') == 'folder':
                folder_name = node.get('name', '')
                new_path = f"{folder_path}/{folder_name}" if folder_path else folder_name
                for child in node.get('children', []):
                    extract_bookmarks(child, new_path)

        # Extract from bookmark bar and other bookmarks
        roots = data.get('roots', {})
        for root_name, root_data in roots.items():
            if root_name in ['bookmark_bar', 'other', 'synced']:
                extract_bookmarks(root_data)

    def _load_firefox_bookmarks(self, path: Path):
        """Load Firefox bookmarks from places.sqlite"""
        conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT b.title, p.url, b.dateAdded, f.title as folder
            FROM moz_bookmarks b
            JOIN moz_places p ON b.fk = p.id
            LEFT JOIN moz_bookmarks f ON b.parent = f.id
            WHERE b.type = 1 AND p.url IS NOT NULL
        ''')

        for row in cursor.fetchall():
            title, url, date_added, folder = row
            self.bookmarks.append({
                "id": str(hash(url)),
                "title": title or url,
                "url": url,
                "date_added": str(date_added) if date_added else '',
                "browser": "Firefox",
                "folder": folder or ""
            })

        conn.close()

    async def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        """Search through browser bookmarks"""
        results = []
        query_lower = query.lower()

        for bookmark in self.bookmarks:
            title = bookmark.get('title', '')
            url = bookmark.get('url', '')
            folder = bookmark.get('folder', '')

            # Check if query matches title, URL, or folder
            if (query_lower in title.lower() or
                query_lower in url.lower() or
                    query_lower in folder.lower()):

                # Calculate relevance
                relevance_score = self.calculate_relevance_score(
                    query, title, f"{url} {folder}"
                )

                # Create snippet
                snippet_parts = []
                if folder:
                    snippet_parts.append(f"Folder: {folder}")
                snippet_parts.append(f"URL: {url}")
                snippet = " | ".join(snippet_parts)

                result = SearchResult(
                    id=f"bookmark_{bookmark['id']}",
                    title=f"🔖 {title}",
                    snippet=snippet,
                    source="bookmarks",
                    source_url=url,
                    timestamp=bookmark.get('date_added', ''),
                    relevance_score=relevance_score,
                    metadata={
                        "browser": bookmark.get('browser'),
                        "folder": folder,
                        "domain": self._extract_domain(url)
                    }
                )
                results.append(result)

        # Sort by relevance and limit
        results.sort(key=lambda x: x.relevance_score, reverse=True)
        return results[:limit]

    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        try:
            from urllib.parse import urlparse
            return urlparse(url).netloc
        except:
            return ""

    async def get_connection_status(self) -> Dict[str, Any]:
        """Get bookmark connection status"""
        browsers_found = list(self.bookmark_paths.keys())

        return {
            "connected": self.is_connected,
            "total_items": len(self.bookmarks),
            "browsers_found": browsers_found,
            "last_indexed": datetime.now().isoformat(),
            "bookmark_sources": [
                {"browser": browser, "path": str(path)}
                for browser, path in self.bookmark_paths.items()
            ]
        }

    async def reindex(self) -> bool:
        """Reload bookmarks from browsers"""
        print(f"Reindexing bookmarks...")
        self._load_bookmarks()
        print(
            f"Loaded {len(self.bookmarks)} bookmarks from {len(self.bookmark_paths)} browsers")
        return True

# This will automatically find and index bookmarks from:
# - Chrome
# - Firefox
# - Edge
# - Other Chromium-based browsers
#
# No setup required - it automatically detects browser installations
