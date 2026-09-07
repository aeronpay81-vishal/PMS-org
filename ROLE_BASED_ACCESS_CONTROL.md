# Work Organization - Role-Based Access Control Implementation

## Overview
Comprehensive role-based access control has been implemented across the project management system to ensure proper work organization with managers assigning tasks to team members.

---

## System Architecture

### User Roles
```
Global Roles (in User model):
├── user (default) - Regular user
├── manager - System admin/global manager
└── admin - System administrator

Project Roles (in ProjectMember):
├── owner - Project creator with full control
├── manager - Can assign tasks and manage members
└── member - Can view project and update own tasks
```

---

## Role-Based Permissions

### 1. **Project Management**

| Permission | Owner | Manager | Member | Global Manager |
|------------|-------|---------|--------|-----------------|
| Create Project | ✅ | ✅ | ✅ | ✅ |
| View Project | ✅ | ✅ | ✅ | ✅ |
| Update Project | ✅ | ✅ | ❌ | ✅ |
| Delete Project | ✅ | ❌ | ❌ | ✅ |
| View Members | ✅ | ✅ | ✅ | ✅ |
| Manage Members | ✅ | ❌ | ❌ | ✅ |
| Change Member Role | ✅ | ❌ | ❌ | ✅ |
| Remove Members | ✅ | ❌ | ❌ | ✅ |

### 2. **Task Management**

| Permission | Owner | Manager | Member | Global Manager |
|------------|-------|---------|--------|-----------------|
| Create Task | ✅ | ✅ | ❌ | ✅ |
| View All Tasks | ✅ | ✅ | ✅ | ✅ |
| View Own Tasks | ✅ | ✅ | ✅ | ✅ |
| Update Full Task* | ✅ | ✅ | ❌ | ✅ |
| Update Status** | ✅ | ✅ | ✅ | ✅ |
| Assign Tasks | ✅ | ✅ | ❌ | ✅ |
| Delete Task | ✅ | ✅ | ❌ | ✅ |

*Full Task = All fields (summary, priority, dates, labels, etc.)
**Status = Only task status update for assigned tasks

### 3. **Report Management**

| Permission | Owner | Manager | Member | Global Manager |
|------------|-------|---------|--------|-----------------|
| Create Report | ✅ | ✅ | ✅ | ✅ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Delete Report | ✅ (own) | ❌ | ✅ (own) | ✅ |

---

## Implementation Details

### New Files Created

#### 1. **app/utils/permission_checker.py**
Centralized permission checking utility with static methods:

```python
PermissionChecker.is_project_owner(user_id, project_id)
PermissionChecker.is_project_manager(user_id, project_id)
PermissionChecker.is_project_member(user_id, project_id)
PermissionChecker.can_manage_project(user_id, project_id)
PermissionChecker.can_assign_tasks(user_id, project_id)
PermissionChecker.can_manage_members(user_id, project_id)
PermissionChecker.can_create_task(user_id, project_id)
PermissionChecker.can_update_task(user_id, task_id)
PermissionChecker.can_view_task(user_id, task_id)
PermissionChecker.can_delete_task(user_id, task_id)
PermissionChecker.get_accessible_projects(user_id)
PermissionChecker.get_accessible_tasks(user_id, project_id)
```

**RolePermissionError Exception:**
- Raised when user lacks required permission
- Returns HTTP 403 Forbidden status

---

### Updated Files

#### 1. **app/services/project_service.py**
**Major Changes:**
- Uncommented and refactored entire service
- Added permission checks using PermissionChecker
- Implemented proper role-based access control

**Key Methods:**
```python
create_project(user_id, data, file)
  └─ Any authenticated user can create
  └─ Creator becomes project owner

get_projects(user_id)
  └─ Returns only accessible projects
  └─ Uses PermissionChecker.get_accessible_projects()

update_project(user_id, project_id, data, file)
  └─ Requires: Owner or Manager role
  └─ Raises: RolePermissionError if denied

delete_project(user_id, project_id)
  └─ Requires: Owner role
  └─ Raises: RolePermissionError if denied

get_members(user_id, project_id)
  └─ Any project member can view
  └─ Global manager can view any project

update_member_role(user_id, project_id, target_user_id, new_role)
  └─ Requires: Project Owner role
  └─ Raises: RolePermissionError if denied

remove_member(user_id, project_id, target_user_id)
  └─ Requires: Project Owner role
  └─ Raises: RolePermissionError if denied
```

#### 2. **app/services/task_service.py**
**Major Changes:**
- Added import of PermissionChecker and RolePermissionError
- Enhanced create_task with permission validation
- Updated update_task with improved access control
- Simplified get_task_by_id and delete_task using PermissionChecker

**Key Methods:**
```python
create_task(user_id, data)
  └─ Requires: Project Owner/Manager or standalone task
  └─ Permission check: PermissionChecker.can_create_task()

get_task_by_id(user_id, task_id)
  └─ Permission check: PermissionChecker.can_view_task()

update_task(user_id, task_id, data)
  └─ Determines access level and allowed fields
  └─ Members: Can only update status and description
  └─ Managers/Owners: Can update all fields

delete_task(user_id, task_id)
  └─ Permission check: PermissionChecker.can_delete_task()
```

#### 3. **app/controllers/project_controller.py**
**Changes:**
- Added RolePermissionError import
- Updated error handling for all methods
- Added 403 Forbidden response for permission errors
- Fixed method names (get_project_members → get_members)

