import os
import json
from openai import OpenAI
from .intent_registry import detect_intent, detect_action
from .domain_registry import detect_domain
from .domain_templates import DOMAIN_TEMPLATE_MAP

# INTENT → DOMAIN FALLBACK
INTENT_TO_DOMAIN = {
    "clean": "cleaning",
    "organize": "organizing",
    "study": "study",
    "write": "writing",
    "fitness": "fitness",
    "code": "coding",
}

def infer_domain_from_intent(intent: str | None) -> str | None:
    if not intent:
        return None
    return INTENT_TO_DOMAIN.get(intent)

# SUBTASK SUGGESTION CATEGORIES
QUEST_CATEGORIES = {
    "clean": {
        "kitchen": [
            "Clear off the counters",
            "Wash or load dirty dishes",
            "Wipe down stove and appliances",
            "Take out the trash",
            "Sweep or vacuum the floor"
        ],
        "room": [
            "Pick up trash",
            "Take dirty dishes to the kitchen",
            "Hang up or fold clean clothes",
            "Put dirty clothes in the hamper",
            "Make the bed",
            "Dust surfaces",
            "Vacuum or sweep the floor"
        ]
    },
    "organize": {
        "desk": [
            "Throw away trash and old papers",
            "Sort important papers into piles",
            "Put stationery and tools back where they belong",
            "Wipe down the desk surface"
        ],
        "closet": [
            "Pull out clothes you don’t wear",
            "Make a donate / keep pile",
            "Fold or hang the keep pile",
            "Put shoes back in place"
        ]
    },
    "write": {
        "essay": [
            "Brainstorm or pick a topic",
            "Research and collect sources",
            "Create a rough outline",
            "Write the first draft",
            "Re-read and edit the draft"
        ]
    },
    "study": {
        "test": [
            "Gather notes and materials",
            "Review notes once",
            "Make flashcards or summary notes",
            "Quiz yourself or do practice problems"
        ]
    }
}

DEFAULT_INTENT_TIMES = {
    "clean": 20,
    "organize": 25,
    "write": 30,
    "study": 35,
    "research": 45
}

DIFFICULTY_VALUES = {
    "easy": 1,
    "medium": 2,
    "hard": 4
}

# VERB + CONTEXT DETECTION

def detect_context(task_text: str) -> str:
    text = task_text.lower()
    if "kitchen" in text:
        return "kitchen"
    if "room" in text or "bedroom" in text:
        return "room"
    if "desk" in text:
        return "desk"
    if "closet" in text:
        return "closet"
    if "fridge" in text or "refrigerator" in text:
        return "fridge"
    if "essay" in text:
        return "essay"
    if "test" in text or "exam" in text:
        return "test"
    return "generic"


# RAW SUBTASK GENERATION

def suggest_time_for_intent(intent: str | None) -> int:
    return DEFAULT_INTENT_TIMES.get(intent, 20)

def ensure_task_coverage(task_text: str, subtasks: list[str]) -> list[str]:
    text = task_text.lower()
    steps = list(subtasks)
    lowered = [step.lower() for step in steps]

    def has_any(words: list[str]) -> bool:
        return any(any(word in step for word in words) for step in lowered)

    def add_start(step: str) -> None:
        if step.lower() not in lowered:
            steps.insert(0, step)
            lowered.insert(0, step.lower())

    def add_end(step: str) -> None:
        if step.lower() not in lowered:
            steps.append(step)
            lowered.append(step.lower())

    if "laundry" in text or "clothes" in text:
        if not has_any(["sort", "load", "detergent", "washer"]):
            add_start("Sort clothes by color")
        if not has_any(["dryer", "dry"]):
            add_end("Move clothes to dryer")
        if not has_any(["fold", "hang", "put away", "closet"]):
            add_end("Fold clean clothes")

    if "room" in text or "bedroom" in text:
        if not has_any(["trash", "pick up", "dishes"]):
            add_start("Pick up trash")
        if not has_any(["bed", "dust"]):
            add_end("Make the bed")
        if not has_any(["vacuum", "sweep", "floor"]):
            add_end("Vacuum or sweep the floor")

    if "dishes" in text or "dishwasher" in text or "sink" in text:
        if not has_any(["gather", "collect", "bring"]):
            add_start("Gather dirty dishes")
        if not has_any(["wash", "load", "dishwasher", "scrub", "rinse"]):
            add_end("Wash or load dirty dishes")
        if not has_any(["dry", "put away", "rack"]):
            add_end("Put clean dishes away")

    if "desk" in text:
        if not has_any(["trash", "papers"]):
            add_start("Throw away trash and old papers")
        if not has_any(["sort", "pile", "group"]):
            add_end("Sort important papers into piles")
        if not has_any(["wipe", "clean surface"]):
            add_end("Wipe down the desk surface")

    return steps

