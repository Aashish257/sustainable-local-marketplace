import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../services/socket', () => ({
    default: { connected: false, on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    connectSocket: vi.fn(),
    disconnectSocket: vi.fn(),
}));

import LoginPage from './LoginPage';

describe('LoginPage demo accounts', () => {
    it('clicking Use on Seller fills the form', () => {
        render(
            <QueryClientProvider client={new QueryClient()}>
                <MemoryRouter><LoginPage /></MemoryRouter>
            </QueryClientProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: /use seller demo account/i }));

        expect(document.querySelector('input[type="email"]')).toHaveValue('seller@sustain.com');
        expect(document.querySelector('input[type="password"]')).toHaveValue('password123');
    });
});
