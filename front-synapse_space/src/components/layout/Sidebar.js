// MainContent.js
import React from 'react';
const Sidebar = () => {
    return (
        < aside className="w-64 bg-gray-800 p-6 flex flex-col space-y-4" >
            <div className="text-xl font-bold">Synapse Space</div>
            <nav className="space-y-2">
                <a href="#" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                    <span className="material-icons">home</span>
                    <span>Home</span>
                </a>
                <a href="#" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                    <span className="material-icons">add_circle</span>
                    <span>Create New Community</span>
                </a>
                <a href="#" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                    <span className="material-icons">search</span>
                    <span>Discover Communities</span>
                </a>
            </nav>
            <div className="border-t border-gray-600 pt-4">
                <h2 className="text-sm font-bold text-gray-400">Communities</h2>
                <div className="space-y-2 mt-2">
                    <a href="#" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                        <img src="https://via.placeholder.com/32" className="rounded-full" alt="Community" />
                        <span>Software Developerszxz</span>
                    </a>
                    <a href="#" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                        <img src="https://via.placeholder.com/32" className="rounded-full" alt="Community" />
                        <span>Moosicianszsxs</span>
                    </a>
                    <a href="#" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                        <img src="https://via.placeholder.com/32" className="rounded-full" alt="Community" />
                        <span>Code Busters</span>
                    </a>
                </div>
            </div>
        </aside >
    );
}

export default Sidebar;