**Response Codes:**
```
200 OK - Success
201 Created - Resource created
400 Bad Request - Invalid input
403 Forbidden - Permission denied
404 Not Found - Resource not found
500 Internal Server Error
```

#### 4. **app/controllers/task_controller.py**
**Changes:**
- Added RolePermissionError import and handling
- Updated create_task, update_task, delete_task methods
- Added 403 Forbidden response for permission errors

---

## API Endpoints with Access Control

### Projects
```
GET    /api/projects
       → Returns only projects user is member of

POST   /api/projects
       → Create project (any user)
       → User becomes owner

GET    /api/projects/<id>
       → Requires: Project member or global manager

PUT    /api/projects/<id>
       → Requires: Owner or Manager role
       → Returns 403 if denied

DELETE /api/projects/<id>
       → Requires: Owner role
       → Returns 403 if denied
```

### Project Members
```
GET    /api/projects/<id>/members
       → Requires: Project member
       → Returns 403 if denied

PUT    /api/projects/<id>/members/<user_id>
       → Requires: Owner role
       → Returns 403 if denied

DELETE /api/projects/<id>/members/<user_id>
       → Requires: Owner role
       → Returns 403 if denied
```

### Tasks
```
GET    /api/tasks
       → Returns accessible tasks based on role
       → Query: ?project_id=<id>

POST   /api/tasks
       → Requires: Owner/Manager in project
       → Returns 403 if denied

GET    /api/tasks/<id>
       → Requires: Permission via PermissionChecker

PUT    /api/tasks/<id>
       → Members: Status & description only
       → Managers/Owners: All fields
       → Returns 403 if denied

DELETE /api/tasks/<id>
       → Requires: Owner/Manager or creator
       → Returns 403 if denied
```

---

## Work Organization Flow

### 1. Project Creation
```
User creates project
  ↓
User automatically becomes PROJECT OWNER
  ↓
Can invite other users as members
  ↓
Can assign manager role to members
```

### 2. Task Assignment
```
Manager/Owner creates task in project
  ↓
Assigns to project member
  ↓
Member receives notification
  ↓
Member can update status:
  - todo → in_progress → review → testing → done
  ↓
Manager/Owner sees real-time progress
```

### 3. Member Access Levels
```
OWNER (Project Creator)
├─ Full project control
├─ Invite/remove members
├─ Assign manager roles
├─ Create tasks
├─ Assign tasks to members
└─ Delete project

MANAGER (Assigned by Owner)
├─ Create tasks
├─ Assign tasks to members
├─ Update project details
├─ View all project tasks
└─ Cannot manage members

MEMBER (Invited by Owner/Manager)
├─ View project
├─ View all project tasks
├─ Update own task status
├─ Add task descriptions
└─ Cannot create tasks
```

---

## Error Handling

### Permission Errors (403 Forbidden)
```json
{
  "success": false,
  "message": "Only project owners or managers can update this project"
}
```

### Validation Errors (400 Bad Request)
```json
{
  "success": false,
  "message": "Task summary is required"
}
```

### Not Found Errors (404 Not Found)
```json
{
  "success": false,
  "message": "Project not found"
}
```

---

## Database Models

### ProjectMember
```python
class ProjectMember:
    id: Integer (PK)
    project_id: Integer (FK → Project)
    user_id: Integer (FK → User)
    role: String ['owner', 'manager', 'member']
    invited_by: Integer (FK → User)
    joined_at: DateTime
    
    Constraints:
    - Unique(project_id, user_id) - One membership per project
```

### Task
```python
class Task:
    id: Integer (PK)
    user_id: Integer (FK → User) # Creator
    assigned_to: Integer (FK → User) # Assignee
    project_id: Integer (FK → Project)
    summary: String
    description: Text
    priority: String ['low', 'medium', 'high', 'critical']
    status: String ['backlog', 'todo', 'in_progress', 'review', 'testing', 'done']
    # ... other fields
```

---

## Testing the Implementation

### Test Manager Assigning Task
```bash
# 1. Create project as User A
POST /api/projects
{
  "summary": "Website Redesign",
  "description": "Redesign company website"
}
# Response: Project created, User A is owner

# 2. Add User B as manager
PUT /api/projects/<project_id>/members/<user_b_id>
{
  "role": "manager"
}
# Response: User B is now manager

# 3. User B creates task
POST /api/tasks
{
  "summary": "Create homepage",
  "project_id": <project_id>,
  "assigned_to": <user_c_id>,
  "priority": "high"
}
# Response: Task created and assigned to User C

# 4. User C updates task status
PUT /api/tasks/<task_id>
{
  "status": "in_progress"
}
# Response: Status updated successfully

# 5. User C can only update status
PUT /api/tasks/<task_id>
{
  "priority": "critical"
}
# Response: 403 Forbidden - "You can only update task status and description"
```

---

## Summary of Changes

✅ **Implemented:**
- Centralized permission checking system
- Role-based access control for projects
- Role-based access control for tasks
- Proper HTTP status codes (403 Forbidden)
- Complete refactoring of project service
- Enhanced task service with permission checks
- Updated controllers to handle permissions

✅ **Features:**
- Project owner creates and controls access
- Project owner assigns manager roles
- Managers can create and assign tasks
- Members can only update assigned task status
- Proper error messages for denied access
- Support for global manager override

✅ **Ready for:**
- Team collaboration with proper access control
- Work distribution by managers
- Progress tracking with proper permissions
- Secure multi-user project management
