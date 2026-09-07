from app.models import Task, ProjectMember, User
from app import db


class AnalyticsService:
    """Service for project analytics and reports"""

    @staticmethod
    def get_project_analytics(project_id):
        project = db.session.get(__import__('app.models.project', fromlist=['Project']).Project, project_id)
        if not project:
            raise ValueError('Project not found')

        tasks = Task.query.filter_by(project_id=project_id).all()
        status_counts = {}
        for status in ['todo', 'in_progress', 'review', 'testing', 'done', 'backlog', 'cancelled', 'on_hold']:
            status_counts[status] = 0

        for task in tasks:
            status_counts[task.status] = status_counts.get(task.status, 0) + 1

        member_count = db.session.query(ProjectMember).filter_by(project_id=project_id).count()
        total_tasks = len(tasks)
        done_tasks = sum(1 for t in tasks if t.status == 'done')
        overdue_tasks = sum(1 for t in tasks if t.due_date is not None and t.status != 'done')

        percentage = 0
        if total_tasks:
            percentage = round((done_tasks / total_tasks) * 100, 2)

        return {
            'project_id': project_id,
            'project_name': project.summary,
            'member_count': member_count,
            'total_tasks': total_tasks,
            'done_tasks': done_tasks,
            'overdue_tasks': overdue_tasks,
            'completion_percentage': percentage,
            'status_counts': status_counts,
        }

    @staticmethod
    def get_team_summary(project_id):
        project = db.session.get(__import__('app.models.project', fromlist=['Project']).Project, project_id)
        if not project:
            raise ValueError('Project not found')

        members = db.session.query(ProjectMember).filter_by(project_id=project_id).all()
        summary = []
        for member in members:
            user = User.query.get(member.user_id)
            if not user:
                continue
            tasks = Task.query.filter_by(project_id=project_id, assigned_to=user.id).all()
            summary.append({
                'user_id': user.id,
                'full_name': user.full_name or user.username,
                'email': user.email,
                'role': member.role,
                'assigned_tasks': len(tasks),
                'completed_tasks': sum(1 for t in tasks if t.status == 'done'),
                'in_progress_tasks': sum(1 for t in tasks if t.status == 'in_progress'),
            })
        return summary
