import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: User['role']) => boolean;
  canAccessTest: (test: any) => boolean;
  canModifyTest: (test: any) => boolean;
  canViewResults: (test: any) => boolean;
  canExportData: (test: any) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Comprehensive permission definitions
const PERMISSIONS = {
  // Test management
  'view_tests': 'View all tests',
  'create_tests': 'Create new tests',
  'edit_tests': 'Edit existing tests',
  'delete_tests': 'Delete tests',
  'clone_tests': 'Clone tests',
  'archive_tests': 'Archive tests',
  
  // Test operations
  'start_tests': 'Start test execution',
  'stop_tests': 'Stop test execution',
  'pause_tests': 'Pause tests',
  'resume_tests': 'Resume tests',
  'schedule_tests': 'Schedule test operations',
  
  // Results and analytics
  'view_results': 'View test results',
  'view_analytics': 'View analytics and insights',
  'view_statistical_analysis': 'View statistical analysis',
  'access_real_time_data': 'Access real-time monitoring',
  
  // Data management
  'export_data': 'Export test data',
  'bulk_operations': 'Perform bulk operations',
  'manage_templates': 'Manage test templates',
  'manage_segments': 'Manage user segments',
  
  // User management
  'manage_users': 'Manage user accounts',
  'assign_roles': 'Assign user roles',
  'view_user_activity': 'View user activity logs',
  
  // System administration
  'system_settings': 'Access system settings',
  'audit_logs': 'View audit logs',
  'integrations': 'Manage integrations',
  'notifications': 'Manage notifications'
} as const;

// Role hierarchies with specific permissions
const ROLE_PERMISSIONS: Record<User['role'], string[]> = {
  admin: Object.keys(PERMISSIONS), // All permissions
  
  manager: [
    'view_tests', 'create_tests', 'edit_tests', 'delete_tests', 'clone_tests', 'archive_tests',
    'start_tests', 'stop_tests', 'pause_tests', 'resume_tests', 'schedule_tests',
    'view_results', 'view_analytics', 'view_statistical_analysis', 'access_real_time_data',
    'export_data', 'bulk_operations', 'manage_templates',
    'manage_segments'
  ],
  
  analyst: [
    'view_tests', 'view_results', 'view_analytics', 'view_statistical_analysis',
    'access_real_time_data', 'export_data', 'manage_templates'
  ],
  
  viewer: [
    'view_tests', 'view_results'
  ]
};

// Enhanced mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Sarah Johnson',
    role: 'admin',
    avatar: '/avatars/sarah.jpg',
    permissions: ROLE_PERMISSIONS.admin
  },
  {
    id: '2',
    email: 'manager@example.com',
    name: 'Mike Chen',
    role: 'manager',
    avatar: '/avatars/mike.jpg',
    permissions: ROLE_PERMISSIONS.manager
  },
  {
    id: '3',
    email: 'analyst@example.com',
    name: 'Emma Rodriguez',
    role: 'analyst',
    avatar: '/avatars/emma.jpg',
    permissions: ROLE_PERMISSIONS.analyst
  },
  {
    id: '4',
    email: 'viewer@example.com',
    name: 'Tom Wilson',
    role: 'viewer',
    avatar: '/avatars/tom.jpg',
    permissions: ROLE_PERMISSIONS.viewer
  },
  {
    id: '5',
    email: 'data@example.com',
    name: 'Lisa Park',
    role: 'analyst',
    avatar: '/avatars/lisa.jpg',
    permissions: [...ROLE_PERMISSIONS.analyst, 'bulk_operations', 'manage_segments']
  },
  {
    id: '6',
    email: 'ops@example.com',
    name: 'David Kim',
    role: 'manager',
    avatar: '/avatars/david.jpg',
    permissions: [...ROLE_PERMISSIONS.manager, 'view_audit_logs']
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('abtest_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Validate stored user data
        const validUser = mockUsers.find(u => u.id === userData.id);
        if (validUser) {
          setUser(validUser);
        }
      } catch (error) {
        console.warn('Invalid stored user data:', error);
        localStorage.removeItem('abtest_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('abtest_user', JSON.stringify(foundUser));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('abtest_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: User['role']): boolean => {
    if (!user) return false;
    
    const roleHierarchy = {
      viewer: 1,
      analyst: 2,
      manager: 3,
      admin: 4
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[role];
  };

  // Test-specific access control
  const canAccessTest = (test: any): boolean => {
    if (!user) return false;
    
    // Admin can access all tests
    if (user.role === 'admin') return true;
    
    // Users can access tests they created or collaborate on
    if (test.createdBy === user.id) return true;
    if (test.collaborators?.includes(user.id)) return true;
    
    // Managers and analysts can access all tests
    if (hasRole('manager')) return true;
    
    // Viewers need explicit permission or it's a public test
    return hasPermission('view_tests') || test.isPublic;
  };

  const canModifyTest = (test: any): boolean => {
    if (!user) return false;
    
    // Admin can modify all tests
    if (user.role === 'admin') return true;
    
    // Users can modify tests they created
    if (test.createdBy === user.id) return true;
    
    // Test collaborators with edit permissions
    if (test.collaborators?.includes(user.id)) {
      return hasPermission('edit_tests');
    }
    
    // Managers can modify most tests
    if (hasRole('manager') && !test.isArchived) return true;
    
    return false;
  };

  const canViewResults = (test: any): boolean => {
    if (!user) return false;
    
    // Results visibility rules
    if (test.status === 'completed' || test.status === 'running') {
      return canAccessTest(test);
    }
    
    // Draft tests: only creator, collaborators, and managers
    if (test.status === 'draft') {
      return canModifyTest(test);
    }
    
    return false;
  };

  const canExportData = (test: any): boolean => {
    if (!user) return false;
    
    if (hasPermission('export_data')) {
      // Check if user can access the test
      if (!canViewResults(test)) return false;
      
      // Additional restrictions for drafts
      if (test.status === 'draft' && !canModifyTest(test)) {
        return false;
      }
      
      return true;
    }
    
    return false;
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    hasRole,
    canAccessTest,
    canModifyTest,
    canViewResults,
    canExportData,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};