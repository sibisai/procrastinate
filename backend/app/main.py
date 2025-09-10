import os, asyncio
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from .db import Base, engine, get_db
from . import models, schemas
from .llm import generate_microstep
import logging, sys

logging.basicConfig(level=logging.INFO,
    handlers=[logging.StreamHandler(sys.stdout), logging.FileHandler("server.log")])

app = FastAPI(title="Smallest-Step MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

@app.post("/tasks", response_model=schemas.TaskOut)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    t = models.Task(title=payload.title.strip())
    db.add(t)
    db.commit()
    db.refresh(t)
    return to_task_out(db, t)

@app.get("/tasks", response_model=list[schemas.TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.execute(select(models.Task)).scalars().all()
    return [to_task_out(db, t) for t in tasks]

@app.patch("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db)):
    t = db.get(models.Task, task_id)
    if not t: raise HTTPException(404, "Task not found")
    t.status = payload.status
    db.commit(); db.refresh(t)
    return to_task_out(db, t)

@app.post("/tasks/{task_id}/generate", response_model=schemas.MicroStepOut)
async def generate_for_task(task_id: int, db: Session = Depends(get_db)):
    t = db.get(models.Task, task_id)
    if not t:
        raise HTTPException(404, "Task not found")
    text = await generate_microstep(t.title)
    ms = models.MicroStep(task_id=t.id, text=text)
    db.add(ms)
    db.commit()
    db.refresh(ms)
    return ms

@app.patch("/microsteps/{microstep_id}", response_model=schemas.MicroStepOut)
def update_status(microstep_id: int, payload: schemas.StatusUpdate, db: Session = Depends(get_db)):
    ms = db.get(models.MicroStep, microstep_id)
    if not ms:
        raise HTTPException(404, "Micro-step not found")
    ms.status = payload.status
    db.commit()
    db.refresh(ms)
    return ms

@app.get("/stats")
def stats(db: Session = Depends(get_db)):
    total_tasks = db.scalar(select(func.count(models.Task.id))) or 0
    total_ms = db.scalar(select(func.count(models.MicroStep.id))) or 0
    done_ms = db.scalar(select(func.count(models.MicroStep.id)).where(models.MicroStep.status == models.Status.done)) or 0
    return {"tasks": total_tasks, "microsteps": total_ms, "done_microsteps": done_ms}

def to_task_out(db: Session, t: models.Task) -> schemas.TaskOut:
    latest = db.execute(
        select(models.MicroStep).where(models.MicroStep.task_id == t.id).order_by(desc(models.MicroStep.created_at)).limit(1)
    ).scalars().first()
    return schemas.TaskOut(
        id=t.id,
        title=t.title,
        status=t.status,
        created_at=t.created_at,
        latest_microstep=latest,
    )