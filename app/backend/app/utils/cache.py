import time
from typing import Any, Optional, Dict, Tuple


class SimpleAsyncCache:
    """In-memory TTL cache for API responses."""
    def __init__(self, default_ttl: int = 900) -> None:
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self.default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            data, expire_at = self._cache[key]
            if time.time() < expire_at:
                return data
            # Expired
            del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        expire_time = time.time() + (ttl if ttl is not None else self.default_ttl)
        self._cache[key] = (value, expire_time)

    def clear(self) -> None:
        self._cache.clear()

    def size(self) -> int:
        # clean expired keys
        now = time.time()
        self._cache = {k: v for k, v in self._cache.items() if v[1] > now}
        return len(self._cache)


# Global cache instances
aqi_cache = SimpleAsyncCache(default_ttl=900)  # 15 minutes
geo_cache = SimpleAsyncCache(default_ttl=86400)  # 24 hours for city geocodes

