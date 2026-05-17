from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.banks.router import router as banks_router
from app.modules.cards.router import router as cards_router
from app.modules.health.router import router as health_router
from app.modules.loans.router import router as loans_router
from app.modules.notifications.router import router as notifications_router
from app.modules.reports.router import router as reports_router
from app.modules.subscriptions.router import router as subscriptions_router
from app.modules.transactions.router import router as transactions_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(banks_router, prefix="/banks", tags=["banks"])
api_router.include_router(cards_router, prefix="/cards", tags=["cards"])
api_router.include_router(transactions_router, prefix="/transactions", tags=["transactions"])
api_router.include_router(loans_router, prefix="/loans", tags=["loans"])
api_router.include_router(subscriptions_router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["notifications"])

