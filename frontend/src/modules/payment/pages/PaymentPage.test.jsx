import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../services/socket', () => ({
    default: { connected: false, on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    connectSocket: vi.fn(),
    disconnectSocket: vi.fn(),
}));

import PaymentPage from './PaymentPage';

describe('PaymentPage', () => {
    it('tells the buyer no real money is charged when no live Razorpay key is set', () => {
        render(
            <QueryClientProvider client={new QueryClient()}>
                <MemoryRouter initialEntries={['/payment/abc123']}>
                    <Routes><Route path="/payment/:orderId" element={<PaymentPage />} /></Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );
        expect(screen.getByText(/Demo payment: no real money is charged\./)).toBeInTheDocument();
    });
});
