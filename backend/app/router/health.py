"""
Health check endpoints for monitoring and status verification.
"""
import os
import time
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    timestamp: str
    version: str
    uptime: float
    environment: str
    services: Dict[str, Any]


class ServiceStatus(BaseModel):
    """Individual service status model."""
    status: str
    response_time_ms: float = 0
    details: str = ""


router = APIRouter(
    prefix="/health",
    tags=["health"],
)

# Track startup time for uptime calculation
startup_time = time.time()


@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    Basic health check endpoint.
    Returns overall application health status.
    """
    try:
        current_time = datetime.now(timezone.utc)
        uptime = time.time() - startup_time
        
        # Check basic service availability
        services = await check_services()
        
        # Determine overall status
        overall_status = "healthy"
        if any(service["status"] == "unhealthy" for service in services.values()):
            overall_status = "degraded"
        
        return HealthResponse(
            status=overall_status,
            timestamp=current_time.isoformat(),
            version="1.0.0",
            uptime=uptime,
            environment=os.getenv("ENVIRONMENT", "development"),
            services=services
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Health check failed: {str(e)}"
        )


@router.get("/ready")
async def readiness_check():
    """
    Readiness check - indicates if the service is ready to handle requests.
    Useful for Kubernetes readiness probes.
    """
    try:
        services = await check_services()
        
        # Check if critical services are available
        critical_services = ["database", "ai_service"]
        for service_name in critical_services:
            if service_name in services and services[service_name]["status"] == "unhealthy":
                raise HTTPException(
                    status_code=503,
                    detail=f"Critical service {service_name} is not ready"
                )
        
        return {
            "status": "ready",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": "Service is ready to handle requests"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Readiness check failed: {str(e)}"
        )


@router.get("/live")
async def liveness_check():
    """
    Liveness check - indicates if the service is alive.
    Useful for Kubernetes liveness probes.
    """
    return {
        "status": "alive",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime": time.time() - startup_time,
        "message": "Service is alive"
    }


async def check_services() -> Dict[str, Dict[str, Any]]:
    """
    Check the health of various services.
    """
    services = {}
    
    # Check Database Connection
    services["database"] = await check_database()
    
    # Check AI Service
    services["ai_service"] = await check_ai_service()
    
    return services


async def check_database() -> Dict[str, Any]:
    """Check MongoDB connection health."""
    try:
        from ..database import mongodb
        start_time = time.time()
        
        # Simple ping to check connection
        if mongodb.client:
            await mongodb.client.admin.command('ping')
            response_time = (time.time() - start_time) * 1000
            
            return {
                "status": "healthy",
                "response_time_ms": round(response_time, 2),
                "details": "Database connection successful"
            }
        else:
            return {
                "status": "unhealthy",
                "response_time_ms": 0,
                "details": "Database client not initialized"
            }
    
    except Exception as e:
        return {
            "status": "unhealthy",
            "response_time_ms": 0,
            "details": f"Database connection failed: {str(e)}"
        }


async def check_ai_service() -> Dict[str, Any]:
    """Check Google AI service availability."""
    try:
        start_time = time.time()
        
        # Check if API key is configured
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            return {
                "status": "unhealthy",
                "response_time_ms": 0,
                "details": "Google API key not configured"
            }
        
        # You could add a simple test call to Gemini here if needed
        response_time = (time.time() - start_time) * 1000
        
        return {
            "status": "healthy",
            "response_time_ms": round(response_time, 2),
            "details": "AI service configuration verified"
        }
    
    except Exception as e:
        return {
            "status": "unhealthy",
            "response_time_ms": 0,
            "details": f"AI service check failed: {str(e)}"
        }

