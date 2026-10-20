import { useState } from 'react';
import apiClient from '../../services/apiClient';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

// Uploads one image straight to Cloudinary using a signature from our API,
// then hands the hosted URL back to the form via onUploaded(url).
const ImageUploader = ({ onUploaded }) => {
    const [status, setStatus] = useState({ busy: false, error: null });

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // let the same file be picked again after an error
        if (!file) return;
        if (!ALLOWED.includes(file.type)) return setStatus({ busy: false, error: 'Use a JPG, PNG or WebP image.' });
        if (file.size > MAX_BYTES) return setStatus({ busy: false, error: 'Image must be 5 MB or smaller.' });

        setStatus({ busy: true, error: null });
        try {
            const { data } = await apiClient.post('/uploads/signature');
            const sig = data.data;

            const form = new FormData();
            form.append('file', file);
            form.append('api_key', sig.apiKey);
            form.append('timestamp', sig.timestamp);
            form.append('folder', sig.folder);
            form.append('signature', sig.signature);

            const res = await fetch(sig.uploadUrl, { method: 'POST', body: form });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error?.message || 'Upload failed');

            onUploaded(body.secure_url);
            setStatus({ busy: false, error: null });
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Upload failed';
            setStatus({ busy: false, error: msg });
        }
    };

    return (
        <div className="mt-2">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--border-card)] text-[var(--text-main)] hover:border-emerald-500 cursor-pointer transition-colors">
                <input type="file" accept={ALLOWED.join(',')} onChange={handleFile} disabled={status.busy} className="sr-only" />
                {status.busy ? 'Uploading…' : '⬆ Upload image'}
            </label>
            <span className="ml-2 text-xs text-[var(--text-muted)]">or paste a URL above · JPG/PNG/WebP, max 5 MB</span>
            {status.error && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{status.error}</p>
            )}
        </div>
    );
};

export default ImageUploader;
