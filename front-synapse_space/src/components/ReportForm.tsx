import React, { useState } from 'react';
import AxiosInstance from '../utils/AxiosInstance'

const ReportForm = ({type, object, community, comment_post_id}) => {
    const [reason, setReason] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const contentTypeMapping = {
                post: 'post',
                comment: 'comment',
                user: 'user',
            };

            const reportData = {
                type: type,
                content,
                reason,
                content_type: contentTypeMapping[type],
                object_id: object,
                community: community,
                comment_post_id: comment_post_id
            };

            await AxiosInstance.post(`/api/${community}/create-report/`, reportData, {withCredentials:true});
            setSuccess(true);
            setError('');
        } catch (err) {
            setError('Failed to submit the report. Please try again.');
            setSuccess(false);
        }
    };

    return (
        <div className="w-96  mx-auto bg-accent p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-accent-content mb-4">Submit a Report</h2>
            {success && (
                <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
                    Report submitted successfully!
                </div>
            )}
            {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-accent-content font-medium">Content (Details)</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="textarea bg-accent text-accent-content w-full border border-secondary rounded p-2 mt-1 h-24"
                        placeholder="Describe the issue"
                    />
                </div>

                <div>
                    <label className="block text-accent-content font-medium">Reason</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="textarea bg-accent text-accent-content w-full border border-secondary rounded p-2 mt-1 h-24"

                        placeholder="Reason for reporting"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full btn btn-primary font-semibold py-2 rounded transition-colors"
                >
                    Submit Report
                </button>
            </form>
        </div>
    );
};

export default ReportForm;
