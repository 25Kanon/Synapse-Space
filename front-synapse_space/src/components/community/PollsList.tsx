import React, { useEffect, useState } from "react";
import AxiosInstance from "../../utils/AxiosInstance";
import { LeafPoll, Result } from 'react-leaf-polls';
import 'react-leaf-polls/dist/index.css';
import {format} from "date-fns";

const PollsList = ({ communityId }) => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState({});

    // Track loading and status per poll
    const [pollStatus, setPollStatus] = useState({});
    const [selectedOption, setSelectedOption] = useState(null); // Track the selected option for changing vote


    const fetchPolls = async () => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/api/community/${communityId}/polls`, { withCredentials: true });
            const transformedPolls = response.data.map((poll) => ({
                id: poll.id,
                question: poll.question,
                options: poll.options.map((option, index) => ({
                    id: index,
                    text: option.text,
                    votes: option.votes || 0
                })),
                userVote: poll.user_vote,
                created_by: poll.created_by,
                created_at: poll.created_at
            }));
            setPolls(transformedPolls);
        } catch (err) {
            console.error("Failed to fetch polls:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

        const lightTheme = {
            textColor: '#333333',
            mainColor: '#00B87B',
            leftColor: '#7CFC00',
            rightColor: '#FF5733',
            backgroundColor: '#E7E7E7',
            alignment: 'center',
        };

        const darkTheme = {
            textColor: '#CCCCCC',
            mainColor: '#32C8A0',
            leftColor: '#7CFC00',
            rightColor: '#FF5733',
            backgroundColor: '#043130',
            alignment: 'center',
        };

        setTheme(systemTheme === 'dark' ? darkTheme : lightTheme);
        fetchPolls();
    }, [communityId]);

    const handleVote = async (pollId, optionId) => {
        setPollStatus(prevStatus => ({
            ...prevStatus,
            [pollId]: { isLoading: true, message: null }
        }));

        try {
            // Send vote to the backend
            await AxiosInstance.post(`/api/community/polls/${pollId}/vote/`, { option: optionId }, { withCredentials: true });

            // Refetch polls to update the results
            await fetchPolls();

            // Update the status for the specific poll
            setPollStatus(prevStatus => ({
                ...prevStatus,
                [pollId]: { isLoading: false, message: 'Vote successfully updated!' }
            }));
        } catch (err) {
            console.error("Failed to vote:", err);
            setPollStatus(prevStatus => ({
                ...prevStatus,
                [pollId]: { isLoading: false, message: 'Failed to update vote, please try again.' }
            }));
        }
    };

    const handleChangeVote = (pollId) => {
        // Allow the user to choose a new option from the available options
        setSelectedOption(pollId);
    };

    const handleOptionSelect = (pollId, optionId) => {
        // Handle vote change when user selects a new option
        handleVote(pollId, optionId);
        setSelectedOption(null); // Close the options list after voting
    };

    const handleCancelChange = () => {
        // Cancel the vote change and reset the selected option
        setSelectedOption(null);
    };

    return (
        <div>
            {loading ? (
                <div>Loading polls...</div>
            ) : (
                <>
                    <div className="collapse collapse-arrow  join-item border-base-300 border">
                        {/* Accordion Container */}
                        <input type="checkbox" className="collapse-checkbox" id="polls-accordion" />
                        <div className="collapse-title text-lg font-medium">
                            View Polls
                        </div>
                        <div className="collapse-content">
                            {polls.map((poll) => (
                                <div key={poll.id}
                                     className="w-full my-5 border border-solid shadow-xl card card-compact p-3">
                                    <p className="text-sm font-semibold">{poll.created_by}</p>
                                    <p className="text-sm">{poll.created_at ? format(new Date(poll.created_at), "eeee, MMMM dd yyyy hh:mm:ss a") : ""}</p>
                                    <h2 className="card-title">{poll.question}</h2>
                                    <LeafPoll
                                        type="multiple"
                                        results={poll.options}
                                        onVote={(result) => handleVote(poll.id, result.id)}
                                        isVoted={poll.userVote !== null} // If the user has voted already
                                        isVotedId={poll.userVote} // The option ID the user has voted for
                                        theme={theme}
                                    />
                                    {poll.userVote !== null && (
                                        <div>
                                            <p>You have already voted.</p>
                                            {/* Show Change Vote button if a vote is already cast */}
                                            <button
                                                onClick={() => handleChangeVote(poll.id)}
                                                className="btn btn-warning"
                                                disabled={pollStatus[poll.id]?.isLoading}
                                            >
                                                {pollStatus[poll.id]?.isLoading ? "Changing..." : "Change your vote"}
                                            </button>
                                        </div>
                                    )}

                                    {/* Show options to change the vote if selectedOption is set */}
                                    {selectedOption === poll.id && (
                                        <div>
                                            <h3>Select a new option:</h3>
                                            {poll.options.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleOptionSelect(poll.id, option.id)}
                                                    className="btn btn-primary m-2"
                                                >
                                                    {option.text}
                                                </button>
                                            ))}
                                            <button className=" btn btn-outline btn-circle btn-error"
                                                    onClick={handleCancelChange}>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}

                                    {pollStatus[poll.id]?.message && (
                                        <div
                                            className={`mt-3 ${pollStatus[poll.id]?.message.includes('updated') ? 'text-green-500' : 'text-red-500'}`}>
                                            {pollStatus[poll.id]?.message}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PollsList;
