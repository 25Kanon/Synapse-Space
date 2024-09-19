import React from 'react';
import { useState } from 'react';
const CreateCommunity = () => {
    const [communityName, setCommunityName] = useState('');
    const [description, setDescription] = useState('');
    const [rules, setRules] = useState('');
    const [keyword, setKeyword] = useState('');
    const API_URL = process.env.REACT_APP_API_BASE_URI;
    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            user: {
                name: communityName,
                description: description,
                rules: rules,
                keyword: keyword,
            },
        };

        try {
            const response = await fetch(`${API_URL}/community/create$`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Community created:', result);
                // You can handle success here, like showing a success message
            } else {
                console.error('Failed to create community');
                // You can handle errors here, like showing an error message
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        < main className="flex-grow p-10 flex justify-center items-center" >
            <div className="bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-3xl">
                <h1 className="text-3xl font-bold mb-8">Create Community</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-gray-700 w-24 h-24 flex items-center justify-center">
                            <span className="text-xl text-gray-400">Upload Logo</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2" htmlFor="communityName">
                            Community Name
                        </label>
                        <input
                            type="text"
                            id="communityName"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter community name"
                            onChange={(e) => setCommunityName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <input
                            type="text"
                            id="description"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your community"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2" htmlFor="rules">
                            Community Rules and Regulations
                        </label>
                        <textarea
                            id="rules"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter community rules"
                            rows="4"
                            onChange={(e) => setRules(e.target.value)}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2" htmlFor="keyword">
                            Community Keyword
                        </label>
                        <input
                            type="text"
                            id="keyword"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter keywords"
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div className="text-center">
                        <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-lg">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </main >

    );
}

export default CreateCommunity;