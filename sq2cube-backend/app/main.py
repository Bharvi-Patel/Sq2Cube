import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

from app.database import engine
from app.models import Base
from app.routes import auth_routes, user_routes, password_routes, oauth_routes, admin_routes, feedback_routes
from app.limiter import limiter, RATE_LIMITING_ENABLED
from app.validation import enforce_content_length

app = FastAPI()

# ── Rate Limiting ──────────────────────────────────────────────────────────
if RATE_LIMITING_ENABLED:
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware
    from slowapi import _rate_limit_exceeded_handler

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

# ── HTTPS Redirect (production only) ──────────────────────────────────────
if os.getenv("ENABLE_HTTPS_REDIRECT", "false").lower() == "true":
    app.add_middleware(HTTPSRedirectMiddleware)

# ── CORS — restrict to your frontend URL only ──────────────────────────────
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Request size guard ─────────────────────────────────────────────────────
MAX_REQUEST_BODY_BYTES = int(os.getenv("MAX_REQUEST_BODY_BYTES", 10 * 1024 * 1024))  # 10MB default

@app.middleware("http")
async def request_size_guard(request: Request, call_next):
    enforce_content_length(request.headers.get("content-length"), MAX_REQUEST_BODY_BYTES)
    return await call_next(request)

# ── Security Headers ───────────────────────────────────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"]  = "nosniff"
    response.headers["X-Frame-Options"]         = "DENY"
    response.headers["X-XSS-Protection"]        = "1; mode=block"
    response.headers["Referrer-Policy"]         = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"]      = "camera=(), microphone=(), geolocation=()"
    return response

# ── DB + Routers ───────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(password_routes.router)
app.include_router(oauth_routes.router)
app.include_router(admin_routes.router)
app.include_router(feedback_routes.router)