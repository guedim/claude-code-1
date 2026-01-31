# Import all models to make them available when importing from models package
# This ensures Alembic can detect all models for auto-generation

from .base import BaseModel, Base
from .teacher import Teacher
from .lesson import Lesson
from .class_ import Class
from .course import Course
from .course_teacher import course_teachers
from .course_rating import CourseRating

# Export all models for easy importing
__all__ = [
    'BaseModel',
    'Base',
    'Teacher',
    'Lesson',
    'Class',
    'Course',
    'course_teachers',
    'CourseRating'
] 