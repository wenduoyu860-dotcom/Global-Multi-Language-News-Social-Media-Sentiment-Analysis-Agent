import hashlib
import re
from typing import Iterable, List

from .models import RawDocument


def normalize_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    return text


def fingerprint(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()


def deduplicate(raw_docs: Iterable[RawDocument]) -> List[RawDocument]:
    seen = set()
    out: List[RawDocument] = []
    for doc in raw_docs:
        cleaned = normalize_text(doc.content)
        fp = fingerprint(f"{doc.title}:{cleaned}")
        if fp in seen:
            continue
        seen.add(fp)
        doc.content = cleaned
        out.append(doc)
    return out

