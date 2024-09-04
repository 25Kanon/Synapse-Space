import ThemeSwitch from "../components/ThemeSwitch";
import RegistrationForm  from "../components/RegistrationForm"; 
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'


export default function UserRegister() {
    return (
        <div>
            <div class="hero bg-base-200 min-h-screen">
                <div className="card card-side bg-base-100 shadow-xl p-5 ">
                    <RegistrationForm/> 
                </div>
            </div>
        </div>
    );
}