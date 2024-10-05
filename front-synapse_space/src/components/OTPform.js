import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';

const OTPform = () => {
    const { loginUser } = useContext(AuthContext);
    const [otp, setOtp] = useState('');

    const handleOtpChange = (e, index) => {
        const newOtp = otp.split('');
        newOtp[index] = e.target.value;
        setOtp(newOtp.join(''));

        if (e.target.value === '') {
            const previousInput = document.getElementById(`otp-input-${index - 1}`);
            if (previousInput) {
                previousInput.focus();
            }
        } else if (index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };


    return (
        <form className="px-5" onSubmit={loginUser}>
            <div className="flex flex-col space-y-2 ">
                <h2 className="card-title justify-center mb-5">Verify it's you.</h2>
                <div className="max-w-sm mx-auto">
                    <p className="text-justify justify-center">We just sent a six-digit code to email address. Enter the code below to sign in.</p>
                </div>
                <div className="flex flex-col space-y-2">
                    <label className="label">
                        <span className="label-text">Enter OTP</span>
                    </label>
                </div>
                <input type="hidden" value={otp} name="otp" required />
                <div className="flex flex-row items-center justify-between mx-auto w-full gap-5">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div className="w-16 h-16" key={index}>
                            <input
                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full h-full flex flex-col items-center justify-center input text-center px-5 outline-none rounded-xl border border-gray-200 text-lg focus:ring-1 ring-blue-700"
                                type="number"
                                name=""
                                id={`otp-input-${index}`}
                                maxLength={1}
                                value={otp[index] || ''}
                                onChange={(e) => handleOtpChange(e, index)}
                                required
                            />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col space-y-5">
                    <div>
                        <button
                            className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-primary border-none text-white text-sm shadow-sm"
                            type="submit"
                        >
                            Verify Account
                        </button>
                    </div>

                    <div className="flex flex-row items-center text-sm font-medium space-x-1 text-gray-500">
                        <p>Didn't receive code?</p>{' '}
                        <a className="flex flex-row text-blue-600" href="http://" target="_blank" rel="noopener noreferrer">
                            Resend
                        </a>
                    </div>

                    <div className="flex flex-row justify-center text-sm">
                        <a className="flex flex-row text-secondary underline" href="/" target="_blank" rel="noopener noreferrer">
                            Go back to signin
                        </a>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default OTPform;