def generate_raw_subtasks_ai(task_text: str) -> list[str] | None:
    """Call OpenAI to generate subtasks. Returns None if unavailable or on error."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None

    try:
        client = OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a productivity assistant. When given a task, break it into "
                        "3 to 6 clear, specific, actionable steps. "
                        "Return ONLY a JSON array of strings — no explanation, no markdown, no extra text. "
                        "Example: [\"Step one\", \"Step two\", \"Step three\"]"
                    ),
                },
                {
                    "role": "user",
                    "content": f"Task: {task_text}",
                },
            ],
            temperature=0.4,
            max_tokens=300,
        )

        raw = response.choices[0].message.content.strip()
        subtasks = json.loads(raw)

        if isinstance(subtasks, list) and all(isinstance(s, str) for s in subtasks):
            return subtasks

    except Exception:
        pass

    return None


def generate_raw_subtasks(task_text: str) -> list[str]:
    # Try OpenAI first
    ai_result = generate_raw_subtasks_ai(task_text)
    if ai_result:
        return ai_result

    # Fallback: keyword-based templates
    domain = detect_domain(task_text)
    intent = detect_intent(task_text)
    action = detect_action(task_text)
    context = detect_context(task_text)

    if not domain:
        inferred_domain = infer_domain_from_intent(intent)
        if inferred_domain:
            domain = inferred_domain

    if domain in DOMAIN_TEMPLATE_MAP:
        template = DOMAIN_TEMPLATE_MAP[domain]
        if action and action in template:
            return template[action]
        if "full" in template:
            return template["full"]

    if intent in QUEST_CATEGORIES:
        ctx_map = QUEST_CATEGORIES[intent]
        if context in ctx_map:
            return ctx_map[context]

    return [
        f"Break '{task_text}' into smaller pieces",
        f"Do the simplest first step of '{task_text}'",
        f"Finish one more small part of '{task_text}'"
    ]

# DIFFICULTY SUGGESTION

def suggest_difficulty_from_steps(intent: str, step_count: int) -> str:
    if intent in ("write", "study", "research"):
        base = "medium"
    elif intent in ("clean", "organize"):
        base = "easy"
    else:
        base = "medium"

    if step_count >= 6:
        return "hard"
    if step_count >= 4 and base == "easy":
        return "medium"

    return base

# MOTIVATION SCALING

def adjust_for_motivation(base_min, base_max, motivation: str):
    if motivation == "low":
        return max(1, int(base_min * 0.75)), max(1, int(base_max * 0.75))

    if motivation == "high":
        return int(base_min * 1.25), int(base_max * 1.25)

    return base_min, base_max

def min_steps_for_difficulty(difficulty: str, motivation: str = "normal") -> int:
    if difficulty == "easy":
        base = 1
    elif difficulty == "medium":
        base = 3
    elif difficulty == "hard":
        base = 5
    else:
        base = 1

    adjusted_min, _ = adjust_for_motivation(base, base, motivation)
    return adjusted_min

def max_steps_for_difficulty(difficulty: str, motivation: str = "normal") -> int:
    if difficulty == "easy":
        base = 3
    elif difficulty == "medium":
        base = 5
    elif difficulty == "hard":
        base = 999
    else:
        base = 999

    _, adjusted_max = adjust_for_motivation(base, base, motivation)
    return adjusted_max

# XP + TIME

def calculate_base_xp(difficulty: str, step_count: int) -> int:
    multiplier = DIFFICULTY_VALUES.get(difficulty, 1)
    return step_count * multiplier * 10

def snap_to_five(minutes: int) -> int:
    return max(5, min(120, int(5 * round(minutes / 5))))

def calculate_bonus_window(estimated_time: int) -> int:
    return int(estimated_time * 0.8)

def calculate_bonus_xp(base_xp: int, elapsed_minutes: float, bonus_window: int) -> int:
    if elapsed_minutes > bonus_window:
        return 0

    remaining = max(0, bonus_window - elapsed_minutes)
    max_bonus = base_xp * 0.5
    ratio = remaining / bonus_window if bonus_window > 0 else 0
    return int(max_bonus * ratio)

# INITIAL + FINAL QUEST PLAN

def build_initial_quest_plan(task_text: str):
    intent = detect_intent(task_text)
    domain = detect_domain(task_text)

    subtasks = generate_raw_subtasks(task_text)
    subtasks = ensure_task_coverage(task_text, subtasks)
    step_count = len(subtasks)

    suggested_difficulty = suggest_difficulty_from_steps(intent, step_count)
    suggested_time = snap_to_five(suggest_time_for_intent(intent))
    base_xp = calculate_base_xp(suggested_difficulty, step_count)

    return {
        "intent": intent,
        "domain": domain,
        "subtasks": subtasks,
        "step_count": step_count,
        "suggested_difficulty": suggested_difficulty,
        "suggested_time": suggested_time,
        "base_xp": base_xp
    }

def finalize_quest_plan(
    selected_subtasks: list[str],
    chosen_difficulty: str,
    chosen_minutes: int,
    motivation: str = "normal"
):
    step_count = len(selected_subtasks)
    minutes = snap_to_five(chosen_minutes)

    min_steps = min_steps_for_difficulty(chosen_difficulty, motivation)
    max_steps = max_steps_for_difficulty(chosen_difficulty, motivation)

    effective_difficulty = chosen_difficulty
    difficulty_changed = False
    difficulty_reason = None

    if step_count < min_steps:
        if chosen_difficulty == "hard":
            effective_difficulty = "medium"
        elif chosen_difficulty == "medium":
            effective_difficulty = "easy"
        difficulty_changed = True
        difficulty_reason = "downgraded"

    elif step_count > max_steps:
        if chosen_difficulty == "easy":
            effective_difficulty = "medium"
        elif chosen_difficulty == "medium":
            effective_difficulty = "hard"
        difficulty_changed = True
        difficulty_reason = "upgraded"

    base_xp = calculate_base_xp(effective_difficulty, step_count)
    bonus_window = calculate_bonus_window(minutes)

    return {
        "subtasks": selected_subtasks,
        "step_count": step_count,
        "chosen_difficulty": chosen_difficulty,
        "effective_difficulty": effective_difficulty,
        "difficulty_changed": difficulty_changed,
        "difficulty_reason": difficulty_reason,
        "estimated_time": minutes,
        "bonus_window": bonus_window,
        "base_xp": base_xp
    }