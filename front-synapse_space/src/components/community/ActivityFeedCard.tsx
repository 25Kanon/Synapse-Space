import React, { useContext, useEffect, useState } from "react";
import { Calendar, Frown, Heart, MapPin, Meh, Smile, Users } from "lucide-react";
import { format } from "date-fns";
import { CommunityActivity, Participant, ActivityRating as Rating } from "./types";
import AuthContext from "../../context/AuthContext";
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../ErrorAlert";
import Loading from "../Loading";
import { useMemberships } from "../../context/MembershipContext";
import { CollapsibleText } from "./CollapsibleText";
import { ActivityRating } from "./ActivityRating";

interface ActivityFeedCardProps {
    activity: CommunityActivity;
}

function EmotionIcon({ rating }: { rating: number }) {
    if (rating >= 4.5) return <Heart className="text-pink-500" />;
    if (rating >= 3.5) return <Smile className="text-green-500" />;
    if (rating >= 2.5) return <Meh className="text-yellow-500" />;
    return <Frown className="text-red-500" />;
}

export function ActivityFeedCard({ activity }: ActivityFeedCardProps) {
    const { user } = useContext(AuthContext);
    const [showRating, setShowRating] = useState(false);
    const [error, setError] = useState("");
    const [hasJoined, setHasJoined] = useState(false);
    const [isFull, setIsFull] = useState(false);
    const [rating, setRating] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(false);
    const canRate = activity?.status === "Completed" && hasJoined;
    const [hasRated, setHasRated] = useState(false);
    const { memberships } = useMemberships();
    const [membership, setMembership] = useState({});
    const [participants, setParticipants] = useState<Participant[]>([]);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("");
    };

    useEffect(() => {
        if (memberships) {
            setMembership(memberships.find((membership) => membership.community === activity.community));
        }
    }, [memberships, activity.community]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "Invalid date";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid date" : format(date, "PPP p");
    };

    const joinActivity = async () => {
        setError(null);
        setLoading(true);
        try {
            await AxiosInstance.post(
                `api/community/${activity.community}/activity/${activity.id}/`,
                { activity_id: activity.id },
                { withCredentials: true }
            );
            setHasJoined(true);
        } catch (error: any) {
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const averageRating = rating.reduce((acc, curr) => acc + curr.rating, 0) / rating.length || 0;

    const getParticipants = async () => {
        try {
            const response = await AxiosInstance.get(
                `api/community/${activity.community}/activity/${activity.id}/`,
                { withCredentials: true }
            );
            setParticipants(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || "Error fetching participants.");
        }
    };

    const getRatings = async () => {
        try {
            const response = await AxiosInstance.get(
                `/api/community/${activity.community}/activity/${activity.id}/rating/`,
                { withCredentials: true }
            );
            setRating(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || "Error fetching ratings.");
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([getParticipants(), getRatings()]);
            } catch (error: any) {
                setError(error.response?.data?.message || "An error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [activity.id, showRating]);

    useEffect(() => {
        if (user && participants.some((participant) => participant.user === user.id)) {
            setHasJoined(true);
        }

        if (user && rating.some((rate) => rate.user === user.id)) {
            setHasRated(true);
        }

        if (participants.length >= activity.max_participants) {
            setIsFull(true);
        }
    }, [participants, showRating]);

    return (
        <div className="border bordered-solid rounded-lg shadow-md p-4 mb-6">
            {loading && <Loading />}
            {error && <ErrorAlert text={error} />}
            {/* Organizer Information */}
            <div className="flex items-center gap-2 mb-4">
                {activity?.organizer_pic ? (
                    <img
                        src={activity?.organizer_pic}
                        alt={activity?.organizer_name}
                        className="w-10 h-10 rounded-full"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs">
                        {getInitials(activity?.organizer_name)}
                    </div>
                )}
                <div>
                    <p className="font-semibold"> {activity?.organizer_name}</p>
                    <p className="text-sm text-secondary">Created at {formatDate(activity.created_at)}</p>
                </div>
            </div>

            {/* Activity Image */}
            {activity.image ? (
                <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                />
            ) : (
                <div className="w-full h-48 bg-secondary rounded-lg mb-4 flex items-center justify-center ">
                    No Image Available
                </div>
            )}

            {/* Activity Details */}
            <div className="space-y-2">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {activity.status}
                </span>
                <h3 className="text-xl font-bold">{activity.title}</h3>
                <CollapsibleText text={activity.description} maxLength={150} />

                <div className="space-y-1 text-sm text-secondary">
                    <div className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                    </div>
                    <div className="flex items-center">
                        <MapPin size={16} className="mr-2" />
                        {activity.location}
                    </div>
                    <div className="flex items-center">
                        <Users size={16} className="mr-2" />
                        Participants: {participants.length}/{activity.max_participants}
                    </div>

                    {rating.length > 0 && (
                        <div className="flex items-center gap-2">
                            <EmotionIcon rating={averageRating} />
                            <span>{averageRating.toFixed(1)} ({rating.length} ratings)</span>
                        </div>
                    )}

                    <div className="flex -space-x-2 pt-2">
                        {participants.slice(0, 3).map((participant) =>
                            participant.user_pic ? (
                                <img
                                    key={participant.id}
                                    src={participant?.user_pic}
                                    alt={participant.user_name}
                                    className="w-8 h-8 rounded-full border-2 border-white"
                                />
                            ) : (
                                <div
                                    key={participant.id}
                                    className="w-8 h-8 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-xs font-medium"
                                >
                                    {getInitials(participant.user_name)}
                                </div>
                            )
                        )}
                        {participants.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium">
                                +{participants.length - 3}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
                {membership && (
                    <div className="flex gap-2">
                        {canRate && (
                            <button
                                onClick={() => setShowRating(true)}
                                className={`px-4 py-2 btn ${hasRated ? "btn-warning" : "btn-primary"}`}
                            >
                                {hasRated ? "Update Rating" : "Rate Activity"}
                            </button>
                        )}
                        {!hasJoined && !isFull && activity.status === "Upcoming" && (
                            <button className="px-4 py-2 btn btn-primary" onClick={joinActivity}>
                                Join Activity
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            {showRating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <ActivityRating
                        activityId={activity.id}
                        onClose={() => setShowRating(false)}
                        community={activity.community}
                    />
                </div>
            )}
        </div>
    );
}
