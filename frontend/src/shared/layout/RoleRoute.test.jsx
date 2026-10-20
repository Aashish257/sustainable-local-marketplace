import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../services/socket', () => ({
    default: { connected: false, on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    connectSocket: vi.fn(),
    disconnectSocket: vi.fn(),
}));

import RoleRoute from './RoleRoute';
import useAuthStore from '../../store/authStore';
import { homeFor, navLinksFor } from '../../app/roles';

// Same guard layout as app/Router.jsx, with placeholder pages
const renderAt = (path) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route element={<RoleRoute allow={['buyer']} guests />}>
                    <Route path="/marketplace" element={<p>SHOP</p>} />
                    <Route path="/auctions" element={<p>AUCTIONS</p>} />
                </Route>
                <Route element={<RoleRoute allow={['buyer']} />}>
                    <Route path="/cart" element={<p>CART</p>} />
                    <Route path="/orders" element={<p>BUYER ORDERS</p>} />
                </Route>
                <Route element={<RoleRoute allow={['seller']} />}>
                    <Route path="/dashboard" element={<p>SELLER DASHBOARD</p>} />
                </Route>
                <Route element={<RoleRoute allow={['admin']} />}>
                    <Route path="/admin" element={<p>ADMIN PANEL</p>} />
                </Route>
                <Route element={<RoleRoute />}>
                    <Route path="/notifications" element={<p>NOTIFICATIONS</p>} />
                </Route>
                <Route path="/login" element={<p>LOGIN</p>} />
            </Routes>
        </MemoryRouter>
    );

const as = (role) =>
    useAuthStore.setState(role ? { token: 't', user: { id: '1', role }, isAuthenticated: true } : { token: null, user: null, isAuthenticated: false });

beforeEach(() => as(null));

// [who, page, what they should end up seeing]
const MATRIX = [
    [null, '/marketplace', 'SHOP'], [null, '/auctions', 'AUCTIONS'], [null, '/cart', 'LOGIN'],
    [null, '/dashboard', 'LOGIN'], [null, '/admin', 'LOGIN'], [null, '/notifications', 'LOGIN'],

    ['buyer', '/marketplace', 'SHOP'], ['buyer', '/auctions', 'AUCTIONS'], ['buyer', '/cart', 'CART'],
    ['buyer', '/orders', 'BUYER ORDERS'], ['buyer', '/dashboard', 'SHOP'], ['buyer', '/admin', 'SHOP'],
    ['buyer', '/notifications', 'NOTIFICATIONS'],

    ['seller', '/marketplace', 'SELLER DASHBOARD'], ['seller', '/auctions', 'SELLER DASHBOARD'],
    ['seller', '/cart', 'SELLER DASHBOARD'], ['seller', '/orders', 'SELLER DASHBOARD'],
    ['seller', '/dashboard', 'SELLER DASHBOARD'], ['seller', '/admin', 'SELLER DASHBOARD'],
    ['seller', '/notifications', 'NOTIFICATIONS'],

    ['admin', '/marketplace', 'ADMIN PANEL'], ['admin', '/cart', 'ADMIN PANEL'],
    ['admin', '/dashboard', 'ADMIN PANEL'], ['admin', '/admin', 'ADMIN PANEL'],
    ['admin', '/notifications', 'NOTIFICATIONS'],
];

describe('Page access by role', () => {
    it.each(MATRIX)('%s opening %s sees %s', (role, path, expected) => {
        as(role);
        renderAt(path);
        expect(screen.getByText(expected)).toBeInTheDocument();
    });
});

describe('Role navigation config', () => {
    it('sends each role to its own home after login', () => {
        expect(homeFor('buyer')).toBe('/marketplace');
        expect(homeFor('seller')).toBe('/dashboard');
        expect(homeFor('admin')).toBe('/admin');
    });

    it('shows shopping links only to guests and buyers', () => {
        const labels = (role) => navLinksFor(role ? { role } : null).map((l) => l.label);
        expect(labels(null)).toContain('Auctions');
        expect(labels('buyer')).toEqual(expect.arrayContaining(['Marketplace', 'Auctions', 'My orders']));
        expect(labels('seller')).not.toContain('Marketplace');
        expect(labels('admin')).not.toContain('Marketplace');
        expect(labels('admin')).toContain('Users');
    });
});
