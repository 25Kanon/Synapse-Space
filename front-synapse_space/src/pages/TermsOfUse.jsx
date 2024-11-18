import React from "react";
import { useNavigate } from "react-router-dom";

const TermsOfUse = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // This will go back to the previous page
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="container max-w-4xl p-6 bg-white shadow-md rounded-lg overflow-y-auto h-[80vh]">
                <button
                    onClick={handleGoBack}
                    className="mb-4 text-sm text-blue-500 hover:underline"
                >
                    &lt; Back
                </button>
                <h1 className="mb-4 text-2xl font-bold text-center">Terms and Conditions</h1>
                <br></br>
                <br></br>
                <p className="text-justify">
                    Welcome to Synapse Space! By accessing or using our website, SynapseSpace.com, you agree to abide by these Terms and Conditions. Please read them carefully. If you do not agree to these terms, please refrain from using our website and services.
                </p>
                <br></br>
                <h2 className="mt-4 mb-2 text-xl font-semibold">1. About Us</h2>
                <p className="text-justify">
                    Synapse Space is an individual-operated website based in the Philippines, designed to facilitate user interaction and content sharing.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">2. Account Registration</h2>
                <p className="text-justify">
                    Users may create accounts by providing personal information, including name/username, email address, password, student ID, and registration form. You are responsible for maintaining the security of your account credentials. Synapse Space reserves the right to suspend or terminate accounts that violate these Terms or applicable laws.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">3. Personal Information</h2>
                <p className="text-justify">
                    Synapse Space collects personal information to provide and improve its services. For details about how your data is handled, please refer to our Privacy Policy.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">4. User Content</h2>
                <p className="text-justify">
                    Users may upload content, including images, to Synapse Space. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and modify your content solely to operate the platform. You agree not to upload content that violates any laws or infringes on the rights of others.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">5. Services and Features</h2>
                <p className="text-justify">
                    Synapse Space does not send promotional emails or newsletters. The website does not use analytics software, show ads, or implement tracking technologies like Facebook Pixel. Users may log in using their T.I.P. Google account. Photo gallery access may be requested for uploading images.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">6. Payments</h2>
                <p className="text-justify">
                    Synapse Space does not accept payments or allow users to purchase goods or services through the platform.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">7. Age Restrictions</h2>
                <p className="text-justify">
                    Synapse Space is not intended for users under the age of 13. If we become aware that a user under 13 has provided personal information, we will delete such information promptly.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">8. Intellectual Property</h2>
                <p className="text-justify">
                    All content, trademarks, and materials provided by Synapse Space are the exclusive property of Synapse Space. Users may not use or replicate our content without prior written consent.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">9. Disclaimer and Limitation of Liability</h2>
                <p className="text-justify">
                    Synapse Space is provided "as is" without warranties of any kind, expressed or implied. We are not responsible for any loss, damage, or inconvenience arising from the use of our website.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">10. Termination</h2>
                <p className="text-justify">
                    We reserve the right to suspend or terminate your access to Synapse Space at our discretion, including but not limited to violations of these Terms or misuse of our platform.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">11. Changes to Terms and Conditions</h2>
                <p className="text-justify">
                    Synapse Space may update these Terms and Conditions at any time. Continued use of the platform after such changes indicates your acceptance of the updated Terms.
                </p>
                <br></br>
                <hr></hr>
                <h2 className="mt-4 mb-2 text-xl font-semibold">12. Contact Us</h2>
                <p className="text-justify">
                    For questions about these Terms and Conditions, please contact us by visiting SynapseSpace.com.
                </p>
                <br></br>
                <hr></hr>
                <p className="mt-4 text-justify">Thank you for using Synapse Space!</p>
            </div>
        </div>
    );
};

export default TermsOfUse;
