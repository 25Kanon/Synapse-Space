import RegistrationForm  from "../components/RegistrationForm"; 



export default function UserRegister() {
    return (
        <div>
            <div class="hero bg-base-200 min-h-screen">
                <div className="card w-1/3 bg-base-100 shadow-xl p-5 ">
                    <RegistrationForm/> 
                </div>
            </div>
        </div>
    );
}