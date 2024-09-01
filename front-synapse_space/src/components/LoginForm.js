export default function LoginForm() {
    return (
        <form className="card-body max-w-sm mx-8  flex-col ">

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Email</span>
                </label>
                <input type="email" placeholder="email" className="input input-bordered w-full max-w-xs" required />
            </div>
            <div className="form-control ">
                <label className="label">
                    <span className="label-text">Password</span>
                </label>
                <input type="password" placeholder="password" className="input input-bordered w-full max-w-xs" required />
                <label className="label">
                    <a href="#" className="label-text-alt link link-hover ">Forgot password?</a>
                </label>
            </div>
            <div className="form-control mt-6 ">
                <button className="btn  btn-primary w-full max-w-xs">Login</button>
            </div>
        </form>

    );
}