import React, {useContext, useEffect, useRef, useState} from "react";
import { useForm } from "react-hook-form";
import { Calendar, MapPin, Users } from "lucide-react";
import BannerCropper from "./BannerCropper";
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../ErrorAlert";
import SuccessAlert from "../SuccessAlert";
import Loading from "../Loading";
import Datepicker from "react-tailwindcss-datepicker";
import AuthContext from "../../context/AuthContext";

interface FormData {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    community: number;
    maxParticipants: number;
    image: string;
}

interface CreateActivityProps {
    onActivityCreated?: () => void;
    community: number;
}

export function CreateActivity({
                                   onActivityCreated,
                                   community,
                               }: CreateActivityProps) {
    const [activityBannerBlob, setActivityBannerBlob] = useState<Blob | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const cropperDialogRef = useRef<HTMLDialogElement>(null);
    const { user } = useContext(AuthContext);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>();

    const [date, setDate] = useState({
        startDate: null,
        endDate: null,
    });

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            setImageSrc(URL.createObjectURL(file));
            cropperDialogRef.current?.showModal();
        }
    };

    const handleBannerCrop = async (croppedImg: string) => {
        try {
            const response = await fetch(croppedImg);
            setImageSrc(croppedImg);
            const blob = await response.blob();
            setActivityBannerBlob(blob);
            cropperDialogRef.current?.close();
        } catch (error) {
            console.error("Error converting cropped image URL to Blob:", error);
            setError("Failed to process the cropped image. Please try again.");
        }
    };

    const uploadImage = async (imageBlob: Blob): Promise<string | null> => {
        const formData = new FormData();
        formData.append("img", imageBlob, `banner-${Date.now()}.png`);
        try {
            const response = await AxiosInstance.post("/api/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.url;
        } catch (error) {
            console.error("Error uploading image:", error);
            setError("Failed to upload image. Please try again.");
            return null;
        }
    };

    const onSubmit = async (data: FormData) => {
        setError(null);
        setLoading(true);
        let bannerUrl: string | null = null;

        if (activityBannerBlob) {
            bannerUrl = await uploadImage(activityBannerBlob);
            if (!bannerUrl) {
                setLoading(false);
                return;
            }
        }

        const currentDate = new Date();
        const startDate = new Date(date.startDate || "");
        const endDate = new Date(date.endDate || "");



        const payload = {
            title: data.title,
            description: data.description,
            startDate: startDate.toISOString(), // Ensuring ISO format for API
            endDate: endDate.toISOString(),
            location: data.location,
            community: community,
            max_participants: data.maxParticipants,
            image: bannerUrl,
            organizer: user.id
        };

        try {
           const response = await AxiosInstance.post(`api/community/${community}/create/activity/`, payload,
                {withCredentials: true,
                    headers: {"Content-Type": "application/json"}
                });
            setSuccess("Activity created successfully!");

            console.log(response.data);
            reset();
            setActivityBannerBlob(null);
            setImageSrc(null);
            setDate({ startDate: null, endDate: null });
            onActivityCreated?.();
        } catch (error) {
            console.error("Error creating activity:", error);
            setError("Failed to create activity. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (loading) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [loading]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-base-100 rounded-lg p-6 shadow-md">
            {error && <ErrorAlert text={error} />}
            {success && <SuccessAlert text={success} />}
            <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
                <Loading loadingText="Creating your activity, please wait..." />
            </dialog>
            <dialog ref={cropperDialogRef} className="modal modal-bottom sm:modal-middle">
                {imageSrc && <BannerCropper imageSrc={imageSrc} onCropComplete={handleBannerCrop} />}
            </dialog>
            <h2 className="text-2xl font-bold mb-6">Create Community Activity</h2>
            <div className="space-y-4">
                <div className="rounded-t-lg h-32 overflow-hidden">
                    <div className="bg-base-200 text-neutral-content rounded h-32">
                        {imageSrc && <img className="object-cover h-full w-full" src={imageSrc} alt="Activity Banner" />}
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
                        className="w-full max-w-xs file-input file-input input-bordered"
                        accept="image/png, image/jpeg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        {...register("title", { required: "Title is required" })}
                        className="w-full p-2 border input input-bordered rounded-lg"
                        placeholder="Activity title"
                    />
                    {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        {...register("description", { required: "Description is required" })}
                        className="w-full p-2 border textarea textarea-bordered rounded-lg"
                        rows={4}
                        placeholder="Describe the activity..."
                    />
                    {errors.description && (
                        <span className="text-sm text-red-500">{errors.description.message}</span>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            <Calendar size={16} className="inline mr-1" />
                            Date
                        </label>
                        <Datepicker
                            value={date}
                            onChange={(newValue) => setDate(newValue)}
                            separator="to"
                            asSingle={false}
                            useRange={true}
                            minDate={new Date()} // Prevent past dates
                            inputClassName="w-full p-2 border input input-bordered rounded-lg"
                            containerClassName="relative w-full"
                            required={true}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            <MapPin size={16} className="inline mr-1" />
                            Location
                        </label>
                        <input
                            {...register("location", { required: "Location is required" })}
                            className="w-full p-2 border input input-bordered rounded-lg"
                            placeholder="Activity location"
                        />
                        {errors.location && (
                            <span className="text-sm text-red-500">{errors.location.message}</span>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                        <Users size={16} className="inline mr-1" />
                        Max Participants
                    </label>
                    <input
                        type="number"
                        {...register("maxParticipants", {
                            required: "Max participants is required",
                            min: { value: 1, message: "Minimum 1 participant required" },
                        })}
                        className="w-full p-2 border input input-bordered rounded-lg"
                        placeholder="Maximum participants"
                    />
                    {errors.maxParticipants && (
                        <span className="text-sm text-red-500">{errors.maxParticipants.message}</span>
                    )}
                </div>
                <button type="submit" className="w-full py-2 px-4 btn btn-primary">
                    Create Activity
                </button>
            </div>
        </form>
    );
}
