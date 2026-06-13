from sqlalchemy import Column, String, Float, DateTime, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from src.infrastructure.database.connection import Base
from datetime import datetime, timezone
import uuid

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    content = Column(Text, nullable=False)
    mood_score = Column(Float)
    ai_insights = Column(Text)
    ai_questions = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
