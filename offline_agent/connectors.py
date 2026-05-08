from datetime import datetime, timedelta
from random import choice, randint
from typing import List

from .models import RawDocument


TOPICS = [
    ("AI regulation expands", "科技"),
    ("Oil route disruption concerns", "能源"),
    ("Consumer spending shifts online", "消费"),
    ("Rate cut expectations rise", "金融"),
    ("Chip supply recovery signs", "科技"),
]

LANGUAGES = [("en", "欧美"), ("zh", "亚太"), ("es", "欧美"), ("ja", "亚太"), ("fr", "欧美")]
SOURCES = [("news-global", "news"), ("reddit-hot", "social"), ("weibo-hot", "social"), ("blogs-tech", "blog")]


def generate_mock_documents(size: int = 5000) -> List[RawDocument]:
    now = datetime.utcnow()
    docs: List[RawDocument] = []
    for i in range(size):
        topic, industry = choice(TOPICS)
        lang, region = choice(LANGUAGES)
        source_id, source_type = choice(SOURCES)
        vol = randint(50, 500)
        polarity = choice(["positive", "neutral", "negative"])
        title = f"{topic} #{i}"
        content = (
            f"{topic}. volume={vol}. polarity={polarity}. "
            f"This signal is collected from {source_id} and converted into unified text."
        )
        docs.append(
            RawDocument(
                source_id=source_id,
                source_type=source_type,
                title=title,
                content=content,
                language=lang,
                region=region,
                industry=industry,
                published_at=now - timedelta(minutes=randint(0, 24 * 60)),
            )
        )
    return docs

