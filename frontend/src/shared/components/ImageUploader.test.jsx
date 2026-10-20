import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../services/apiClient', () => ({ default: { post: vi.fn() } }));

import ImageUploader from './ImageUploader';
import apiClient from '../../services/apiClient';

const pick = (file) => {
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
};

beforeEach(() => vi.clearAllMocks());

describe('ImageUploader', () => {
    it('rejects files that are not JPG, PNG or WebP before contacting the server', async () => {
        render(<ImageUploader onUploaded={vi.fn()} />);
        pick(new File(['x'], 'doc.pdf', { type: 'application/pdf' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('JPG, PNG or WebP');
        expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('rejects images larger than 5 MB', async () => {
        render(<ImageUploader onUploaded={vi.fn()} />);
        const big = new File(['x'], 'big.png', { type: 'image/png' });
        Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 });
        pick(big);
        expect(await screen.findByRole('alert')).toHaveTextContent('5 MB');
        expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('shows the server message when uploads are not configured', async () => {
        apiClient.post.mockRejectedValue({ response: { data: { error: 'Image upload is not configured.' } } });
        render(<ImageUploader onUploaded={vi.fn()} />);
        pick(new File(['x'], 'a.png', { type: 'image/png' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('not configured');
    });
});
