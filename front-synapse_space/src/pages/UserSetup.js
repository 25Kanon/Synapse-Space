import React, {useState} from "react"
import {User, Briefcase, Image} from "lucide-react"

const interestOptions = ["Sports", "Music", "Art", "Technology", "Science", "Literature", "Travel", "Cooking", "Photography", "Gaming"]

function UserSetup() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        username: "", studentNumber: "", program: "", profilePicture: null, interests: []
    })

    const handleInputChange = e => {
        const {name, value} = e.target
        setFormData(prev => ({...prev, [name]: value}))
    }

    const handleFileChange = e => {
        if (e.target.files) {
            setFormData(prev => ({...prev, profilePicture: e.target.files[0]}))
        }
    }

    const handleInterestChange = interest => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest) ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest]
        }))
    }

    const handleSubmit = e => {
        e.preventDefault()
        console.log("Form submitted:", formData)
        // Here you would typically send the data to a server
    }

    return (<div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
            <div className="bg-base-100 shadow-xl flex flex-col rounded-lg p-6 w-full max-w-xl">
                <h2 className="text-lg font-bold mb-4 text-center">
                    Setup your Account
                </h2>
                <h2 className="text-sm font-bold mb-4 text-center">
                    {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
                </h2>
                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <div className=" flex flex-col w-full max-w-xl h-100">
                            <div className="flex flex-row justify-center h-100 gap-5">
                                <div className="w-100 mx-3">
                                    <div className="form-control">
                                        <div className="form-control mt-4">
                                            <label className="label">
                                                <span className="label-text">Profile Picture</span>
                                            </label>
                                            <div className="input-group">
                    <span>
                      <Image size={18}/>
                    </span>
                                                <input
                                                    type="file"
                                                    name="profilePicture"
                                                    onChange={handleFileChange}
                                                    className="file-input file-input-bordered w-full"
                                                    accept="image/*"
                                                />
                                            </div>
                                        </div>
                                        <label className="label">
                                            <span className="label-text">Username</span>
                                        </label>
                                        <div className="input-group">
                  <span>
                    <User size={18}/>
                  </span>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                placeholder="Enter username"
                                                className="input input-bordered w-full"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-control mt-4">
                                        <label className="label">
                                            <span className="label-text">Student Number</span>
                                        </label>
                                        <div className="input-group">
                  <span>
                    <Briefcase size={18}/>
                  </span>
                                            <input
                                                type="text"
                                                name="studentNumber"
                                                value={formData.studentNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter student number"
                                                className="input input-bordered w-full"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-control mt-4">
                                        <label className="label">
                                            <span className="label-text">Program</span>
                                        </label>
                                        <select
                                            name="program"
                                            value={formData.program}
                                            onChange={handleInputChange}
                                            className="select select-bordered w-full"
                                            required
                                        >
                                            <option value="">Select program</option>
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Engineering">Engineering</option>
                                            <option value="Business">Business</option>
                                            <option value="Arts">Arts</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="w-100 flex justify-center items-center mx-3">
                                    <div className="form-control">
                                        <div className="form-control mt-4">
                                            <label className="label">
                                                <span className="label-text">Profile Picture</span>
                                            </label>
                                            <div className="input-group">
        <span>
          <Image size={18}/>
        </span>
                                                <input
                                                    type="file"
                                                    name="profilePicture"
                                                    onChange={handleFileChange}
                                                    className="file-input file-input-bordered w-full"
                                                    accept="image/*"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="btn btn-primary w-full mt-6"
                            >
                                Next
                            </button>
                        </div>

                    ) : (<>
                        <div className="grid grid-cols-2 gap-4">
                            {interestOptions.map(interest => (<label
                                key={interest}
                                className="label cursor-pointer justify-start gap-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.interests.includes(interest)}
                                    onChange={() => handleInterestChange(interest)}
                                    className="btn"
                                    aria-label={interest}
                                />
                                <span className="label-text hidden">{interest}</span>
                            </label>))}
                        </div>
                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="btn btn-outline"
                            >
                                Back
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Submit
                            </button>
                        </div>
                    </>)}
                </form>

            </div>
    </div>)
}

export default UserSetup
