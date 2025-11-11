# search_modules/file_search.py - REAL filesystem search
import os
import asyncio
from pathlib import Path
from typing import List, Dict, Any
from .base_search import BaseSearchModule, SearchResult
import mimetypes
import sqlite3
from datetime import datetime


class FileSearchModule(BaseSearchModule):
    def __init__(self):
        super().__init__("files", "Local Files")
        # Configure search directories
        self.search_directories = [
            Path.home() / "Documents",
            Path.home() / "Downloads",
            Path.home() / "Desktop",
            # Add more directories as needed
        ]
        self.db_path = "file_index.db"
        self.supported_text_extensions = {
            '.txt', '.md', '.py', '.js', '.html', '.css', '.json',
            '.xml', '.csv', '.log', '.ini', '.cfg', '.yaml', '.yml'
        }
        self._initialize_db()

    def _initialize_db(self):
        """Initialize SQLite database for file indexing"""
        conn = sqlite3.connect(self.db_path)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY,
                path TEXT UNIQUE,
                name TEXT,
                content TEXT,
                modified_time TEXT,
                size INTEGER,
                extension TEXT
            )
        ''')
        conn.commit()
        conn.close()

    async def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        """Search through indexed local files"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Search in filename and content
        cursor.execute('''
            SELECT path, name, content, modified_time, size, extension
            FROM files
            WHERE name LIKE ? OR content LIKE ?
            ORDER BY 
                CASE 
                    WHEN name LIKE ? THEN 1 
                    ELSE 2 
                END,
                modified_time DESC
            LIMIT ?
        ''', (f'%{query}%', f'%{query}%', f'%{query}%', limit))

        results = []
        for row in cursor.fetchall():
            path, name, content, modified_time, size, extension = row

            # Create snippet
            if content and query.lower() in content.lower():
                # Find the query in content and create snippet around it
                content_lower = content.lower()
                query_lower = query.lower()
                index = content_lower.find(query_lower)

                start = max(0, index - 50)
                end = min(len(content), index + 100)
                snippet = "..." + content[start:end] + "..."
            else:
                snippet = f"File: {name} ({self._format_size(size)})"

            # Calculate relevance
            relevance_score = self.calculate_relevance_score(
                query, name, content or "")

            result = SearchResult(
                id=f"file_{hash(path)}",
                title=f"📁 {name}",
                snippet=snippet,
                source="files",
                source_url=f"file://{path}",
                timestamp=modified_time,
                relevance_score=relevance_score,
                metadata={
                    "path": path,
                    "size": size,
                    "extension": extension,
                    "type": "file"
                }
            )
            results.append(result)

        conn.close()
        return results

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
        """Get filesystem connection status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM files")
        total_files = cursor.fetchone()[0]
        conn.close()

        accessible_dirs = []
        for directory in self.search_directories:
            if directory.exists() and directory.is_dir():
                accessible_dirs.append(str(directory))

        return {
            "connected": len(accessible_dirs) > 0,
            "total_items": total_files,
            "search_directories": accessible_dirs,
            "last_indexed": self._get_last_index_time(),
            "supported_extensions": list(self.supported_text_extensions)
        }

    def _get_last_index_time(self):
        """Get the last indexing time"""
        try:
            stat = os.stat(self.db_path)
            return datetime.fromtimestamp(stat.st_mtime).isoformat()
        except:
            return None

    async def reindex(self) -> bool:
        """Reindex all files in search directories"""
        print(f"Starting file reindexing...")

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Clear existing index
        cursor.execute("DELETE FROM files")

        indexed_count = 0

        for directory in self.search_directories:
            if not directory.exists():
                continue

            for file_path in directory.rglob('*'):
                if file_path.is_file():
                    try:
                        # Get file info
                        stat_info = file_path.stat()
                        extension = file_path.suffix.lower()

                        # Read content for text files
                        content = ""
                        if extension in self.supported_text_extensions and stat_info.st_size < 10**6:  # Max 1MB
                            try:
                                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                    content = f.read()
                            except:
                                content = ""

                        # Insert into database
                        cursor.execute('''
                            INSERT OR REPLACE INTO files 
                            (path, name, content, modified_time, size, extension)
                            VALUES (?, ?, ?, ?, ?, ?)
                        ''', (
                            str(file_path),
                            file_path.name,
                            content,
                            datetime.fromtimestamp(
                                stat_info.st_mtime).isoformat(),
                            stat_info.st_size,
                            extension
                        ))

                        indexed_count += 1

                        # Commit every 100 files
                        if indexed_count % 100 == 0:
                            conn.commit()
                            print(f"Indexed {indexed_count} files...")

                    except Exception as e:
                        print(f"Error indexing {file_path}: {e}")
                        continue

        conn.commit()
        conn.close()

        print(f"File reindexing complete. Indexed {indexed_count} files.")
        return True

# Usage:
# The file search will automatically index and search through:
# - Documents folder
# - Downloads folder
# - Desktop folder
# - Text files, code files, documents, etc.
#
# To add more directories, modify self.search_directories in __init__
