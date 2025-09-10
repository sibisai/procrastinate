import os, logging, anyio
from openai import OpenAI
from httpx import TimeoutException

log = logging.getLogger("llm")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

INSTRUCTION = (
    "Given a user task, return the smallest physical action to BEGIN. "
    "One short imperative sentence. No 'and', no commas, no multiple actions."
)

def fallback(task_title: str) -> str:
    t = (task_title or "").lower()
    if any(w in t for w in ["write","essay","paper","report"]): return "Open a blank document"
    if any(w in t for w in ["email","inbox","reply"]): return "Open your email client"
    if any(w in t for w in ["code","bug","issue","repo"]): return "Open the project in your editor"
    if any(w in t for w in ["slides","deck","presentation"]): return "Create new slide deck"
    return "Open a notes file"

def _bad(text: str) -> bool:
    s = (text or "").strip()
    return (not s) or (len(s) > 120) or (" and " in s.lower()) or ("," in s) or (";" in s)

def _call_openai_sync(task_title: str) -> str:
    client = OpenAI()  # reads OPENAI_API_KEY
    resp = client.responses.create(
        model="gpt-5-nano",
        input=f"{INSTRUCTION}\nTask: {task_title}\nAnswer:",
        reasoning={"effort": "low"},
        text={"verbosity": "low"},
    )
    text = getattr(resp, "output_text", "") or ""
    return text.strip()

async def generate_microstep(task_title: str) -> str:
    if not OPENAI_API_KEY:
        return fallback(task_title)
    try:
        text = await anyio.to_thread.run_sync(_call_openai_sync, task_title)
        if _bad(text):
            return fallback(task_title)
        return text
    except TimeoutException as e:
        log.warning("LLM timeout: %s", e)
        return fallback(task_title)
    except Exception as e:
        log.exception("LLM failure for task '%s': %s", task_title, e)
        return fallback(task_title)