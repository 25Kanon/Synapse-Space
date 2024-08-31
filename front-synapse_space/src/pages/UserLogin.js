import ThemeSwitch from "../components/ThemeSwitch";
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import bannerLogin from '../assets/bannerLogin.png'

export default function UserLogin() {

    return (
        <div>
            <div class="hero bg-base-200 min-h-screen">
                <div className="card card-side bg-base-100 shadow-xl p-5 ">
                    <div className="card-body max-w-sm py-0 flex-col ">
                        <h2 className="card-title justify-start">Welcome Back!</h2>
                        <div className="card-actions py-10 flex-col justify-center">
                            <button class="btn btn-primary  text-center w-full">
                                <FontAwesomeIcon icon={faGoogle} />
                                Login with Google
                            </button>
                            <div class="divider">or</div>
                            <button class="btn btn-wide w-full">
                                <FontAwesomeIcon icon={faGoogle} />
                                Login with Google
                            </button>
                        </div>
                        <article class="prose text-center max-w-sm text-sm justify-self-end self-center">
                            <p>
                                By Signing in, you agree to the Terms of Use, Community Rules, and Privacy Policy
                            </p>
                        </article>
                        <p className="text-center text-xs text-gray-500 mt-4">
                            Don’t have an account? Sign up
                        </p>
                        
                    </div>
                    <figure>
                        <img src={bannerLogin} alt="Movie" />
                    </figure>
                </div>
            </div>
        </div>
    );
}