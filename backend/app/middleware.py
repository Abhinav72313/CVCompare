import os
from fastapi import Request
from fastapi.responses import JSONResponse
import jwt
from jwt import PyJWKClient


url = os.getenv("JWKS_ENDPOINT")

if not url:
    raise ValueError("JWKS_ENDPOINT environment variable is not set")

jwks_client = PyJWKClient(url)


async def auth_middleware(request: Request, call_next):
    """Authentication middleware for JWT token validation"""

    if request.method == "OPTIONS":
        return await call_next(request)

    # Skip authentication for certain paths
    skip_paths = ["/webhooks", "/health", "/docs", "/redoc", "/openapi.json"]

    if any(request.url.path.startswith(path) for path in skip_paths):
        return await call_next(request)

    auth_header = request.headers.get("Authorization")
    token = None

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

    if not token:
        return JSONResponse(
            status_code=401,
            content={"detail": "Unauthorized: Missing or invalid token"},
        )

    signing_key = jwks_client.get_signing_key_from_jwt(token)

    try:
        # Verify JWT token with RSA public key
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
        )
        request.state._state['user_id'] = payload.get("sub")

    except jwt.ExpiredSignatureError:
        return JSONResponse(
            status_code=401,
            content={"detail": "Token expired"},
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
            },
        )

    except jwt.InvalidTokenError as e:
        return JSONResponse(
            status_code=401,
            content={"detail": f"Invalid token: {str(e)}"},
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
            },
        )

    return await call_next(request)
