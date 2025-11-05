import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Camera,
  Edit3,
  Instagram,
  Building,
  Globe,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Settings,
  ExternalLink,
  Heart
} from 'lucide-react';

interface UserProfileCardProps {
  profileData: {
    full_name: string;
    company: string;
    phone: string;
    website: string;
    bio: string;
  };
  instagramHandle?: string;
  profileCompletion?: number;
  onProfileUpdate?: (data: any) => void;
}

interface ProfileField {
  key: keyof typeof defaultProfileData;
  label: string;
  icon: React.ComponentType<any>;
  placeholder: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  required: boolean;
}

const defaultProfileData = {
  full_name: '',
  company: '',
  phone: '',
  website: '',
  bio: ''
};

const profileFields: ProfileField[] = [
  {
    key: 'full_name',
    label: 'Full Name',
    icon: User,
    placeholder: 'Enter your full name',
    type: 'text',
    required: true
  },
  {
    key: 'company',
    label: 'Company',
    icon: Building,
    placeholder: 'Company or brand name',
    type: 'text',
    required: false
  },
  {
    key: 'phone',
    label: 'Phone',
    icon: Phone,
    placeholder: '+1 (555) 123-4567',
    type: 'tel',
    required: false
  },
  {
    key: 'website',
    label: 'Website',
    icon: Globe,
    placeholder: 'https://yourwebsite.com',
    type: 'url',
    required: false
  },
  {
    key: 'bio',
    label: 'Bio',
    icon: Edit3,
    placeholder: 'Tell us about yourself...',
    type: 'textarea',
    required: false
  }
];

export default function UserProfileCard({ 
  profileData, 
  instagramHandle,
  profileCompletion = 0,
  onProfileUpdate 
}: UserProfileCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profileData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditData(profileData);
  }, [profileData]);

  const calculateProfileCompletion = () => {
    const fields = profileFields;
    const filledFields = fields.filter(field => {
      const value = profileData[field.key];
      return value && value.trim().length > 0;
    });
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const currentCompletion = profileCompletion || calculateProfileCompletion();

  const getCompletionStatus = () => {
    if (currentCompletion >= 80) return { color: 'text-green-500', bg: 'bg-green-100', label: 'Complete' };
    if (currentCompletion >= 60) return { color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Good' };
    if (currentCompletion >= 40) return { color: 'text-orange-500', bg: 'bg-orange-100', label: 'Needs Work' };
    return { color: 'text-red-500', bg: 'bg-red-100', label: 'Incomplete' };
  };

  const completionStatus = getCompletionStatus();

  const handleSave = async () => {
    setLoading(true);
    try {
      await onProfileUpdate?.(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Profile Overview
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your account information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full ${completionStatus.bg} ${completionStatus.color} text-xs font-medium flex items-center gap-1`}>
            {currentCompletion >= 60 ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {completionStatus.label}
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {(profileData.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-700 rounded-full border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Camera className="h-3 w-3 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            {profileData.full_name || 'Complete Your Profile'}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <Instagram className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {instagramHandle ? `@${instagramHandle}` : 'Connect Instagram account'}
            </span>
          </div>
          {profileData.company && (
            <div className="flex items-center gap-2 mt-1">
              <Building className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {profileData.company}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Completion
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {currentCompletion}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              currentCompletion >= 80 ? 'bg-green-500' :
              currentCompletion >= 60 ? 'bg-yellow-500' :
              currentCompletion >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${currentCompletion}%` }}
          ></div>
        </div>
      </div>

      {/* Profile Fields */}
      <div className="space-y-4">
        {profileFields.map((field) => {
          const Icon = field.icon;
          const value = isEditing ? editData[field.key] : profileData[field.key];
          
          return (
            <div key={field.key} className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {isEditing ? (
                  field.type === 'textarea' ? (
                    <textarea
                      value={value}
                      onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={value}
                      onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  )
                ) : (
                  <div className="mt-1">
                    {value && value.trim() ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {field.type === 'url' && !value.startsWith('http') ? 'https://' : ''}{value}
                        </span>
                        {field.type === 'url' && (
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm italic">
                        Not provided
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        {isEditing ? (
          <>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Tips */}
      {currentCompletion < 100 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Profile Tip
            </span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {currentCompletion < 40 && "Complete your profile to build trust and credibility with your audience."}
            {currentCompletion >= 40 && currentCompletion < 80 && "Add your website and bio to help visitors learn more about you."}
            {currentCompletion >= 80 && "Your profile is looking great! Consider adding a profile picture for the finishing touch."}
          </p>
        </div>
      )}
    </div>
  );
}