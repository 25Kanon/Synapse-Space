import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { useFormik } from 'formik';
import axios from 'axios';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import SuccessAlert from './SuccessAlert';
import ErrorAlert from './ErrorAlert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faCaretSquareLeft } from '@fortawesome/free-regular-svg-icons';

const validationSchema = yup.object({
    first_name: yup
        .string()
        .required('First Name is required'),
    last_name: yup
        .string()
        .required('Last Name is required'),
    email: yup
        .string('Enter your TIP email')
        .email('Enter a valid email')
        .required('TIP Email is required'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters long')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/\d/, 'Password must contain at least one number')
        .matches(/[@$!%*?&_]/, 'Password must contain at least one special character'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
});

export default function RegistrationForm() {
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URI;

    const formik = useFormik({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const sanitizedValues = {
                first_name: DOMPurify.sanitize(values.first_name),
                last_name: DOMPurify.sanitize(values.last_name),
                email: DOMPurify.sanitize(values.email),
                password: DOMPurify.sanitize(values.password),
                confirmPassword: DOMPurify.sanitize(values.confirmPassword),
            };
            const { confirmPassword, ...submittedValues } = sanitizedValues;
            console.log(JSON.stringify(submittedValues));

            const registerUser = async () => {
                try {
                    const response = await axios.post(`${API_URL}/api/auth/register/`, submittedValues);
                    console.log('Account created successfully:', response.data);
                    setSuccessMessage('Account created successfully!');
                } catch (error) {
                    if (error.response) {
                        setErrorMessage(JSON.stringify(error.response.data));
                        console.error('An error occurred:', error.response.data);
                    } else {
                        setErrorMessage('An unexpected error occurred.');
                        console.error('An unexpected error occurred:', error.message);
                    }
                }
            };

            registerUser();
        },
    });

    return (
        
        
        <form className="flex-col mx-8 card-body" onSubmit={formik.handleSubmit}>
            {successMessage && <SuccessAlert text={successMessage}/>}
            {errorMessage && <ErrorAlert text={errorMessage}/>}

            {/* Back Button */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 text-secondary"
            >
                <div className="p-3 rounded-full hover:bg-neutral">
                    <FontAwesomeIcon
                        icon={faCaretSquareLeft}
                        className="text-secondary hover:text-accent"
                        size="2xl" // You can adjust size further if needed
                    />
                </div>
            </button>

            <h2 className="justify-center card-title">Welcome Back!</h2>
            <h3 className="flex justify-center">Create an account</h3>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Email</span>
                </label>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full input input-bordered"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                />
                {formik.errors.email ? <span className="label-text text-error">{formik.errors.email}</span> : null}
            </div>


            <div className="form-control">
                <label className="label">
                    <span className="label-text">First Name</span>
                </label>
                <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    className="w-full input input-bordered"
                    onChange={formik.handleChange}
                    value={formik.values.first_name}
                />
                {formik.errors.first_name ?
                    <span className="label-text text-error">{formik.errors.first_name}</span> : null}
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Last Name</span>
                </label>
                <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    className="w-full input input-bordered"
                    onChange={formik.handleChange}
                    value={formik.values.last_name}
                />
                {formik.errors.last_name ?
                    <span className="label-text text-error">{formik.errors.last_name}</span> : null}
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Password</span>
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        className="w-full input input-bordered"
                        onChange={formik.handleChange}
                        value={formik.values.password}
                    />
                    <FontAwesomeIcon
                        icon={showPassword ? faEye : faEyeSlash}
                        className="absolute text-gray-600 cursor-pointer right-3 top-3"
                        onClick={() => setShowPassword(!showPassword)}
                    />
                </div>
                {formik.errors.password ? (
                    <span className="label-text text-error">{formik.errors.password}</span>
                ) : (
                    <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, a number, and a special character.
                    </p>
                )}
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Confirm Password</span>
                </label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        className="w-full input input-bordered"
                        onChange={formik.handleChange}
                        value={formik.values.confirmPassword}
                    />
                    <FontAwesomeIcon
                        icon={showConfirmPassword ? faEye : faEyeSlash}
                        className="absolute text-gray-600 cursor-pointer right-3 top-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                </div>
                {formik.errors.confirmPassword ?
                    <span className="label-text text-error">{formik.errors.confirmPassword}</span> : null}
            </div>

            <button type="submit" className="mt-4 btn btn-primary">Submit</button>
        </form>
    );
}
