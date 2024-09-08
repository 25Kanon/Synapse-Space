import ThemeSwitch from "../components/ThemeSwitch";
import LoginMethod  from "../components/LoginMethod";  
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import bannerLogin from '../assets/bannerLogin.png'


export default function UserLogin() {
    return (
        <div>
            <div class="hero bg-base-200 min-h-screen">
                <div className="card card-side bg-base-100 shadow-xl p-5 ">
                    <LoginMethod />
                    <figure>
                        <img src={bannerLogin} alt="Movie" />
                    </figure>
                </div>
            </div>
        </div>
    );
}