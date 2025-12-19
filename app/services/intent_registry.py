INTENT_REGISTRY = {
    "clean": [
        "clean",
        "laundry",
        "do laundry",
        "wash clothes",
        "wash laundry",
        "clothes",
        "dirty clothes",
        "tidy",
        "pick up"
    ],
    "organize": [
        "organize",
        "sort",
        "put away",
        "declutter",
        "arrange"
    ],
    "study": [
        "study",
        "review",
        "exam",
        "test"
    ],
    "write": [
        "write",
        "essay",
        "paper",
        "draft"
    ],
    "research": [
        "research"
    ]
}

ACTION_REGISTRY = {
    "put_away": [
        "put away",
        "store",
        "hang up",
        "fold and put away"
    ],
    "wash": [
        "wash",
        "washing",
        "run washer"
    ],
    "dry": [
        "dry",
        "run dryer"
    ],
    "fold": [
        "fold",
        "fold clothes"
    ]
}


def detect_intent(task_text: str) -> str:
    text = task_text.lower()

    for intent, phrases in INTENT_REGISTRY.items():
        for phrase in phrases:
            if phrase in text:
                return intent

    return "generic"


def detect_action(task_text: str) -> str | None:
    text = task_text.lower()

    for action, phrases in ACTION_REGISTRY.items():
        for phrase in phrases:
            if phrase in text:
                return action

    return None
