// Single source of truth for "who sees what". Used by the router guards, the navbar
// and the login redirect, so the three never disagree.

// Where each role lands after login (and where it is sent if it opens a page it can't use)
export const homeFor = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'seller') return '/dashboard';
    return '/marketplace'; // buyers and guests
};

// Guests and buyers shop; sellers and admins work in their own dashboards
export const isShopper = (user) => !user || user.role === 'buyer';

// Top navigation per role
export const NAV_LINKS = {
    guest: [
        { to: '/marketplace', label: 'Marketplace' },
        { to: '/auctions', label: 'Auctions' },
        { to: '/how-it-works', label: 'How it works' },
        { to: '/about', label: 'About' },
    ],
    buyer: [
        { to: '/marketplace', label: 'Marketplace' },
        { to: '/auctions', label: 'Auctions' },
        { to: '/orders', label: 'My orders' },
    ],
    seller: [
        { to: '/dashboard', label: 'Dashboard', end: true },
        { to: '/dashboard/products', label: 'My products' },
        { to: '/dashboard/orders', label: 'Orders' },
        { to: '/dashboard/analytics', label: 'Analytics' },
    ],
    admin: [
        { to: '/admin', label: 'Overview', end: true },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/products', label: 'Products' },
        { to: '/admin/orders', label: 'Orders' },
    ],
};

export const navLinksFor = (user) => NAV_LINKS[user?.role] || NAV_LINKS.guest;
