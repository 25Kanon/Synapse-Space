import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';


import { LayoutDashboard, Users, MessageSquare, UserCog , Settings, Zap, GraduationCap, BadgeCheck } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
const Sidebar = () => {
    const { isSuperUser } = useContext(AuthContext);
    const [isSuper, setIsSuper] = useState(false);

    useEffect(() => {
        const checkSuperUser = async () => {
            const result = await isSuperUser();
            setIsSuper(result);
        };
        checkSuperUser();
    }, [isSuperUser]);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/management' },
        { icon: Users, label: 'Users', path: '/management/users' },
        { icon: MessageSquare, label: 'Activities', path: '/management/activities' },
        { icon: BadgeCheck, label: 'Student Verification', path: '/management/verifications' },
        { icon: GraduationCap, label: 'Programs', path: '/management/programs' },
        { icon: UserCog, label: 'Account', path: '/management/account' },
    ];

    if (isSuper) {
        navItems.push({ icon: Settings, label: 'Settings', path: '/management/settings' });
    }

    return (
        <div className="w-64 min-h-screen p-4 bg-base-100">
            <div className="flex items-center gap-2 px-2 mb-8">
                <img
                    src="/images/logo2.png" 
                    alt="Synapse Space Logo"
                    className="h-14 w-13"
                />
                <span className="text-xl font-bold">Synapse Space</span>
            </div>
            <nav>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/management'}
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
