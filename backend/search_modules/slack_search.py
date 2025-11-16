# search_modules/slack_search.py
from typing import List, Dict, Any
from .base_search import BaseSearchModule, SearchResult


class SlackSearchModule(BaseSearchModule):
    def __init__(self):
        super().__init__("slack", "Slack")
        self.mock_messages = [
            {
                "id": "msg_1",
                "text": "Can someone share the analytics report from last week's planning meeting?",
                "user": "john.doe",
                "channel": "#project-planning",
                "timestamp": "2024-01-15T14:30:00Z",
                "thread_ts": None
            },
            {
                "id": "msg_2",
                "text": "Updated the Q4 planning document with new timeline and resource allocation",
                "user": "jane.smith",
                "channel": "#general",
                "timestamp": "2024-01-14T16:45:00Z",
                "thread_ts": "1642178700"
            }
        ]

    async def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        results = []

        for message in self.mock_messages:
            if query.lower() in message["text"].lower():

                relevance_score = self.calculate_relevance_score(
                    query, message["text"][:50], message["text"]
                )

                result = SearchResult(
                    id=f"slack_{message['id']}",
                    title=f"💬 Slack: {message['channel']} - {message['user']}",
                    snippet=message["text"],
                    source="slack",
                    source_url=f"slack://channel?team=T123&id=C123&message={message['timestamp']}",
                    timestamp=message["timestamp"],
                    relevance_score=relevance_score,
                    metadata={
                        "channel": message["channel"],
                        "user": message["user"],
                        "is_thread": bool(message["thread_ts"])
                    }
                )
                results.append(result)

        return results[:limit]

    async def get_connection_status(self) -> Dict[str, Any]:
        return {
            "connected": True,
            "last_indexed": "2024-01-15T15:00:00Z",
            "total_items": len(self.mock_messages)
        }

    async def reindex(self) -> bool:
        print(f"Reindexing {self.display_name}...")
        return True
