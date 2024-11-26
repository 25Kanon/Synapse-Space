import React, { useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { ModSettings } from '../types';

type ModSettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    settings: ModSettings;
    onSave: (settings: ModSettings) => void;
};

export function ModSettingsModal({ isOpen, onClose, settings, onSave }: ModSettingsModalProps) {
    // Transform snake_case settings from API to camelCase for local use
    const transformSettingsToCamelCase = (settings) => ({
        autoModEnabled: settings.auto_mod_enabled,
        reportThreshold: settings.report_threshold,
        wordFilterEnabled: settings.word_filter_enabled,
        bannedWords: settings.banned_words,
        newUserRestriction: settings.new_user_restriction,
        notificationsEnabled: settings.notifications_enabled,
        autoLockThreshold: settings.auto_lock_threshold,
        community: settings.community, // Add community ID to local settings
    });

    // Transform camelCase settings back to snake_case for API requests
    const transformSettingsToSnakeCase = (settings) => ({
        auto_mod_enabled: settings.autoModEnabled,
        report_threshold: settings.reportThreshold,
        word_filter_enabled: settings.wordFilterEnabled,
        banned_words: settings.bannedWords,
        new_user_restriction: settings.newUserRestriction,
        notifications_enabled: settings.notificationsEnabled,
        auto_lock_threshold: settings.autoLockThreshold,
        community: settings.community, // Keep the community ID
    });

    const [localSettings, setLocalSettings] = React.useState<ModSettings>(transformSettingsToCamelCase(settings));
    const [bannedWordsText, setBannedWordsText] = React.useState(settings?.banned_words?.join(', ') ?? '');

    // Update local state when settings prop changes
    useEffect(() => {
        if (settings) {
            setLocalSettings(transformSettingsToCamelCase(settings));
            setBannedWordsText(settings?.banned_words?.join(', ') ?? '');
        }
    }, [settings]);

    const handleSave = () => {
        const updatedSettings = {
            ...localSettings,
            bannedWords: bannedWordsText.split(',').map(word => word.trim()).filter(Boolean)
        };
        onSave(transformSettingsToSnakeCase(updatedSettings));
        onClose();
    };

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(transformSettingsToSnakeCase(localSettings)) ||
        bannedWordsText !== settings?.banned_words?.join(', ');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-base-300 rounded-lg w-full max-w-2xl mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Moderation Settings</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* AutoMod Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">AutoMod Configuration</h3>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                                <span>Enable AutoMod</span>
                                <input
                                    type="checkbox"
                                    checked={localSettings.autoModEnabled}
                                    onChange={(e) => setLocalSettings(prev => ({
                                        ...prev,
                                        autoModEnabled: e.target.checked
                                    }))}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </label>
                            <div className="flex items-center space-x-2">
                                <span>Report Threshold:</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={localSettings.reportThreshold}
                                    onChange={(e) => setLocalSettings(prev => ({
                                        ...prev,
                                        reportThreshold: parseInt(e.target.value) || prev.reportThreshold
                                    }))}
                                    className="input input-bordered w-20 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Word Filter */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Word Filter</h3>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={localSettings.wordFilterEnabled}
                                    onChange={(e) => setLocalSettings(prev => ({
                                        ...prev,
                                        wordFilterEnabled: e.target.checked
                                    }))}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Enable Word Filter</span>
                            </div>
                            <textarea
                                value={bannedWordsText}
                                onChange={(e) => setBannedWordsText(e.target.value)}
                                placeholder="Enter banned words separated by commas"
                                className="textarea textarea-bordered w-full h-24 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* New User Restrictions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">New User Restrictions</h3>
                        <div className="flex items-center space-x-2">
                            <span>Account age required (days):</span>
                            <input
                                type="number"
                                min="0"
                                max="365"
                                value={localSettings.newUserRestriction}
                                onChange={(e) => setLocalSettings(prev => ({
                                    ...prev,
                                    newUserRestriction: parseInt(e.target.value) || prev.newUserRestriction
                                }))}
                                className="input input-bordered w-20 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Notifications</h3>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={localSettings.notificationsEnabled}
                                onChange={(e) => setLocalSettings(prev => ({
                                    ...prev,
                                    notificationsEnabled: e.target.checked
                                }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Enable Mod Notifications</span>
                        </div>
                    </div>

                    {/* Auto-Lock */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Auto-Lock Settings</h3>
                        <div className="flex items-center space-x-2">
                            <span>Auto-lock threads after reports:</span>
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={localSettings.autoLockThreshold}
                                onChange={(e) => setLocalSettings(prev => ({
                                    ...prev,
                                    autoLockThreshold: parseInt(e.target.value) || prev.autoLockThreshold
                                }))}
                                className="input input-bordered rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 p-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 btn btn-error rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`flex items-center space-x-2 px-4 py-2 btn btn-primary rounded-md ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Save className="w-4 h-4" />
                        <span>Save Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
