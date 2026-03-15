from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.routes import auth_routes, user_routes, password_routes, oauth_routes, admin_routes, feedback_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(password_routes.router)
app.include_router(oauth_routes.router)
app.include_router(admin_routes.router)
app.include_router(feedback_routes.router)