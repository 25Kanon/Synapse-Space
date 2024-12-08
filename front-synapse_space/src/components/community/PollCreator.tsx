import React, { useState } from "react";
import AxiosInstance from "../../utils/AxiosInstance";
import { useNavigate } from "react-router-dom";
import {Plus} from "lucide-react";
import ErrorAlert from "../../components/ErrorAlert";
import PropTypes from "prop-types";


const PollCreator = ({ communityId, onPollCreated }) => {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.post(
                "/api/community/polls/",
                {
                    question,
                    options,
                    community: communityId,
                },
                { withCredentials: true }
            );
            setLoading(false);
            onPollCreated();
        } catch (err) {
            setLoading(false);
            console.error("Failed to create poll:", err);
            setError(err.response?.data?.detail || "An error occurred while creating the poll.");
        }
    };

    return (
        <form onSubmit={handleCreatePoll} className="form">
            {error && <ErrorAlert text={error} />}
            <div className="form-control form-group">
                <label>Poll Question</label>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="input input-bordered w-full input-text"
                    placeholder="What's your question?"
                    required
                />
            </div>
            <div className="form-control form-group">
                <label>Options</label>
                {options.map((option, index) => (
                    <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="input input-bordered w-full input-text m-3"
                        placeholder={`Option ${index + 1}`}
                        required
                    />
                ))}
                <button
                    className="btn btn-square btn-secondary mx-3"
                    onClick={() => setOptions([...options, ""])}
                >
                    <Plus />
                </button>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full m-3">
                {loading ? "Creating Poll..." : "Create Poll"}
            </button>
        </form>
    );
};

PollCreator.propTypes = {
    communityId: PropTypes.number.isRequired,
    onPollCreated: PropTypes.func.isRequired,
};

export default PollCreator;