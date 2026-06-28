from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.models.db_models import VerificationJob, APIKey
from app.services.auth_service import get_current_user_id

router = APIRouter(prefix="/v1/stats", tags=["stats"])


@router.get("/overview")
async def get_overview_stats(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Total verifications for this user
    total_result = await db.execute(
        select(func.count(VerificationJob.id)).where(VerificationJob.user_id == user_id)
    )
    total_verifications = total_result.scalar() or 0

    # Verifications today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_result = await db.execute(
        select(func.count(VerificationJob.id)).where(
            VerificationJob.user_id == user_id,
            VerificationJob.created_at >= today_start
        )
    )
    today_count = today_result.scalar() or 0

    # Success rate
    verified_result = await db.execute(
        select(func.count(VerificationJob.id)).where(
            VerificationJob.user_id == user_id,
            VerificationJob.status == "verified"
        )
    )
    verified_count = verified_result.scalar() or 0
    success_rate = round((verified_count / total_verifications * 100), 1) if total_verifications > 0 else 0

    # Avg response time
    avg_result = await db.execute(
        select(func.avg(VerificationJob.processing_time_ms)).where(VerificationJob.user_id == user_id)
    )
    avg_time_ms = avg_result.scalar() or 0
    avg_time_seconds = round(avg_time_ms / 1000, 1) if avg_time_ms else 0

    # API key usage
    key_result = await db.execute(
        select(APIKey).where(APIKey.user_id == user_id)
    )
    api_keys = key_result.scalars().all()
    total_requests = sum(k.total_requests for k in api_keys)

    return {
        "total_verifications": total_verifications,
        "verifications_today": today_count,
        "success_rate": success_rate,
        "avg_response_time_seconds": avg_time_seconds,
        "total_api_requests": total_requests,
        "active_api_keys": len([k for k in api_keys if k.is_active == "active"])
    }


@router.get("/usage-by-day")
async def get_usage_by_day(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

    result = await db.execute(
        select(
            func.date(VerificationJob.created_at).label("date"),
            func.count(VerificationJob.id).label("count")
        )
        .where(
            VerificationJob.user_id == user_id,
            VerificationJob.created_at >= seven_days_ago
        )
        .group_by(func.date(VerificationJob.created_at))
        .order_by(func.date(VerificationJob.created_at))
    )
    rows = result.all()

    return {
        "usage": [{"date": str(row.date), "calls": row.count} for row in rows]
    }


@router.get("/recent-verifications")
async def get_recent_verifications(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    limit: int = 10
):
    result = await db.execute(
        select(VerificationJob)
        .where(VerificationJob.user_id == user_id)
        .order_by(VerificationJob.created_at.desc())
        .limit(limit)
    )
    jobs = result.scalars().all()

    return {
        "verifications": [
            {
                "request_id": job.id,
                "status": job.status,
                "document_type": job.document_type,
                "confidence_score": job.confidence_score,
                "created_at": job.created_at.isoformat() if job.created_at else None
            }
            for job in jobs
        ]
    }