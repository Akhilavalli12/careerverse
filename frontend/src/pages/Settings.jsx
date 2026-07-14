import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const Settings = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoMessage, setVideoMessage] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(res.data.avatarUrl);
      setMessage('Avatar updated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoUploading(true);
    setVideoMessage('');
    try {
      const formData = new FormData();
      formData.append('video', file);
      const res = await api.post('/uploads/video-intro', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVideoUrl(res.data.videoIntroUrl);
      setVideoMessage('Video introduction uploaded successfully.');
    } catch (err) {
      setVideoMessage(err.response?.data?.message || 'Upload failed (max 50MB, mp4/webm/mov)');
    } finally {
      setVideoUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Profile picture</h2>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center text-xl font-semibold text-primary-700">
            {avatarUrl ? <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : user?.name?.[0]}
          </div>
          <label className="px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 cursor-pointer text-sm hover:bg-ink/5 dark:hover:bg-paper-light/10">
            {uploading ? 'Uploading...' : 'Change photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>
        {message && <p className="text-sm text-ink-faint">{message}</p>}
      </section>

      {user?.role === 'student' && (
        <section className="glass rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold">Video introduction</h2>
          <p className="text-xs text-ink-faint">A short (under ~1 minute) video shown on your public portfolio. Max 50MB, mp4/webm/mov.</p>
          {videoUrl && <video src={videoUrl} controls className="w-full rounded-lg max-h-64" />}
          <label className="inline-block px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 cursor-pointer text-sm hover:bg-ink/5 dark:hover:bg-paper-light/10">
            {videoUploading ? 'Uploading...' : videoUrl ? 'Replace video' : 'Upload video'}
            <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoChange} disabled={videoUploading} />
          </label>
          {videoMessage && <p className="text-sm text-ink-faint">{videoMessage}</p>}
        </section>
      )}

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold">Account</h2>
        <div className="text-sm">
          <p><span className="text-ink-faint">Name:</span> {user?.name}</p>
          <p><span className="text-ink-faint">Email:</span> {user?.email}</p>
          <p><span className="text-ink-faint">Role:</span> {user?.role}</p>
          <p>
            <span className="text-ink-faint">Verified:</span>{' '}
            {user?.isVerified ? 'Yes' : 'No — check your inbox for the verification email'}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Settings;
