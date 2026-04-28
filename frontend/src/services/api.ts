import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  ApiResponse, 
  User, 
  Project, 
  Task, 
  Invitation,
  PaginatedResponse,
  CreateProjectData,
  UpdateProjectData,
  CreateTaskData,
  UpdateTaskData,
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  UpdateProfileData,
  ChangePasswordData,
  AddMemberData,
  TaskFilters
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para añadir token de autenticación
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de autenticación
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(method: string, url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.request({
        method,
        url,
        data,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  }

  // Autenticación
  async login(data: LoginData): Promise<AuthResponse> {
    return this.request('POST', '/auth/login', data) as unknown as Promise<AuthResponse>;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request('POST', '/auth/register', data) as unknown as Promise<AuthResponse>;
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request('GET', `/auth/verify-email/${token}`);
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    return this.request('POST', '/auth/resend-verification', { email });
  }

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    return this.request('POST', '/auth/forgot-password', data);
  }

  async resetPassword(token: string, data: ResetPasswordData): Promise<ApiResponse> {
    return this.request('PUT', `/auth/reset-password/${token}`, data);
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.request<any>('GET', '/auth/profile');
    if (response.success && response.data && response.data.user) {
      response.data = response.data.user;
    }
    return response;
  }

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    const response = await this.request<any>('PUT', '/auth/profile', data);
    if (response.success && response.data && response.data.user) {
      response.data = response.data.user;
    }
    return response;
  }

  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    return this.request('PUT', '/auth/change-password', data);
  }

  // Proyectos
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const response = await this.request<any>('GET', '/projects');
    if (response.success && response.data && response.data.projects) {
      response.data = response.data.projects;
    }
    return response;
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await this.request<any>('GET', `/projects/${id}`);
    if (response.success && response.data && response.data.project) {
      response.data = response.data.project;
    }
    return response;
  }

  async createProject(data: CreateProjectData): Promise<ApiResponse<Project>> {
    const response = await this.request<any>('POST', '/projects', data);
    if (response.success && response.data && response.data.project) {
      response.data = response.data.project;
    }
    return response;
  }

  async updateProject(id: string, data: UpdateProjectData): Promise<ApiResponse<Project>> {
    const response = await this.request<any>('PUT', `/projects/${id}`, data);
    if (response.success && response.data && response.data.project) {
      response.data = response.data.project;
    }
    return response;
  }

  async deleteProject(id: string, confirmationName: string): Promise<ApiResponse> {
    return this.request('DELETE', `/projects/${id}`, { confirmationName });
  }

  async getProjectStats(id: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/projects/${id}/stats`);
  }

  async addMember(id: string, data: AddMemberData): Promise<ApiResponse<Invitation>> {
    const response = await this.request<any>('POST', `/projects/${id}/members`, data);
    if (response.success && response.data && response.data.invitation) {
      response.data = response.data.invitation;
    }
    return response;
  }

  async updateMemberRole(projectId: string, userId: string, role: string): Promise<ApiResponse> {
    const response = await this.request<any>('PUT', `/projects/${projectId}/members/${userId}`, { role });
    if (response.success && response.data && response.data.member) {
      response.data = response.data.member;
    }
    return response;
  }

  async removeMember(projectId: string, userId: string): Promise<ApiResponse> {
    return this.request('DELETE', `/projects/${projectId}/members/${userId}`);
  }

  // Tareas
  async getTasks(projectId: string, filters?: TaskFilters): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const url = `/tasks/project/${projectId}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request('GET', url);
  }

  async getMyTasks(): Promise<ApiResponse<Task[]>> {
    const response = await this.request<any>('GET', '/tasks/my-tasks');
    if (response.success && response.data && response.data.tasks) {
      response.data = response.data.tasks;
    }
    return response;
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    const response = await this.request<any>('GET', `/tasks/${id}`);
    if (response.success && response.data && response.data.task) {
      response.data = response.data.task;
    }
    return response;
  }

  async createTask(data: CreateTaskData): Promise<ApiResponse<Task>> {
    const response = await this.request<any>('POST', '/tasks', data);
    if (response.success && response.data && response.data.task) {
      response.data = response.data.task;
    }
    return response;
  }

  async updateTask(id: string, data: UpdateTaskData): Promise<ApiResponse<Task>> {
    const response = await this.request<any>('PUT', `/tasks/${id}`, data);
    if (response.success && response.data && response.data.task) {
      response.data = response.data.task;
    }
    return response;
  }

  async deleteTask(id: string): Promise<ApiResponse> {
    return this.request('DELETE', `/tasks/${id}`);
  }

  async addComment(taskId: string, content: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/tasks/${taskId}/comments`, { content });
  }

  async addWatcher(taskId: string): Promise<ApiResponse> {
    return this.request('POST', `/tasks/${taskId}/watchers`);
  }

  async removeWatcher(taskId: string): Promise<ApiResponse> {
    return this.request('DELETE', `/tasks/${taskId}/watchers`);
  }

  // Usuarios
  async searchUsers(query: string, limit?: number): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', limit.toString());
    const response = await this.request<any>('GET', `/users/search?${params.toString()}`);
    if (response.success && response.data && response.data.users) {
      response.data = response.data.users;
    }
    return response;
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await this.request<any>('GET', `/users/${id}`);
    if (response.success && response.data && response.data.user) {
      response.data = response.data.user;
    }
    return response;
  }

  // Invitaciones
  async getMyInvitations(): Promise<ApiResponse<any[]>> {
    const response = await this.request<any>('GET', '/invitations/me');
    if (response.success && response.data && response.data.invitations) {
      response.data = response.data.invitations;
    }
    return response;
  }

  async getInvitation(token: string): Promise<ApiResponse<any>> {
    const response = await this.request<any>('GET', `/invitations/${token}`);
    if (response.success && response.data && response.data.invitation) {
      response.data = response.data.invitation;
    }
    return response;
  }

  async acceptInvitation(token: string): Promise<ApiResponse> {
    return this.request('POST', `/invitations/${token}/accept`);
  }

  async declineInvitation(token: string): Promise<ApiResponse> {
    return this.request('POST', `/invitations/${token}/decline`);
  }
}

export const apiService = new ApiService();
export default apiService;
