"""Authentication router."""
import uuid
import jwt
import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import User, Platform, PlatformType, CityTier
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

class OTPRequest(BaseModel):
    phone_number: str

class OTPVerify(BaseModel):
    phone_number: str
    otp_code: str

@router.post("/otp/request")
def request_otp(body: OTPRequest):
    if not body.phone_number or len(body.phone_number) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number")
    # In a real app, integrate Twilio here
    return {"status": "ok", "message": f"Mock OTP sent to {body.phone_number}"}

@router.post("/otp/verify")
def verify_otp(body: OTPVerify, db: Session = Depends(get_db)):
    if body.otp_code != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user = db.query(User).filter(User.phone_number == body.phone_number).first()
    is_new_user = False
    
    if not user:
        is_new_user = True
        user = User(
            id=str(uuid.uuid4()),
            phone_number=body.phone_number,
            display_name=None, # No default demo name anymore
            city_tier=CityTier.tier2
        )
        db.add(user)
        # Create default platforms
        db.add_all([
            Platform(id=str(uuid.uuid4()), user_id=user.id, platform_name="Swiggy", platform_type=PlatformType.delivery),
            Platform(id=str(uuid.uuid4()), user_id=user.id, platform_name="Zomato", platform_type=PlatformType.delivery),
            Platform(id=str(uuid.uuid4()), user_id=user.id, platform_name="Uber", platform_type=PlatformType.ride),
            Platform(id=str(uuid.uuid4()), user_id=user.id, platform_name="Ola", platform_type=PlatformType.ride),
        ])
        db.commit()
        db.refresh(user)

    payload = {
        "sub": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    return {
        "access_token": token, 
        "token_type": "bearer",
        "is_new_user": is_new_user,
        "display_name": user.display_name
    }

from app.dependencies import get_current_user

class UserUpdate(BaseModel):
    display_name: str

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "phone_number": current_user.phone_number,
        "display_name": current_user.display_name,
        "city_tier": current_user.city_tier.value
    }

@router.put("/me")
def update_me(body: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.display_name = body.display_name
    db.commit()
    return {"status": "ok", "display_name": current_user.display_name}

@router.get("/platforms")
def get_platforms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    platforms = db.query(Platform).filter(Platform.user_id == current_user.id).all()
    return [{"id": p.id, "name": p.platform_name, "type": p.platform_type.value} for p in platforms]
