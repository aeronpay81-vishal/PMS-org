import json
import os
import uuid
from datetime import datetime

from flask import current_app
from werkzeug.utils import secure_filename

from app import db
from app.models import Subtask, Task
from app.utils.permission_checker import PermissionChecker, RolePermissionError


class SubtaskService:
    ALLOWED_STATUS = {'todo', 'in_progress', 'done'}

    @staticmethod
    def _get_task(user_id, task_id):
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')
        if not PermissionChecker.can_view_task(user_id, task_id):
            raise RolePermissionError('You do not have permission to access this task')
        return task

    @staticmethod
    def _parse_date(value):
        if not value:
            return datetime.utcnow()
        try:
            return datetime.fromisoformat(str(value).replace('Z', '')[:19])
        except ValueError:
            try:
                return datetime.strptime(str(value)[:10], '%Y-%m-%d')
            except ValueError as exc:
                raise ValueError('date must use YYYY-MM-DD or ISO 8601 format') from exc

    @staticmethod
    def _save_files(files, task_id):
        if not files:
            return []
        upload_dir = os.path.join(current_app.instance_path, 'uploads', 'subtasks', str(task_id))
        os.makedirs(upload_dir, exist_ok=True)
        saved = []
        for file in files:
            if not file or not file.filename:
                continue
            safe_name = secure_filename(file.filename)
            if not safe_name:
                continue
            stored_name = f'{uuid.uuid4().hex}_{safe_name}'
            file.save(os.path.join(upload_dir, stored_name))
            saved.append({
                'name': safe_name,
                'url': f'/uploads/subtasks/{task_id}/{stored_name}',
                'type': file.mimetype or 'application/octet-stream',
            })
        return saved

    @staticmethod
    def list_subtasks(user_id, task_id):
        task = SubtaskService._get_task(user_id, task_id)
        return [subtask.to_dict() for subtask in task.subtasks]

    @staticmethod
    def create_subtask(user_id, task_id, data, files=None):
        task = SubtaskService._get_task(user_id, task_id)
        if not PermissionChecker.can_view_task(user_id, task_id):
            raise RolePermissionError('You do not have permission to add a subtask to this task')

        title = str(data.get('title') or '').strip()
        if not title:
            raise ValueError('Subtask title is required')
        status = str(data.get('status') or 'todo').strip().lower()
        if status not in SubtaskService.ALLOWED_STATUS:
            raise ValueError('Subtask status must be todo, in_progress, or done')

        subtask = Subtask(
            task_id=task.id,
            created_by=user_id,
            title=title,
            description=data.get('description'),
            work_date=SubtaskService._parse_date(data.get('date')),
            status=status,
            attachments=json.dumps(SubtaskService._save_files(files, task.id)),
        )
        db.session.add(subtask)
        db.session.commit()
        return subtask.to_dict()

    @staticmethod
    def update_subtask(user_id, task_id, subtask_id, data, files=None):
        SubtaskService._get_task(user_id, task_id)
        if not PermissionChecker.can_update_task(user_id, task_id):
            raise RolePermissionError('You do not have permission to update this subtask')
        subtask = Subtask.query.filter_by(id=subtask_id, task_id=task_id).first()
        if not subtask:
            raise ValueError('Subtask not found')

        if 'title' in data:
            title = str(data.get('title') or '').strip()
            if not title:
                raise ValueError('Subtask title is required')
            subtask.title = title
        if 'description' in data:
            subtask.description = data.get('description')
        if 'date' in data:
            subtask.work_date = SubtaskService._parse_date(data.get('date'))
        if 'status' in data:
            status = str(data.get('status') or '').strip().lower()
            if status not in SubtaskService.ALLOWED_STATUS:
                raise ValueError('Subtask status must be todo, in_progress, or done')
            subtask.status = status
        if files:
            existing = json.loads(subtask.attachments or '[]')
            subtask.attachments = json.dumps(existing + SubtaskService._save_files(files, task_id))
        subtask.updated_at = datetime.utcnow()
        db.session.commit()
        return subtask.to_dict()

    @staticmethod
    def delete_subtask(user_id, task_id, subtask_id):
        SubtaskService._get_task(user_id, task_id)
        if not PermissionChecker.can_update_task(user_id, task_id):
            raise RolePermissionError('You do not have permission to delete this subtask')
        subtask = Subtask.query.filter_by(id=subtask_id, task_id=task_id).first()
        if not subtask:
            raise ValueError('Subtask not found')
        db.session.delete(subtask)
        db.session.commit()
        return {'success': True, 'message': 'Subtask deleted successfully'}
