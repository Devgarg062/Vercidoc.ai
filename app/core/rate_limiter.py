import redis.asyncio as redis
import time
import os
from fastapi import HTTPException, status

redis_client = redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379"),
    decode_responses=True,
    protocol=2  # Force RESP2 protocol, compatible with Redis 3.x
)
class SlidingWindowRateLimiter:

    async def is_allowed(
        self,
        api_key_id: str,
        max_requests: int = 60,
        window_seconds: int = 60
    ) -> dict:
        now = time.time()
        window_start = now - window_seconds
        key = f"rate_limit:{api_key_id}"

        # Use a pipeline for atomic execution
        # Without this, another request could slip in between our check and add
        async with redis_client.pipeline(transaction=True) as pipe:
            # Remove timestamps older than window
            pipe.zremrangebyscore(key, 0, window_start)
            # Count remaining requests in window
            pipe.zcard(key)
            # Add this request
            pipe.zadd(key, {f"{now}": now})
            # Set key to expire (cleanup)
            pipe.expire(key, window_seconds * 2)
            results = await pipe.execute()

        current_count = results[1]  # Count before adding this request

        if current_count >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "rate_limit_exceeded",
                    "message": f"Limit of {max_requests} requests per {window_seconds}s exceeded",
                    "retry_after_seconds": window_seconds
                },
                headers={"Retry-After": str(window_seconds)}
            )

        return {
            "requests_remaining": max_requests - current_count - 1,
            "reset_at": int(now + window_seconds)
        }

rate_limiter = SlidingWindowRateLimiter()