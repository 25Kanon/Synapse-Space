// MainContent.js
import React from 'react';
const Friends = () => {
    return (
        < aside className="w-64 bg-gray-800 p-6 flex flex-col space-y-4" >
            <h2 className="text-sm font-bold text-gray-400">Friends</h2>
            <div className="space-y-2">
                <a href="#" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                    <img src="https://via.placeholder.com/32" className="rounded-full" alt="Friend" />
                    <span className="font-bold">Seo Yeaji</span>
                    <span className="text-xs text-green-500">Online</span>
                </a>
                <a href="#" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                    <img src="https://via.placeholder.com/32" className="rounded-full" alt="Friend" />
                    <span className="font-bold">Winter</span>
                    <span className="text-xs text-red-500">Offline</span>
                </a>
            </div>
        </aside >
    );
}

export default Friends;