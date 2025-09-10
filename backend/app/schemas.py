# app/schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .models import Status, TaskStatus

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)

class StatusUpdate(BaseModel):
    status: Status

class TaskUpdate(BaseModel):
    status: TaskStatus

class MicroStepOut(BaseModel):
    id: int
    text: str
    status: Status
    created_at: datetime
    class Config: from_attributes = True

class TaskOut(BaseModel):
    id: int
    title: str
    status: TaskStatus
    created_at: datetime
    latest_microstep: Optional[MicroStepOut] = None
    class Config: from_attributes = True