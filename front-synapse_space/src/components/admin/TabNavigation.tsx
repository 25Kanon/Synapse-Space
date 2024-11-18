import { type TabInfo } from './types/activity';

interface TabNavigationProps {
    tabs: readonly TabInfo[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
    return (
        <nav className="mb-8">
            <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => onTabChange(id)}
                            className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                ${
                                activeTab === id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
              `}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}