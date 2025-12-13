import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///expenses.db"
    SECRET_KEY: str = "supersecretkey" # TODO: Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    LOG_DIR: str = "logs"
    ENABLE_REGISTRATION: bool = False
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://expense-tracker-pwa-phi.vercel.app",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore"
    )
    
    @property
    def check_same_thread(self) -> bool:
        return "sqlite" in self.DATABASE_URL

settings = Settings()
