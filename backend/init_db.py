"""
Database Initialization Script
Run this to create all database tables
"""
import os
from dotenv import load_dotenv
from app import create_app, db
import sys

# Load environment variables from .env file FIRST
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

def init_database():
    """Initialize database with all tables"""
    app = create_app()
    
    with app.app_context():
        try:
            print("=" * 60)
            print("Creating database tables...")
            print("=" * 60)
            
            db.create_all()
            
            print("\n✅ Database tables created successfully!")
            print("\nTables created:")
            print("  ✓ users")
            print("  ✓ projects")
            print("  ✓ project_members")
            print("  ✓ tasks")
            print("  ✓ project_invitations")
            print("  ✓ project_reports")
            
            print("\n" + "=" * 60)
            print("Database initialization complete!")
            print("=" * 60)
            print("\nNext steps:")
            print("  1. (Optional) Run: python seed_data.py")
            print("  2. Start server: python run.py")
            print("=" * 60)
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error creating database tables:")
            print(f"   {str(e)}")
            print("\nTroubleshooting:")
            print("  1. Check if MySQL is running in XAMPP")
            print("  2. Verify DATABASE_URL in .env file")
            print("  3. Ensure database 'project_management' exists")
            return False

if __name__ == '__main__':
    success = init_database()
    sys.exit(0 if success else 1)
