from datetime import datetime
from app import db
from app.models import Task, TimeEntry
from app.utils.permission_checker import PermissionChecker


class TimeEntryService:
    """Service for task time tracking"""

    @staticmethod
    def _validate_task_access(user_id, task_id):
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')
        if not PermissionChecker.can_view_task(user_id, task_id):
            raise ValueError('You do not have access to this task')
        return task

    @staticmethod
    def start_timer(user_id, task_id, note=None):
        task = TimeEntryService._validate_task_access(user_id, task_id)

        active_entry = TimeEntry.query.filter_by(task_id=task_id, user_id=user_id, ended_at=None).first()
        if active_entry:
            raise ValueError('Timer is already running for this task')

        entry = TimeEntry(
            task_id=task_id,
            project_id=task.project_id,
            user_id=user_id,
            started_at=datetime.utcnow(),
            note=str(note).strip() if note else None,
        )
        db.session.add(entry)
        db.session.commit()
        return entry.to_dict()

    @staticmethod
    def stop_timer(user_id, task_id):
        task = TimeEntryService._validate_task_access(user_id, task_id)
        entry = TimeEntry.query.filter_by(task_id=task_id, user_id=user_id, ended_at=None).order_by(TimeEntry.started_at.desc()).first()
        if not entry:
            raise ValueError('No active timer found for this task')

        entry.ended_at = datetime.utcnow()
        delta = entry.ended_at - entry.started_at
        entry.duration_minutes = int(delta.total_seconds() // 60)
        db.session.commit()
        return entry.to_dict()

    @staticmethod
    def get_task_time_entries(task_id, user_id=None):
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')
        if user_id is not None:
            entries = TimeEntry.query.filter_by(task_id=task_id, user_id=user_id).order_by(TimeEntry.started_at.desc()).all()
        else:
            entries = TimeEntry.query.filter_by(task_id=task_id).order_by(TimeEntry.started_at.desc()).all()
        return [e.to_dict() for e in entries]

    @staticmethod
    def get_task_total_minutes(task_id):
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')
        entries = TimeEntry.query.filter_by(task_id=task_id).all()
        total = sum((e.duration_minutes or 0) for e in entries)
        return {'task_id': task_id, 'total_minutes': total}
