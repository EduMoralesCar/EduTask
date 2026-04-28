export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  isEmailVerified: boolean;
  preferences: UserPreferences;
  createdAt: string;
  lastLogin: string;
}

export interface UserPreferences {
  language: 'es' | 'en';
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  owner: User;
  members: ProjectMember[];
  status: 'active' | 'archived' | 'deleted';
  type: 'scrum' | 'kanban' | 'waterfall';
  avatar?: string;
  startDate: string;
  endDate?: string;
  settings: ProjectSettings;
  statistics: ProjectStatistics;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  user: User;
  role: 'admin' | 'member' | 'developer' | 'tester';
  joinedAt: string;
}

export interface ProjectSettings {
  allowInvitations: boolean;
  requireApproval: boolean;
  defaultAssignee?: string;
}

export interface ProjectStatistics {
  totalTasks: number;
  completedTasks: number;
  activeSprints: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  key: string;
  number: number;
  fullKey: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
  reporter: User;
  assignee?: User;
  type: 'story' | 'task' | 'bug' | 'epic' | 'subtask';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  status: 'todo' | 'in-progress' | 'in-review' | 'done' | 'blocked';
  labels: string[];
  storyPoints?: number;
  originalEstimate?: number;
  remainingEstimate?: number;
  timeSpent: number;
  sprint?: Sprint;
  epic?: Task;
  parent?: Task;
  subtasks: Task[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  watchers: User[];
  dueDate?: string;
  resolution?: 'done' | 'wont-fix' | 'duplicate' | 'cannot-reproduce' | 'fixed';
  resolvedAt?: string;
  resolvedBy?: User;
  isOverdue: boolean;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  project: string;
  state: 'planning' | 'active' | 'completed' | 'closed';
  startDate: string;
  endDate: string;
  completedDate?: string;
  goal?: string;
  tasks: Task[];
  capacity: number;
  velocity: number;
  burndown: SprintBurndownEntry[];
  duration: number;
  isActive: boolean;
  isOverdue: boolean;
  completionPercentage: number;
}

export interface SprintBurndownEntry {
  date: string;
  remaining: number;
  completed: number;
}

export interface TaskAttachment {
  filename: string;
  url: string;
  size: number;
  uploadedBy: User;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  token: string;
  project: Project;
  inviter: User;
  invitee?: User;
  email: string;
  role: 'admin' | 'member' | 'developer' | 'tester';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  expiresAt: string;
  respondedAt?: string;
  isExpired: boolean;
  daysUntilExpiry: number;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreateProjectData {
  name: string;
  key: string;
  description?: string;
  type?: 'scrum' | 'kanban' | 'waterfall';
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  type?: 'scrum' | 'kanban' | 'waterfall';
  settings?: Partial<ProjectSettings>;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  project: string;
  type?: 'story' | 'task' | 'bug' | 'epic' | 'subtask';
  priority?: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  assignee?: string;
  storyPoints?: number;
  originalEstimate?: number;
  dueDate?: string;
  sprint?: string;
  epic?: string;
  parent?: string;
  labels?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  type?: 'story' | 'task' | 'bug' | 'epic' | 'subtask';
  priority?: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  status?: 'todo' | 'in-progress' | 'in-review' | 'done' | 'blocked';
  assignee?: string;
  storyPoints?: number;
  originalEstimate?: number;
  remainingEstimate?: number;
  timeSpent?: number;
  dueDate?: string;
  labels?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AddMemberData {
  email: string;
  role: 'admin' | 'member' | 'developer' | 'tester';
  message?: string;
}

export interface TaskFilters {
  status?: string;
  assignee?: string;
  type?: string;
  priority?: string;
  sprint?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
