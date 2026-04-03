import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware


from app.database import engine
from app.models import Base
from app.routes import auth_routes, user_routes, password_routes, oauth_routes, admin_routes, feedback_routes
from app.routes import single_image, multi_image, text_prompt  
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
# NEVER enable HTTPS redirect for localhost to prevent 'failed to fetch' SSL errors
_is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"
_force_https = os.getenv("ENABLE_HTTPS_REDIRECT", "false").lower() == "true"
if _is_prod and _force_https:
    app.add_middleware(HTTPSRedirectMiddleware)

# ── CORS — restrict to your frontend URL only ──────────────────────────────
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]

# Add common local development origins to prevent CORS errors in frontends
dev_origins = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:5174", "http://127.0.0.1:5174",
    "http://localhost:3000", "http://127.0.0.1:3000"
]
for origin in dev_origins:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Request size guard ─────────────────────────────────────────────────────
MAX_REQUEST_BODY_BYTES = int(os.getenv("MAX_REQUEST_BODY_BYTES", 10 * 1024 * 1024))  # 10MB default
# Note: request_size_guard middleware removed because it breaks CORS when raising HTTPExceptions early.

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.error(f"Unhandled exception: {exc}")
    logging.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )



# ── DB + Routers ───────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(password_routes.router)
app.include_router(oauth_routes.router)
app.include_router(admin_routes.router)
app.include_router(feedback_routes.router)


# ── 3D Conversion ──────────────────────────────────────────────────────────
app.include_router(single_image.router, prefix="", tags=["3D Conversion"])
app.include_router(multi_image.router,  prefix="", tags=["3D Conversion"])
app.include_router(text_prompt.router,  prefix="", tags=["3D Conversion"])
