"""
Pytest configuration and fixtures for database tests.
"""
import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.base import Base
# Import all models to ensure they're registered with Base.metadata
from app.models.course import Course
from app.models.teacher import Teacher
from app.models.lesson import Lesson
from app.models.class_ import Class
from app.models.course_rating import CourseRating
from app.models.course_teacher import course_teachers  # Association table


# Create engine for tests (uses same DB as configured)
engine = create_engine(settings.database_url)

# Create session factory
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables before tests and drop after."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield
    # Optionally drop tables after tests (comment out to keep data)
    # Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(setup_database):
    """Create database session for testing."""
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def sample_course(db_session):
    """Create and persist sample course."""
    course = Course(
        name="Test Course",
        description="Test Description",
        thumbnail="https://example.com/thumb.jpg",
        slug=f"test-course-{datetime.utcnow().timestamp()}"
    )
    db_session.add(course)
    db_session.commit()
    db_session.refresh(course)
    yield course
    # Cleanup after test
    try:
        db_session.delete(course)
        db_session.commit()
    except Exception:
        db_session.rollback()
