from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    gemini_api_key: str = Field(default="", env="GEMINI_API_KEY")
    google_translate_api_key: str = Field(default="", env="GOOGLE_TRANSLATE_API_KEY")
    twilio_account_sid: str = Field(default="", env="TWILIO_ACCOUNT_SID")
    twilio_auth_token: str = Field(default="", env="TWILIO_AUTH_TOKEN")
    twilio_from_number: str = Field(default="", env="TWILIO_FROM_NUMBER")
    jwt_secret: str = Field(default="change-me", env="JWT_SECRET")
    clerk_secret_key: str = Field(default="", env="CLERK_SECRET_KEY")
    database_url: str = Field(default="sqlite:///.gigshield.db", env="DATABASE_URL")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
