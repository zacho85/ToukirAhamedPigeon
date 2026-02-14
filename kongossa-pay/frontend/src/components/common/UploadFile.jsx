import { useState } from 'react';
import axios from 'axios';

export default function UploadField({ label, name, onUpload, showPreview = true }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'legalDocs');

    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpload(data.path);
      if (showPreview && file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      }
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium">{label}</label>
      <input
        type="file"
        name={name}
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full border p-2 rounded"
      />
      {uploading && <p className="text-blue-500 text-sm">Uploading...</p>}
      {showPreview && preview && (
        <img
          src={preview}
          alt="preview"
          className="w-32 h-32 object-cover rounded-md border"
        />
      )}
    </div>
  );
}
