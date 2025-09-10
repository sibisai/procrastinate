# app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, func
from sqlalchemy.orm import relationship
from .db import Base
import enum

class TaskStatus(str, enum.Enum):
    open = "open"
    done = "done"
    archived = "archived"

class Status(str, enum.Enum):
    not_started = "not_started"
    done = "done"

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.open, nullable=False)   # NEW
    created_at = Column(DateTime, server_default=func.now())
    microsteps = relationship("MicroStep", back_populates="task", cascade="all, delete-orphan")

class MicroStep(Base):
    __tablename__ = "microsteps"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    text = Column(String, nullable=False)
    status = Column(Enum(Status), default=Status.not_started, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    task = relationship("Task", back_populates="microsteps")