from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.ai_search import AISearchRequest, AISearchResponse
from app.services import ai_search as ai_search_service

router = APIRouter(prefix="/ai-search", tags=["ai-search"])


@router.post("", response_model=AISearchResponse)
async def search(
    payload: AISearchRequest,
    session: AsyncSession = Depends(get_session),
) -> AISearchResponse:
    return await ai_search_service.search(session, payload.message)
