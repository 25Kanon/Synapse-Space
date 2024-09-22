import RegistrationForm  from "../components/RegistrationForm"; 



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