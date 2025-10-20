import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Label } from '@/components/retroui/Label';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, changePassword, deleteAccount } from '@/lib/settingsApi';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Loader2, Save, Lock, Trash2, AlertTriangle } from 'lucide-react';

export default function Settings() {
  usePageTitle('Settings');
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName && !email) {
      toast.error('Please provide at least one field to update');
      return;
    }

    setIsUpdatingProfile(true);

    try {
      await updateUserProfile({
        full_name: fullName !== user?.full_name ? fullName : undefined,
        email: email !== user?.email ? email : undefined,
      });

      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to update profile';
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      setOldPassword('');
      setNewPassword('');
      toast.success('Password changed successfully');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to change password';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion');
      return;
    }

    setIsDeletingAccount(true);

    try {
      await deleteAccount({
        password: deletePassword,
        confirmation: deleteConfirmation,
      });

      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to delete account';
      toast.error(message);
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 font-head text-4xl font-bold">Settings</h1>

      {/* Profile Settings Card */}
      <div className="mb-8 overflow-hidden rounded-lg border-2 border-black shadow-[4px_4px_0_0_#000]">
        <div className="bg-gradient-to-br from-primary to-primary-hover p-6">
          <h2 className="font-head text-2xl font-bold text-white">Profile Settings</h2>
          <p className="mt-1 text-sm text-white/90">Update your personal information</p>
        </div>

        <div className="bg-white p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={isUpdatingProfile}
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isUpdatingProfile}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingProfile} className="gap-2">
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="mb-8 overflow-hidden rounded-lg border-2 border-black shadow-[4px_4px_0_0_#000]">
        <div className="bg-gradient-to-br from-secondary to-secondary/90 p-6">
          <h2 className="font-head text-2xl font-bold text-white">Change Password</h2>
          <p className="mt-1 text-sm text-white/90">Update your account password</p>
        </div>

        <div className="bg-white p-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                disabled={isChangingPassword}
                required
              />
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                disabled={isChangingPassword}
                required
              />
              <p className="mt-1 text-xs text-gray-600">Minimum 8 characters required</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="secondary" disabled={isChangingPassword} className="gap-2">
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="overflow-hidden rounded-lg border-2 border-red-600 shadow-[4px_4px_0_0_#dc2626]">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6">
          <h2 className="font-head text-2xl font-bold text-white">Danger Zone</h2>
          <p className="mt-1 text-sm text-white/90">Permanently delete your account</p>
        </div>

        <div className="bg-white p-6">
          <div className="mb-4 flex items-start gap-3 rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900">Warning: This action is irreversible!</p>
              <p className="mt-1 text-yellow-800">
                Deleting your account will permanently remove all your data, including resumes and
                analyses. This cannot be undone.
              </p>
            </div>
          </div>

          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <Label htmlFor="deletePassword">Password</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isDeletingAccount}
                required
              />
            </div>

            <div>
              <Label htmlFor="deleteConfirmation">
                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
              </Label>
              <Input
                id="deleteConfirmation"
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE to confirm"
                disabled={isDeletingAccount}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isDeletingAccount}
                className="gap-2 border-red-600 bg-red-500 text-white hover:bg-red-600"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
