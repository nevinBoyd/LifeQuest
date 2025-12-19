DOMAIN_REGISTRY = {
    "laundry": {
        "keywords": [
            "laundry",
            "clothes",
            "clothing",
            "wash clothes",
            "washing clothes",
            "dirty clothes"
        ],
        "default_intent": "clean"
    },

    "dishes": {
        "keywords": [
            "dishes",
            "dishwasher",
            "plates",
            "cups",
            "sink"
        ],
        "default_intent": "clean"
    },

    "room": {
        "keywords": [
            "room",
            "bedroom"
        ],
        "default_intent": "clean"
    }
}

def detect_domain(task_text: str) -> str | None:
    text = task_text.lower()

    for domain, config in DOMAIN_REGISTRY.items():
        for keyword in config["keywords"]:
            if keyword in text:
                return domain

    return None

def infer_intent_from_domain(domain: str | None) -> str | None:
    if not domain:
        return None

    return DOMAIN_REGISTRY.get(domain, {}).get("default_intent")
