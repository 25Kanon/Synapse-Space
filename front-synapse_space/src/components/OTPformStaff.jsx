import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import AxiosInstance from '../utils/AxiosInstance';
import ErrorAlert from "./ErrorAlert";

const OTPformStaff = () => {
    const { loginStaff, usernameOrEmail, error } = useContext(AuthContext);
    const [otp, setOtp] = useState('');
    const [resendMessage, setResendMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Start the resend timer
    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

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

    const resendOTP = async (usernameOrEmail) => {
        try {
            const response = await AxiosInstance.post('/api/auth/resend-otp/', {
                username_or_email: usernameOrEmail,
            });
            return response.data.message;
        } catch (error) {
            console.error('Error resending OTP:', error.response?.data || error.message);
            throw error.response?.data?.error || 'Failed to resend OTP.';
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return; // Prevent resend if timer is still active
        setLoading(true);
        setResendMessage(null);
        try {
            const message = await resendOTP(usernameOrEmail);
            setResendMessage(message);
            setResendTimer(60); // Start 1-minute timer
        } catch (error) {
            setResendMessage(String(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-2">
            {error && <ErrorAlert text={error} classExtensions="max-w-lg" />}
            <h2 className="card-title justify-center mb-5">Verify it's you.</h2>
            <div className="max-w-sm mx-auto">
                <p className="text-justify justify-center">
                    We just sent a six-digit code to your email address. Enter the code below to sign in.
                </p>
            </div>
            <div className="flex flex-col space-y-2">
                <label className="label">
                    <span className="label-text">Enter OTP</span>
                </label>
            </div>
            <form className="px-5" onSubmit={loginStaff}>
                <input type="hidden" value={otp} name="otp" required />
                <div className="flex flex-row items-center justify-between mx-auto w-full gap-5">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div className="w-16 h-16" key={index}>
                            <input
                                className={`appearance-textfield
                                [&::-webkit-outer-spin-button]:appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                                w-full h-full flex flex-col items-center justify-center
                                text-center px-5 rounded-xl border
                                light:border-gray-400 dark:border-gray-700
                                text-lg focus:ring-1 ring-blue-700 outline-none`}
                                type="number"
                                id={`otp-input-${index}`}
                                maxLength={1}
                                value={otp[index] || ''}
                                onChange={(e) => handleOtpChange(e, index)}
                                required
                            />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col space-y-5 mt-5">
                    <button
                        className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-primary border-none text-white text-sm shadow-sm"
                        type="submit"
                    >
                        Verify Account
                    </button>
                </div>
            </form>
            <div className="flex flex-row items-center text-sm font-medium space-x-1 text-gray-500">
                {resendMessage && <p>{resendMessage}</p>}
                <p>Didn't receive code?</p>
                <button
                    className={`flex flex-row text-blue-600 ${loading || resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleResendOTP}
                    disabled={loading || resendTimer > 0}
                >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
                </button>
            </div>
            <div className="flex flex-row justify-center text-sm">
                <a className="flex flex-row text-secondary underline" href="/" target="_blank" rel="noopener noreferrer">
                    Go back to signin
                </a>
            </div>
        </div>
    );
};

export default OTPformStaff;
