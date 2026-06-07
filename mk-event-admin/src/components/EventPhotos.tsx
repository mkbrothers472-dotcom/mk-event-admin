import { useState, useEffect, useRef } from 'react';
import { photosApi } from '../api';
import {
  Camera, Upload, Trash2, X, ZoomIn, Image,
  CheckCircle, ImagePlus, Loader2,
} from 'lucide-react';
import { Button } from './ui';

interface Photo {
  id: string;
  url: string;
  photo_type: 'reference' | 'completed';
  original_name?: string;
  createdAt?: string;
  size?: number;
}

interface EventPhotosProps {
  eventId: string;
  eventName?: string;
}

export function EventPhotos({ eventId, eventName }: EventPhotosProps) {
  const [photos, setPhotos]         = useState<Photo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [activeTab, setActiveTab]   = useState<'reference' | 'completed'>('reference');
  const [lightbox, setLightbox]     = useState<Photo | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Load photos
  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    photosApi.getByEvent(eventId)
      .then(data => setPhotos(data))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  const reference = photos.filter(p => p.photo_type === 'reference');
  const completed = photos.filter(p => p.photo_type === 'completed');
  const current   = activeTab === 'reference' ? reference : completed;

  // Upload handler
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArr.length === 0) return;

    setUploading(true);
    setUploadProgress(`Uploading ${fileArr.length} photo${fileArr.length > 1 ? 's' : ''}...`);
    try {
      const uploaded = await photosApi.upload(eventId, fileArr, activeTab);
      setPhotos(prev => [...uploaded, ...prev]);
      setUploadProgress(`✓ ${fileArr.length} photo${fileArr.length > 1 ? 's' : ''} uploaded!`);
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (err: any) {
      setUploadProgress(`✗ Upload failed: ${err.message}`);
      setTimeout(() => setUploadProgress(''), 4000);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  // Delete photo
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await photosApi.delete(deleteId);
      setPhotos(prev => prev.filter(p => p.id !== deleteId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('reference')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reference'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <ImagePlus className="w-4 h-4" />
          Reference Photos
          {reference.length > 0 && (
            <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-xs px-1.5 py-0.5 rounded-full font-semibold">
              {reference.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-green-600 text-green-600 dark:text-green-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Completed Photos
          {completed.length > 0 && (
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs px-1.5 py-0.5 rounded-full font-semibold">
              {completed.length}
            </span>
          )}
        </button>
      </div>

      {/* Upload area */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
        }`}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleUpload(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{uploadProgress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              activeTab === 'reference'
                ? 'bg-purple-100 dark:bg-purple-900/30'
                : 'bg-green-100 dark:bg-green-900/30'
            }`}>
              <Upload className={`w-6 h-6 ${activeTab === 'reference' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activeTab === 'reference' ? 'Upload Reference Photos' : 'Upload Completed Event Photos'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Drag & drop or click to browse · JPG, PNG, WebP · Max 10MB each
              </p>
            </div>
            <Button
              size="sm"
              variant={activeTab === 'reference' ? 'primary' : 'secondary'}
              className={activeTab === 'completed' ? '!bg-green-600 !text-white hover:!bg-green-700' : ''}
              onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
            >
              <Camera className="w-3.5 h-3.5" />
              Choose Photos
            </Button>
          </div>
        )}
        {uploadProgress && !uploading && (
          <p className={`text-xs mt-2 font-medium ${uploadProgress.startsWith('✓') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {uploadProgress}
          </p>
        )}
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : current.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <Image className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No {activeTab} photos yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Upload photos using the area above
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {current.length} photo{current.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {current.map(photo => (
              <div
                key={photo.id}
                className="relative group w-full aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                style={{ maxWidth: '200px' }}
              >
                <img
                  src={photo.url}
                  alt={photo.original_name || 'Event photo'}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={e => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23e5e7eb"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="12">No Image</text></svg>';
                  }}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setLightbox(photo)}
                    className="p-2 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors shadow-lg"
                    title="View full size"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(photo.id)}
                    className="p-2 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Delete photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Type badge */}
                <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  photo.photo_type === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-500 text-white'
                }`}>
                  {photo.photo_type === 'completed' ? '✓ Done' : 'Ref'}
                </div>
                {/* Size badge */}
                {photo.size && (
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 text-white rounded text-[10px] font-medium backdrop-blur-sm">
                    {formatSize(photo.size)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.original_name || 'Event photo'}
              className="w-full h-full object-contain rounded-xl max-h-[85vh]"
            />
            {lightbox.original_name && (
              <p className="text-white/70 text-xs text-center mt-2">{lightbox.original_name}</p>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white text-center mb-2">Delete Photo?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">
              This photo will be permanently deleted and cannot be recovered.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleDelete} className="flex-1">
                <Trash2 className="w-4 h-4" />Delete
              </Button>
              <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
