"""
Database Seeding Script
Run this to populate database with test data
"""
import os
from dotenv import load_dotenv
from app import create_app, db
from app.models import User, Project, ProjectMember, Task
from datetime import datetime, timedelta
import sys

# Load environment variables from .env file FIRST
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

def seed_database():
    """Add test data to database"""
    app = create_app()
    
    with app.app_context():
        try:
            print("=" * 60)
            print("Seeding database with test data...")
            print("=" * 60)
            
            # Create test users
            user1 = User(
                username='john_owner',
                email='john@example.com',
                full_name='John Owner',
                role='user',
                is_active=True
            )
            user1.set_password('password123')
            
            user2 = User(
                username='jane_manager',
                email='jane@example.com',
                full_name='Jane Manager',
                role='user',
                is_active=True
            )
            user2.set_password('password123')
            
            user3 = User(
                username='bob_member',
                email='bob@example.com',
                full_name='Bob Member',
                role='user',
                is_active=True
            )
            user3.set_password('password123')
            
            db.session.add_all([user1, user2, user3])
            db.session.commit()
            
            print(f"\n✅ Created test users:")
            print(f"   1. {user1.username} - Owner")
            print(f"      Email: {user1.email}")
            print(f"      Password: password123")
            print(f"\n   2. {user2.username} - Manager")
            print(f"      Email: {user2.email}")
            print(f"      Password: password123")
            print(f"\n   3. {user3.username} - Member")
            print(f"      Email: {user3.email}")
            print(f"      Password: password123")
            
            # Create test project
            project = Project(
                user_id=user1.id,
                summary='Website Redesign',
                description='Complete redesign of company website with modern design and improved UX',
                priority='high',
                status='active',
                due_date=datetime.utcnow() + timedelta(days=30),
                reporter=user1.full_name
            )
            db.session.add(project)
            db.session.flush()
            
            # Add members to project
            owner_member = ProjectMember(
                project_id=project.id,
                user_id=user1.id,
                role='owner'
            )
            
            manager_member = ProjectMember(
                project_id=project.id,
                user_id=user2.id,
                role='manager',
                invited_by=user1.id
            )
            
            member_member = ProjectMember(
                project_id=project.id,
                user_id=user3.id,
                role='member',
                invited_by=user2.id
            )
            
            db.session.add_all([owner_member, manager_member, member_member])
            db.session.commit()
            
            print(f"\n✅ Created project: {project.summary}")
            print(f"   ID: {project.id}")
            print(f"   Owner: {user1.full_name}")
            print(f"   Manager: {user2.full_name}")
            print(f"   Member: {user3.full_name}")
            
            # Create test tasks
            task1 = Task(
                user_id=user2.id,
                assigned_to=user3.id,
                project_id=project.id,
                summary='Design homepage layout',
                description='Create mockups for homepage. Focus on responsive design.',
                priority='high',
                status='todo',
                due_date=datetime.utcnow() + timedelta(days=7)
            )
            
            task2 = Task(
                user_id=user2.id,
                assigned_to=user3.id,
                project_id=project.id,
                summary='Create CSS styling',
                description='Style homepage with responsive design. Support mobile and desktop.',
                priority='medium',
                status='todo',
                due_date=datetime.utcnow() + timedelta(days=14)
            )
            
            task3 = Task(
                user_id=user2.id,
                assigned_to=user3.id,
                project_id=project.id,
                summary='Implement navigation menu',
                description='Create sticky navigation with smooth scrolling.',
                priority='high',
                status='todo',
                due_date=datetime.utcnow() + timedelta(days=10)
            )
            
            db.session.add_all([task1, task2, task3])
            db.session.commit()
            
            print(f"\n✅ Created test tasks:")
            print(f"   1. {task1.summary}")
            print(f"      Priority: {task1.priority.upper()}")
            print(f"      Status: {task1.status.upper()}")
            print(f"      Assigned to: {user3.full_name}")
            print(f"\n   2. {task2.summary}")
            print(f"      Priority: {task2.priority.upper()}")
            print(f"      Status: {task2.status.upper()}")
            print(f"      Assigned to: {user3.full_name}")
            print(f"\n   3. {task3.summary}")
            print(f"      Priority: {task3.priority.upper()}")
            print(f"      Status: {task3.status.upper()}")
            print(f"      Assigned to: {user3.full_name}")
            
            print("\n" + "=" * 60)
            print("✅ Database seeded successfully!")
            print("=" * 60)
            print("\nTest Credentials:")
            print("  Owner:")
            print("    Username: john_owner")
            print("    Email: john@example.com")
            print("    Password: password123")
            print("\n  Manager:")
            print("    Username: jane_manager")
            print("    Email: jane@example.com")
            print("    Password: password123")
            print("\n  Member:")
            print("    Username: bob_member")
            print("    Email: bob@example.com")
            print("    Password: password123")
            print("\n" + "=" * 60)
            print("Next step: Start the server with 'python run.py'")
            print("=" * 60)
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error seeding database:")
            print(f"   {str(e)}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = seed_database()
    sys.exit(0 if success else 1)
