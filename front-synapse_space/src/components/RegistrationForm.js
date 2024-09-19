import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import DOMPurify from 'dompurify';
import { ErrorMessage, useFormik } from 'formik';
import axios from 'axios';
import * as yup from 'yup';
import SuccessAlert from './SuccessAlert';
import ErrorAlert from './ErrorAlert';
const validationSchema = yup.object({
    student_number: yup
        .number()
        .required('Student Number is required')
        .typeError('Student Number must be a number'),
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
    username: yup
        .string('Enter your username')
        .required('Username is required'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
});

export default function RegistrationForm() {
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const API_URL = process.env.REACT_APP_API_BASE_URI;

    const formik = useFormik({
        initialValues: {
            student_number: '',
            first_name: '',
            last_name: '',
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const sanitizedValues = {
                student_number: DOMPurify.sanitize(values.student_number),
                first_name: DOMPurify.sanitize(values.first_name),
                last_name: DOMPurify.sanitize(values.last_name),
                email: DOMPurify.sanitize(values.email),
                username: DOMPurify.sanitize(values.username),
                password: DOMPurify.sanitize(values.password),
                confirmPassword: DOMPurify.sanitize(values.confirmPassword),
            };
            const { confirmPassword, ...submittedValues } = sanitizedValues;
            console.log(JSON.stringify(submittedValues));

            const registerUser = async () => {
                try {
                    const response = await axios.post(`${API_URL}/api/auth/register/$`, submittedValues);
                    const username = response.data.user.username;
                    console.log('Account created successfully:', response.data);
                    setSuccessMessage.log(`Account created successfully! Welcome, ${username}!`);
                } catch (error) {
                    if (error.response) {
                        setErrorMessage(JSON.stringify(error.response.data));
                        console.error('An error occurred:', error.response.data);
                    } else {
                        setErrorMessage('An unexpected error occurred.');
                        console.error('An unexpected error occurred:', error.response.data);
                    }
                }
            };

            registerUser();
        },
    });

    return (


        <form className="card-body max-w-xl mx-8 flex-col" onSubmit={formik.handleSubmit}>
            {successMessage && <SuccessAlert text={successMessage} />}
            {errorMessage && <ErrorAlert text={errorMessage} />}

            <h2 className="card-title justify-center">Welcome Back!</h2>
            <h3 className="flex justify-center">Create an account</h3>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Student Number</span>
                </label>
                <input
                    type="number"
                    name="student_number"
                    placeholder="Student Number"
                    className="input input-bordered w-full"
                    onChange={formik.handleChange}
                    value={formik.values.student_number}
                />
                {formik.errors.student_number ? <span className="label-text text-error">{formik.errors.student_number}</span> : null}
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">First Name</span>
                </label>
                <input
                    type="text"
                    name="first_name"
                    placeholder="First name"
                    className="input input-bordered w-full"
                    onChange={formik.handleChange}
                    value={formik.values.first_name}
                />
                {formik.errors.first_name ? <span className="label-text text-error">{formik.errors.first_name}</span> : null}
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Last Name</span>
                </label>
                <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    className="input input-bordered w-full"
                    onChange={formik.handleChange}
                    value={formik.values.last_name}
                />
                {formik.errors.last_name ? <span className="label-text text-error">{formik.errors.last_name}</span> : null}
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Email</span>
                </label>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="input input-bordered w-full"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                />
                {formik.errors.email ? <span className="label-text text-error">{formik.errors.email}</span> : null}
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Username</span>
                </label>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="input input-bordered w-full"
                    onChange={formik.handleChange}
                    value={formik.values.username}
                />
                {formik.errors.username ? <span className="label-text text-error">{formik.errors.username}</span> : null}
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Password</span>
                </label>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="input input-bordered w-full"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                />
                {formik.errors.password ? <span className="label-text text-error">{formik.errors.password}</span> : null}
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Confirm Password</span>
                </label>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="input input-bordered w-full"
                    onChange={formik.handleChange}
                    value={formik.values.confirmPassword}
                />
                {formik.errors.confirmPassword ? <span className="label-text text-error">{formik.errors.confirmPassword}</span> : null}
            </div>

            <button type="submit" className="btn btn-primary mt-4">Submit</button>

        </form>
    );
}