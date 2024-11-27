import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import AxiosInstance from '../../utils/AxiosInstance';
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from '../../components/SuccessAlert';
import { CheckCircle, Save, XCircle } from 'lucide-react';
import {Helmet} from "react-helmet-async";

interface SettingsInterface {
    max_Login_Attempts: number;
    lockout_Duration: number;
    otp_Rate_Limit: number;
    otp_Interval: number;
}

function Settings() {
    const [settings, setSettings] = useState<SettingsInterface>({
        max_Login_Attempts: 0,
        lockout_Duration: 0,
        otp_Rate_Limit: 0,
        otp_Interval: 0,
    });

    const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});
    const [successFields, setSuccessFields] = useState<Record<string, boolean>>({});
    const [errorFields, setErrorFields] = useState<Record<string, string | null>>({});

    const LoadSettings = async () => {
        try {
            const response = await AxiosInstance.get('/api/admin/settings', { withCredentials: true });

            const settingsData: Partial<SettingsInterface> = {};
            response.data.forEach((setting: { key: string; value: string }) => {
                switch (setting.key) {
                    case 'MAX_LOGIN_ATTEMPTS':
                        settingsData.max_Login_Attempts = Number(setting.value);
                        break;
                    case 'LOCKOUT_DURATION':
                        settingsData.lockout_Duration = Number(setting.value);
                        break;
                    case 'OTP_RATE_LIMIT':
                        settingsData.otp_Rate_Limit = Number(setting.value);
                        break;
                    case 'OTP_INTERVAL':
                        settingsData.otp_Interval = Number(setting.value);
                        break;
                    default:
                        console.warn(`Unknown setting key: ${setting.key}`);
                }
            });

            setSettings(settingsData as SettingsInterface);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const handleSave = async (key: keyof SettingsInterface) => {
        setLoadingFields((prev) => ({ ...prev, [key]: true }));
        setErrorFields((prev) => ({ ...prev, [key]: null }));
        setSuccessFields((prev) => ({ ...prev, [key]: false }));

        try {
            await AxiosInstance.patch('/api/admin/update/settings/', {
                key: key.toUpperCase(),
                value: settings[key],
            }, {withCredentials: true});

            setSuccessFields((prev) => ({ ...prev, [key]: true }));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            setErrorFields((prev) => ({ ...prev, [key]: 'Failed to save. Please try again.' }));
        } finally {
            setLoadingFields((prev) => ({ ...prev, [key]: false }));
        }
    };

    const handleChange = (key: keyof SettingsInterface) => (value: string) => {
        setSettings((prev) => ({ ...prev, [key]: Number(value) }));
    };

    useEffect(() => {
        LoadSettings();
    }, []);

    return (
        <div className="flex min-h-screen bg-base-200">
            <Helmet>
                <title> Settings - Synapse Space</title>
            </Helmet>
            <Sidebar />
            <div className="flex-1">
                <Header />
                <main>
                    <div className="mx-auto m-3">
                        <h1 className="text-3xl font-bold">Authentication Settings</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-3">
                            {Object.entries(settings).map(([key, value]) => (
                                <div key={key} className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium text-secondary">
                                        {key.replace(/([A-Z])/g, ' $1').split('_').join(' ').toUpperCase()}
                                    </label>
                                    <input
                                        type="number"
                                        value={value}
                                        onChange={(e) => handleChange(key as keyof SettingsInterface)(e.target.value)}
                                        className="input w-full py-2.5 border border-gray-300 rounded-lg"
                                    />
                                    <button
                                        className={`btn btn-primary mt-2 ${
                                            loadingFields[key] ? 'loading' : ''
                                        }`}
                                        onClick={() => handleSave(key as keyof SettingsInterface)}
                                        disabled={loadingFields[key]}
                                    >
                                        {loadingFields[key] ? 'Saving...' : 'Save'}
                                    </button>

                                    {/* Success and Error Messages */}
                                    {successFields[key] && (
                                        <p className="text-sm text-green-600">
                                            <CheckCircle className="inline w-4 h-4 mr-1" />
                                            Saved successfully!
                                        </p>
                                    )}
                                    {errorFields[key] && (
                                        <p className="text-sm text-red-600">
                                            <XCircle className="inline w-4 h-4 mr-1" />
                                            {errorFields[key]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Settings;
