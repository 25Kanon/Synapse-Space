import React from 'react';
import { User, Mail, Hash, BookOpen, Code, Briefcase, FileText } from 'lucide-react';
import type { User as UserType } from './types';
import { ImagePreview } from '../ImagePreview';

interface UserDetailsProps {
    user: UserType;
}

export function UserDetails({ user }: UserDetailsProps) {
    return (
        <div className="space-y-6">
            <div className="relative h-48 rounded-lg overflow-hidden rounded-lg shadow-lg bg-base-200">
                <img
                    src={user.profile_banner}
                    alt="Profile Banner"
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-6">
                    <img
                        src={user.profile_pic}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-24 h-24 rounded-full border-4 border-white object-cover"
                    />
                </div>
            </div>

            <div className="mt-16 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <User className="w-5 h-5" />
                            <div>
                                <p className="text-sm text-secondary">Full Name</p>
                                <p className="font-medium">{`${user.first_name} ${user.last_name}`}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Hash className="w-5 h-5 text-secondary" />
                            <div>
                                <p className="text-sm text-secondary">Student Number</p>
                                <p className="font-medium">{user.student_number}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-secondary" />
                            <div>
                                <p className="text-sm text-secondary">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <BookOpen className="w-5 h-5 text-secondary" />
                            <div>
                                <p className="text-sm text-secondary">Program</p>
                                <p className="font-medium">{user.program?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Code className="w-5 h-5 text-secondary" />
                            <div>
                                <p className="text-sm text-secondary">Username</p>
                                <p className="font-medium">{user.username}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Briefcase className="w-5 h-5 text-secondary" />
                            <div>
                                <p className="text-sm text-secondary">Bio</p>
                                <p className="font-medium">{user.bio}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-secondary mb-2">Interests</p>
                            <div className="flex flex-wrap gap-2">
                                {user.interests.map((interest, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                    {interest}
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <FileText className="w-5 h-5 text-secondary" />
                            <h3 className="text-lg font-medium text-accent">Registration Papers</h3>
                        </div>
                        <ImagePreview
                            imageUrl={user.registration_form}
                            alt="Registration Papers"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}