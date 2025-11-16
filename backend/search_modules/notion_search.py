# search_modules/notion_search.py
from typing import List, Dict, Any
from .base_search import BaseSearchModule, SearchResult


class NotionSearchModule(BaseSearchModule):
    def __init__(self):
        super().__init__("notion", "Notion")
        self.mock_pages = [
            {
                "id": "page_1",
                "title": "Project Planning Notes",
                "content": "Meeting notes from project planning session. Discussed timeline, resources, and key milestones for Q4...",
                "updated": "2024-01-15",
                "database": "Projects"
            },
            {
                "id": "page_2",
                "title": "Analytics Review",
                "content": "Weekly analytics review showing user engagement metrics, conversion rates, and growth trends...",
                "updated": "2024-01-14",
                "database": "Analytics"
            }
        ]

    async def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        results = []

        for page in self.mock_pages:
            if (query.lower() in page["title"].lower() or
                    query.lower() in page["content"].lower()):

                relevance_score = self.calculate_relevance_score(
                    query, page["title"], page["content"]
                )

                result = SearchResult(
                    id=f"notion_{page['id']}",
                    title=f"📝 {page['title']}",
                    snippet=page["content"][:150] + "...",
                    source="notion",
                    source_url=f"https://notion.so/{page['id']}",
                    timestamp=page["updated"],
                    relevance_score=relevance_score,
                    metadata={
                        "database": page["database"],
                        "type": "page"
                    }
                )
                results.append(result)

        return results[:limit]

    async def get_connection_status(self) -> Dict[str, Any]:
        return {
            "connected": True,
            "last_indexed": "2024-01-15T09:45:00Z",
            "total_items": len(self.mock_pages)
        }

    async def reindex(self) -> bool:
        print(f"Reindexing {self.display_name}...")
        return True
