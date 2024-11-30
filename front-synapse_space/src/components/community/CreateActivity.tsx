import React, {useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Calendar, MapPin, Users} from 'lucide-react';
import BannerCropper from './BannerCropper';
import AxiosInstance from '../../utils/AxiosInstance';
import ErrorAlert from '../ErrorAlert';
import SuccessAlert from '../SuccessAlert';
import Loading from "../Loading";

interface FormData {
    title: string;
    description: string;
    date: string;
    location: string;
    maxParticipants: number;
    image: string;
}

interface CreateActivityProps {
    onActivityCreated?: () => void
}

export function CreateActivity({onActivityCreated}: CreateActivityProps) {
    const [activityBannerBlob, setActivityBannerBlob] = useState<Blob | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<FormData>();

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImageSrc(reader.result as string);
            reader.readAsDataURL(file);
            dialogRef.current?.showModal();
        }
    };

    const handleBannerCrop = async (croppedImg: string) => {
        try {
            const response = await fetch(croppedImg);
            const blob = await response.blob();
            setActivityBannerBlob(blob);
        } catch (error) {
            console.error('Error converting cropped image URL to Blob:', error);
        }
    };

    const uploadImage = async (imageBlob: Blob): Promise<string | null> => {
        const formData = new FormData();
        formData.append('img', imageBlob, `banner-${Date.now()}.png`);
        try {
            const response = await AxiosInstance.post('/api/upload/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            return response.data.url; // Assuming the server returns the image URL
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image. Please try again.');
            return null;
        }
    };

    const onSubmit = async (data: FormData) => {
        setError(null);
        setLoading(true);
        let bannerUrl: string | null = null;

        if (activityBannerBlob) {
            bannerUrl = await uploadImage(activityBannerBlob);
            if (!bannerUrl) return; // Stop submission if upload fails
        }

        const payload = {...data, image: bannerUrl};
        try {
            // const response = await AxiosInstance.post('/api/activities/', payload);
            setSuccess('Activity created successfully!');
            reset();
            setActivityBannerBlob(null);
            setImageSrc(null);
            onActivityCreated();
        } catch (error) {
            console.error('Error creating activity:', error);
            setError('Failed to create activity. Please try again.');
        } finally {
            setLoading(false);
            document.getElementById('act-loading-modal').close();
            console.log(payload);
        }
    };

    useEffect(() => {
        if (loading) {
            document.getElementById('act-loading-modal').showModal();
        }
    }, [loading]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-base-100 rounded-lg p-6 shadow-md">
            {error && <ErrorAlert text={error}/>}
            {success && <SuccessAlert text={success}/>}
            <dialog
                ref={dialogRef}
                id="act-loading-modal"
                className="modal modal-bottom sm:modal-middle"
                onClose={(e) => e.preventDefault()}
                onCancel={(e) => e.preventDefault()}
            >
                <form method="dialog" className="modal-box" onSubmit={(e) => e.preventDefault()}>
                    <Loading loadingText="Creating your actvity, please wait..."/>
                </form>
            </dialog>
            <h2 className="text-2xl font-bold mb-6">Create Community Activity</h2>

            <div className="space-y-4">
                <div className="rounded-t-lg h-32 overflow-hidden">
                    <div className="bg-base-200 text-neutral-content rounded h-32">
                        {imageSrc && (
                            <img
                                className="object-cover object-top h-full w-full"
                                src={imageSrc}
                                alt="Activity Banner"
                            />
                        )}
                    </div>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-bold" htmlFor="actBanner">
                        Community Banner
                    </label>
                    <input
                        type="file"
                        id="actBanner"
                        onChange={handleBannerChange}
                        className="w-full max-w-xs file-input file-input-bordered file-input-accent"
                        accept="image/png, image/jpeg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium  mb-1">Title</label>
                    <input
                        {...register('title', {required: 'Title is required'})}
                        className="w-full p-2 border input-bordered rounded-lg input"
                        placeholder="Activity title" required
                    />
                    {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium  mb-1">Description</label>
                    <textarea
                        {...register('description', {required: 'Description is required'})}
                        className="w-full p-2 border input-bordered rounded-lg textarea"
                        rows={4}
                        placeholder="Describe the activity..." required
                    />
                    {errors.description && (
                        <span className="text-sm">{errors.description.message}</span>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium  mb-1">
                            <Calendar size={16} className="inline mr-1"/>
                            Date
                        </label>
                        <input
                            type="datetime-local"
                            {...register('date', {required: 'Date is required'})}
                            className="w-full p-2 border input-bordered rounded-lg input" required
                        />
                        {errors.date && <span className="text-sm text-red-500">{errors.date.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium  mb-1">
                            <MapPin size={16} className="inline mr-1"/>
                            Location
                        </label>
                        <input
                            {...register('location', {required: 'Location is required'})}
                            className="w-full p-2 border input-bordered rounded-lg input"
                            placeholder="Activity location" required
                        />
                        {errors.location && (
                            <span className="text-sm text-red-500">{errors.location.message}</span>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium  mb-1">
                        <Users size={16} className="inline mr-1"/>
                        Max Participants
                    </label>
                    <input
                        type="number"
                        {...register('maxParticipants', {
                            required: 'Max participants is required',
                            min: {value: 1, message: 'Minimum 1 participant required'},
                        })}
                        className="w-full p-2 border input-bordered rounded-lg input"
                        placeholder="Maximum participants" required
                        defaultValue={1}
                    />
                    {errors.maxParticipants && (
                        <span className="text-sm text-red-500">{errors.maxParticipants.message}</span>
                    )}
                </div>
                <button type="submit" className="w-full py-2 px-4 btn btn-primary">
                    Create Activity
                </button>

                <dialog id="activity-banner-cropper" className="modal modal-bottom sm:modal-middle" ref={dialogRef}>
                    {imageSrc && (
                        <BannerCropper imageSrc={imageSrc} onCropComplete={handleBannerCrop}/>
                    )}
                </dialog>
            </div>
        </form>
    );
}
