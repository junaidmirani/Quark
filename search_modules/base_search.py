from abc import ABC, abstractmethod
from typing import List, Dict, Any
from pydantic import BaseModel
import asyncio


class SearchResult(BaseModel):
    id: str
    title: str
    snippet: str
    source: str
    source_url: str
    timestamp: str = None
    relevance_score: float = 0.0
    metadata: Dict[str, Any] = {}


class BaseSearchModule(ABC):
    def __init__(self, name: str, display_name: str):
        self.name = name
        self.display_name = display_name
        self.is_connected = False

    @abstractmethod
    async def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        """Search for query in this source"""
        pass

    @abstractmethod
    async def get_connection_status(self) -> Dict[str, Any]:
        """Get connection status and metadata"""
        pass

    @abstractmethod
    async def reindex(self) -> bool:
        """Reindex the source"""
        pass

    def calculate_relevance_score(self, query: str, title: str, content: str) -> float:
        """Calculate relevance score based on query match"""
        query_lower = query.lower()
        title_lower = title.lower()
        content_lower = content.lower()

        score = 0.0

        # Title exact match
        if query_lower == title_lower:
            score += 100
        elif query_lower in title_lower:
            score += 50

        # Title word matches
        query_words = query_lower.split()
        title_words = title_lower.split()
        title_matches = sum(1 for word in query_words if word in title_words)
        score += (title_matches / len(query_words)) * 30

        # Content matches
        content_matches = sum(
            1 for word in query_words if word in content_lower)
        score += (content_matches / len(query_words)) * 20

        return score
