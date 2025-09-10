from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .models import Status

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)

class MicroStepOut(BaseModel):
    id: int
    text: str
    status: Status
    created_at: datetime
    class Config:
        from_attributes = True

class TaskOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    latest_microstep: Optional[MicroStepOut] = None
    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: Status