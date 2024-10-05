import LoginMethod  from "../components/LoginMethod";  
import bannerLogin from '../assets/bannerLogin.png'
import {useContext} from "react";
import AuthContext from "../context/AuthContext";
import OTPform from "../components/OTPform";


export default function UserLogin() {
    const { requireOTP, error} = useContext(AuthContext);

    return (
        <div>
            <div class="hero bg-base-200 min-h-screen ">
                <div className="card card-side bg-base-100 shadow-xl p-5 flex flex-row ">
                    {requireOTP ?  <OTPform /> :
                    <>
                        <LoginMethod />
                        <figure>
                            <img src={bannerLogin} alt="Movie" />
                        </figure>
                    </>}

                </div>
            </div>
        </div>
    );
}