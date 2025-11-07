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
import { toast } from 'sonner';

export function AvatarPicker({ user, onAvatarChange, children }) {
  const { t } = useTranslation();
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.invalidImageType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('settings.imageTooLarge'));
      return;
    }

    setUploading(true);
    try {
      // TODO: Replace with actual MinIO upload when backend is ready
      // For now, create a local preview URL
      const previewUrl = URL.createObjectURL(file);

      // In production, this would be:
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const response = await api.uploadAvatar(formData);
      // setSelectedAvatar(response.url);

      // For now, store the preview URL
      setSelectedAvatar(previewUrl);
      toast.success(t('settings.imageUploadSuccess'));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(t('settings.imageUploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onAvatarChange(selectedAvatar);
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
            {selectedAvatar && selectedAvatar.startsWith('blob:') && (
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
