import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../services/socket', () => ({
    default: { connected: false, on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    connectSocket: vi.fn(),
    disconnectSocket: vi.fn(),
}));

import RegisterPage from './RegisterPage';

describe('RegisterPage', () => {
    it('keeps the submit button disabled until privacy consent is given', () => {
        render(
            <QueryClientProvider client={new QueryClient()}>
                <MemoryRouter><RegisterPage /></MemoryRouter>
            </QueryClientProvider>
        );
        const submit = document.getElementById('register-submit');
        const consent = screen.getByLabelText(/privacy policy/i);

        expect(submit).toBeDisabled();
        fireEvent.click(consent);
        expect(submit).toBeEnabled();
    });
});
