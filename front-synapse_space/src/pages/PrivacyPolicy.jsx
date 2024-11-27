import React from "react";
import { useNavigate } from "react-router-dom";
import {Helmet} from "react-helmet-async";

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-base-100">
            <Helmet>
                <title>Privacy Policy - Synapse Space</title>
            </Helmet>
            <div className="container max-w-4xl p-6 bg-base-200 text-base-content shadow-md rounded-lg overflow-y-auto h-[80vh]">
                <button
                    onClick={handleGoBack}
                    className="mb-4 text-sm text-primary hover:underline"
                >
                    &lt; Back
                </button>

                <h1 className="mb-4 text-2xl font-bold text-center">Privacy Policy</h1>
                <p className="text-justify">
                    Synapse Space ("we," "our," or "us") values your privacy and is committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and protect your data when you use our website, SynapseSpace.com. By accessing or using our website, you agree to the terms of this Privacy Policy.
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">1. Information We Collect</h2>
                <p className="text-justify">
                    We collect the following personal information directly from you when you use Synapse Space:
                    <ul className="pl-6 list-disc">
                        <li>Name / Username</li>
                        <li>Email Address</li>
                        <li>Password</li>
                        <li>Student ID</li>
                        <li>Registration Form</li>
                    </ul>
                    We collect this information to provide a secure, personalized experience for users.
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">2. How We Use Your Information</h2>
                <p className="text-justify">
                    We use the collected personal information for the following purposes:
                    <ul className="pl-6 list-disc">
                        <li>To create and manage your account on Synapse Space.</li>
                        <li>To provide and improve our services.</li>
                        <li>To ensure account security and prevent fraudulent activity.</li>
                    </ul>
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">3. Data Protection and Security</h2>
                <p className="text-justify">
                    We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, loss, misuse, or alteration. While we strive to use commercially acceptable means to protect your data, no method of transmission or storage is 100% secure.
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">4. Google Account Login</h2>
                <p className="text-justify">
                    Our website offers the option to log in using your Google account. If you choose this method, we may receive limited data from Google, such as your name and email address, to facilitate account creation and authentication.
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">5. Children’s Privacy</h2>
                <p className="text-justify">
                    Synapse Space is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13.
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">6. Cookies and Tracking</h2>
                <p className="text-justify">
                    Synapse Space does not use cookies, digital analytics software, or tracking technologies such as Facebook Pixel or retargeting for advertising purposes.
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">7. Ads and Payments</h2>
                <p className="text-justify">
                    Synapse Space does not display ads on the website. We do not process payments or accept purchases on the website.
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">8. Photo Gallery Access</h2>
                <p className="text-justify">
                    Synapse Space may request access to your photo gallery for uploading images as part of your profile or user-generated content.
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">9. How to Contact Us</h2>
                <p className="text-justify">
                    If you have any questions about this Privacy Policy or our data practices, you can contact us by visiting our website at SynapseSpace.com.
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">10. Changes to This Privacy Policy</h2>
                <p className="text-justify">
                    We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Continued use of Synapse Space after updates constitutes your acceptance of the revised Privacy Policy.
                </p>
                <br></br>
                <hr className="border-secondary"></hr>
                <p className="mt-6 text-justify">
                    Thank you for trusting Synapse Space. Your privacy is important to us.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
