import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Star } from 'lucide-react';
import AxiosInstance from '../../utils/AxiosInstance';
import AuthContext from '../../context/AuthContext';
import ErrorAlert from '../ErrorAlert';
import Loading from '../Loading';

interface RatingFormData {
    rating: number;
    comment?: string;
    activity: number;
}

interface ActivityRatingProps {
    activityId: number;
    community: number;
    onClose: () => void;
}

export function ActivityRating({ activityId, onClose, community }: ActivityRatingProps) {
    const { handleSubmit, register } = useForm<RatingFormData>();
    const { user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state

    const onSubmit = async (data: RatingFormData) => {
        setIsLoading(true); // Start loading
        setError(null); // Reset error
        try {
            // Create FormData object
            const formData = new FormData();
            formData.append('rating', String(data.rating));
            if (data.comment) {
                formData.append('comment', data.comment);
            }
            formData.append('activity', String(activityId));
            formData.append('user', String(user.id));

            // Send FormData via Axios
            await AxiosInstance.post(
                `/api/community/${community}/activity/${activityId}/rating/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            onClose();
        } catch (error) {
            console.error(error);
            setError('Failed to submit your rating. Please try again.');
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    return (
        <div className="bg-base-200 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Rate This Activity</h3>
            {isLoading && <Loading />}
            {error && <ErrorAlert text={error} />}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        How would you rate this activity?
                    </label>
                    <div className="flex gap-4 mb-2 rating rating-md">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <input
                                key={value}
                                type="radio"
                                {...register('rating', { required: true })}
                                className="mask mask-star-2 bg-orange-400"
                                value={value}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Feedback
                    </label>
                    <textarea
                        {...register('comment')}
                        className="w-full p-2 border textarea textarea-bordered rounded-lg"
                        rows={3}
                        placeholder="Share your thoughts about the activity..."
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg btn btn-secondary"
                        disabled={isLoading} // Disable during loading
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`px-4 py-2 btn btn-primary ${isLoading ? 'btn-disabled' : ''}`}
                        disabled={isLoading} // Disable during loading
                    >
                        Submit Rating
                    </button>
                </div>
            </form>
        </div>
    );
}
