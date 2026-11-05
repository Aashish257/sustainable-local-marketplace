import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../services/socket', () => ({
    default: { connected: true, on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    connectSocket: vi.fn(),
    disconnectSocket: vi.fn(),
}));
vi.mock('../services/bidService', () => ({ getHighestBid: vi.fn().mockResolvedValue({ data: null }) }));
vi.mock('../../../services/apiClient', () => ({
    default: { post: vi.fn(), get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import BidPanel from './BidPanel';
import socket from '../../../services/socket';
import apiClient from '../../../services/apiClient';
import useAuthStore from '../../../store/authStore';

const base = { _id: 'p1', price: 100, biddingEnabled: true, biddingStartingPrice: 100 };
const renderPanel = (product) => render(<MemoryRouter><BidPanel product={product} /></MemoryRouter>);
const loginAs = (id) => useAuthStore.setState({ user: { id }, token: 't', isAuthenticated: true });

beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
});

describe('BidPanel', () => {
    it('shows the countdown and asks guests to sign in', async () => {
        renderPanel({ ...base, biddingEndTime: new Date(Date.now() + 3_600_000).toISOString() });
        expect(await screen.findByText(/Ends in/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Sign in to place a bid' })).toHaveAttribute('href', '/login');
    });

    it('only enables "Place bid" for an amount above the current price', async () => {
        loginAs('u1');
        renderPanel(base);
        const input = await screen.findByLabelText(/Your bid/);
        const button = screen.getByRole('button', { name: 'Place bid' });

        fireEvent.change(input, { target: { value: '100' } });
        expect(button).toBeDisabled();

        fireEvent.change(input, { target: { value: '150' } });
        expect(button).toBeEnabled();
        fireEvent.click(button);
        expect(socket.emit).toHaveBeenCalledWith('place_bid', { productId: 'p1', amount: 150 });
    });

    it('lets the winner pay for the item after the auction closes', async () => {
        loginAs('u1');
        apiClient.post.mockResolvedValue({ data: { data: { _id: 'order9' } } });
        renderPanel({ ...base, auctionClosed: true, auctionWinner: 'u1', currentBid: 400 });

        expect(await screen.findByText(/You won at ₹400/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Place bid' })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Pay ₹400 now/ }));
        await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/orders/auction/p1'));
    });

    it('tells other users the item sold, without a pay button', async () => {
        loginAs('someone-else');
        renderPanel({ ...base, auctionClosed: true, auctionWinner: 'u1', currentBid: 400 });
        expect(await screen.findByText(/Sold for ₹400/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Pay/ })).not.toBeInTheDocument();
    });

    it('reports an auction that ended with no bids', async () => {
        renderPanel({ ...base, auctionClosed: true, auctionWinner: null });
        expect(await screen.findByText('Ended with no bids')).toBeInTheDocument();
    });
});
