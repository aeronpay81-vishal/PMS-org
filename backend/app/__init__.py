from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    from app.config import Config
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register error handlers
    from app.middleware.error_handler import register_error_handlers
    register_error_handlers(app)
    
    # Register JWT error handlers
    register_jwt_error_handlers(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.project import project_bp
    from app.routes.task import task_bp
    from app.routes.invitation import invitation_bp
    from app.routes.notification import notification_bp
    from app.routes.task_extra import extra_bp
    from app.routes.analytics import analytics_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(project_bp, url_prefix='/api/projects')
    app.register_blueprint(task_bp, url_prefix='/api/tasks')
    app.register_blueprint(invitation_bp, url_prefix='/api')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(extra_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')

    # Add file serving route for uploads
    @app.route('/uploads/<path:filepath>')
    def serve_uploads(filepath):
        """Serve uploaded files from instance/uploads directory"""
        upload_dir = os.path.join(os.path.dirname(__file__), '..', 'instance', 'uploads')
        try:
            return send_from_directory(upload_dir, filepath)
        except Exception as e:
            return {'error': 'File not found'}, 404

    # Import models so SQLAlchemy creates all tables
    from app.models import User, Project, ProjectReport, ProjectMember, ProjectInvitation, Task, Notification, TaskComment, TaskActivity, TimeEntry  # noqa: F401

    # Create database tables and auto-migrate columns if needed
    with app.app_context():
        db.create_all()
        try:
            from sqlalchemy import text
            with db.engine.connect() as conn:
                # --- MySQL migrations ---
                try:
                    # tasks.project_id
                    res = conn.execute(text("SHOW COLUMNS FROM tasks LIKE 'project_id'"))
                    if not res.fetchone():
                        conn.execute(text("ALTER TABLE tasks ADD COLUMN project_id INT NULL, ADD INDEX idx_tasks_project_id (project_id)"))
                        conn.commit()
                    # project_invitations.task_id
                    res_inv = conn.execute(text("SHOW COLUMNS FROM project_invitations LIKE 'task_id'"))
                    if not res_inv.fetchone():
                        conn.execute(text("ALTER TABLE project_invitations ADD COLUMN task_id INT NULL, ADD INDEX idx_project_invitations_task_id (task_id)"))
                        conn.commit()
                    # Migrate existing project creators to project_members as owner
                    conn.execute(text("""
                        INSERT IGNORE INTO project_members (project_id, user_id, role, invited_by, joined_at)
                        SELECT id, user_id, 'owner', NULL, created_at FROM projects
                    """))
                    conn.commit()
                except Exception:
                    # --- SQLite fallback ---
                    try:
                        res = conn.execute(text("PRAGMA table_info(tasks)"))
                        cols = [row[1] for row in res.fetchall()]
                        if 'project_id' not in cols:
                            conn.execute(text("ALTER TABLE tasks ADD COLUMN project_id INTEGER"))
                            conn.commit()
                        res_inv = conn.execute(text("PRAGMA table_info(project_invitations)"))
                        cols_inv = [row[1] for row in res_inv.fetchall()]
                        if 'task_id' not in cols_inv:
                            conn.execute(text("ALTER TABLE project_invitations ADD COLUMN task_id INTEGER"))
                            conn.commit()
                        # Migrate existing project creators as owner
                        conn.execute(text("""
                            INSERT OR IGNORE INTO project_members (project_id, user_id, role, invited_by, joined_at)
                            SELECT id, user_id, 'owner', NULL, created_at FROM projects
                        """))
                        conn.commit()
                    except Exception:
                        pass
        except Exception:
            pass
    
    return app


def register_jwt_error_handlers(app):
    """Register JWT related error handlers"""
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {
            'success': False,
            'message': 'Token has expired'
        }, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {
            'success': False,
            'error': 'invalid_token',
            'message': 'Invalid token. Please provide a valid access token.'
        }, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {
            'success': False,
            'error': 'missing_token',
            'message': 'Authorization header is missing or malformed. Use: Bearer <access_token>'
        }, 401
