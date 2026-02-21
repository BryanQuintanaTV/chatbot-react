import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PREDEFINED_AVATARS, getUserInitials } from '@/lib/avatars';
import { Camera, Upload, Check } from 'lucide-react';
import { notify } from '@/lib/notify';
import { useAuth } from '@/contexts/AuthContext';

export function AvatarPicker({ user, onAvatarChange, children }) {
  const { t } = useTranslation();
  const { uploadAvatar } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePredefinedSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (jpg, jpeg, png, webp, gif — matches backend)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      notify.error({ title: t('settings.invalidImageType') });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify.error({ title: t('settings.imageTooLarge') });
      return;
    }

    // Show a local preview immediately while uploading
    const previewUrl = URL.createObjectURL(file);
    setSelectedAvatar(previewUrl);
    setUploading(true);

    try {
      // Upload to MinIO via the backend endpoint
      // The browser sets Content-Type multipart/form-data with the correct boundary
      const updatedUser = await uploadAvatar(file);

      // Replace the blob preview with the real MinIO URL from the response
      URL.revokeObjectURL(previewUrl);
      setSelectedAvatar(updatedUser.avatar);
      notify.success({ title: t('settings.imageUploadSuccess') });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      URL.revokeObjectURL(previewUrl);
      setSelectedAvatar(null);

      if (error.code === 'INVALID_FILE_TYPE') {
        notify.error({ title: t('settings.invalidImageType') });
      } else if (error.code === 'FILE_TOO_LARGE') {
        notify.error({ title: t('settings.imageTooLarge') });
      } else {
        notify.error({ title: t('settings.imageUploadError') });
      }
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    // File uploads are already persisted to MinIO and the user state updated in context.
    // Only call onAvatarChange for predefined avatar selections.
    if (!selectedAvatar || !selectedAvatar.startsWith('http')) {
      onAvatarChange(selectedAvatar);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            {t('settings.changeAvatar')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings.changeAvatar')}</DialogTitle>
          <DialogDescription>
            {t('settings.changeAvatarDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Upload Custom Image */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t('settings.customImage')}</h4>
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? t('common.uploading') : t('settings.uploadImage')}
              </Button>
            </div>
            {selectedAvatar && (selectedAvatar.startsWith('blob:') || selectedAvatar.startsWith('http')) && (
              <div className="mt-3 flex items-center gap-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAvatar} />
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {t('settings.customImagePreview')}
                </span>
              </div>
            )}
          </div>

          {/* Predefined Avatars */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t('settings.predefinedAvatars')}</h4>
            <div className="grid grid-cols-4 gap-3">
              {PREDEFINED_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handlePredefinedSelect(avatar.id)}
                  className={`relative rounded-full aspect-square hover:ring-2 hover:ring-primary transition-all ${
                    selectedAvatar === avatar.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-white font-semibold`}
                  >
                    {getUserInitials(user?.name)}
                  </div>
                  {selectedAvatar === avatar.id && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
