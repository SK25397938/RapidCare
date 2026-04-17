EMERGENCY_SPECIALIZATION_MAP = {
    "trauma": {"Trauma", "Emergency", "General", "Multispeciality"},
    "cardiac": {"Cardiac", "Heart", "General", "Multispeciality"},
    "neuro": {"Neuro", "General", "Multispeciality"},
    "respiratory": {"Respiratory", "Pulmonary", "General", "Multispeciality"},
    "general": {"General", "Multispeciality", "Emergency"},
}


def normalize_specialization(value: str | None) -> str:
    return (value or "general").strip().lower()


def specialization_matches(emergency_type: str, hospital_specialization: str | None) -> bool:
    normalized_emergency = normalize_specialization(emergency_type)
    normalized_hospital = (hospital_specialization or "").strip().lower()

    allowed = EMERGENCY_SPECIALIZATION_MAP.get(normalized_emergency, EMERGENCY_SPECIALIZATION_MAP["general"])
    return any(option.lower() in normalized_hospital for option in allowed)
