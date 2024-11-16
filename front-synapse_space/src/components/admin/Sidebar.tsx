import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Flag, Settings, Zap, GraduationCap, BadgeCheck } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: MessageSquare, label: 'Posts', path: '/admin/posts' },
        { icon: BadgeCheck, label: 'Student Verification', path: '/admin/verifications' },
        { icon: GraduationCap, label: 'Programs', path: '/admin/programs' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="bg-base-100 w-64 min-h-screen p-4">
            <div className="flex items-center gap-2 mb-8 px-2">
                <Zap className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold">Synapse Space</span>
            </div>
            <nav>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-gray-800'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
