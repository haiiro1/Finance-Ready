from fastapi import APIRouter

from app.modules.auth import router as auth_router
from app.modules.banks import router as banks_router
from app.modules.cards import router as cards_router
from app.modules.gmail import router as gmail_router
from app.modules.health import router as health_router
from app.modules.loans import router as loans_router
from app.modules.notifications import router as notifications_router
from app.modules.reports import router as reports_router
from app.modules.subscriptions import router as subscriptions_router
from app.modules.transactions import router as transactions_router

api_router = APIRouter()

api_router.include_router(health_router.router)
api_router.include_router(auth_router.router, prefix="/auth")
api_router.include_router(gmail_router.router, prefix="/gmail")
api_router.include_router(banks_router.router, prefix="/banks")
api_router.include_router(cards_router.router, prefix="/cards")
api_router.include_router(transactions_router.router, prefix="/transactions")
api_router.include_router(loans_router.router, prefix="/loans")
api_router.include_router(subscriptions_router.router, prefix="/subscriptions")
api_router.include_router(reports_router.router, prefix="/reports")
api_router.include_router(notifications_router.router, prefix="/notifications")
