import React from 'react';
import { useState } from 'react';
const Search = () => {
    const communities = [
        {
            name: 'No-Code',
            description: "It's easier than ever to build powerful apps and websites without code.",
            members: '19,364 members',
            date: 'Nov \'19',
            image: 'path/to/no-code-image',
        },
        {
            name: 'Bubble No Code Developers',
            description: 'Share tips and progress on products built on Bubble!',
            members: '19,364 members',
            date: 'Nov \'19',
            image: 'path/to/bubble-no-code-image',
        },
        {
            name: 'Low Code',
            description: 'Talking about the middle ground between code and no-code',
            members: '19,364 members',
            date: 'Nov \'19',
            image: 'path/to/low-code-image',
        },
    ];

    const users = [
        {
            username: 'nocodelife',
            displayName: 'Nocode Life',
            avatar: 'path/to/avatar1',
        },
        {
            username: 'nocodeeco',
            displayName: 'Torrence Mays',
            avatar: 'path/to/avatar2',
        },
        {
            username: 'gurunocode',
            displayName: 'Sakura Blossom',
            avatar: 'path/to/avatar3',
        },
        {
            username: 'naenocodevis',
            displayName: 'Naevis',
            avatar: 'path/to/avatar4',
        },
        {
            username: 'purrnocode',
            displayName: 'Catto',
            avatar: 'path/to/avatar5',
        },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    return (
        <main className="flex-grow p-6">
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Explore your space.</h1>
                <p className="text-gray-400">Search for and join communities that fit your passions.</p>

                {/* Search bar */}
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="flex-grow px-4 py-2 bg-gray-800 rounded-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="bg-blue-500 px-4 py-2 rounded-lg">Search</button>
                </div>

                {/* Community Results */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">3 communities for "{searchTerm}"</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {communities.map((community, index) => (
                            <div key={index} className="bg-gray-800 rounded-lg p-4 shadow-lg">
                                <div className="flex items-center justify-center h-40 bg-gray-700 rounded-lg mb-4">
                                    {/* Image Placeholder */}
                                    <img src={community.image} alt={community.name} className="w-full h-full object-cover rounded-lg" />
                                </div>
                                <h3 className="text-xl font-bold">{community.name}</h3>
                                <p className="text-gray-400">{community.description}</p>
                                <p className="text-sm text-gray-500">{community.members}</p>
                                <p className="text-sm text-gray-500">{community.date}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Users Related to the Search */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">656 users for "{searchTerm}"</h2>
                    <div className="flex space-x-4">
                        {users.map((user, index) => (
                            <div key={index} className="text-center">
                                <div className="h-16 w-16 rounded-full bg-gray-700 overflow-hidden mb-2">
                                    {/* Avatar Placeholder */}
                                    <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
                                </div>
                                <p>{user.displayName}</p>
                                <p className="text-gray-400 text-sm">@{user.username}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Search;