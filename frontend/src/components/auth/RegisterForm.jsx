import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '/Surge/inrush/frontend/src/axiosInstance';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        profilePicture: null,
    });

    const [profilePicturePreview, setProfilePicturePreview] = useState(null); // For previewing the uploaded image
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [errors, setErrors] = useState([]);
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const handleRecaptchaChange = (value) => {
        setRecaptchaToken(value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            profilePicture: file,
        });
        setProfilePicturePreview(URL.createObjectURL(file));
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (step === 1) {
            if (!formData.userName || !formData.email || !formData.password || !formData.confirmPassword) {
                setErrors(["All fields in step 1 are required."]);
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setErrors(["Passwords do not match."]);
                return;
            }

            setErrors([]);
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!recaptchaToken) {
            alert('Please complete the reCAPTCHA');
            return;
        }
         // Log the reCAPTCHA token to the console
        console.log('reCAPTCHA Token:', recaptchaToken);
        console.log('media', formData.profilePicture);
        console.log('userName', formData.userName);

        const data = new FormData();
        data.append('userName', formData.userName);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('confirmPassword', formData.confirmPassword);        
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('dateOfBirth', formData.dateOfBirth);     
        data.append('recaptchaToken', recaptchaToken);
        data.append('profilePicture', formData.profilePicture);

        try {
            const response = await axiosInstance.post('/api/auth/register', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                alert("User registered successfully!");
                navigate('/login');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data.errors || []);
            } else {
                setErrors(["An unknown error occurred."]);
            }
        }
    };

        return (
            <div className="container-fluid" style={{ height: '100vh', display: 'flex', flexDirection: 'row' }}>
                <div
                    className="col-md-6 d-flex justify-content-center align-items-center"
                    style={{
                        backgroundImage: 'url(https://inrushbucket.s3.eu-north-1.amazonaws.com/GridArtLogin.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '100vh',
                    }}
                >
                    <div
                        className="bg-white p-5 rounded shadow-lg"
                        style={{
                            width: '80%',
                            maxWidth: '500px',
                            zIndex: 1,
                        }}
                    >
                        <h2 className="text-center mb-4">SignUp</h2>
                        <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
                            {step === 1 && (
                                <div>
                                    <div className="mb-3">
                                        <label className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="userName"
                                            value={formData.userName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
                                        Next
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <div className="mb-3">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Profile Picture</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileChange}
                                        />
                                    {profilePicturePreview && (
                                        <img
                                            src={profilePicturePreview}
                                            alt="Profile Preview"
                                            className="mt-2"
                                            style={{
                                                width: '200px',
                                                height: '200px',
                                                objectFit: 'cover',
                                                borderRadius: '50%', 
                                                border: '2px solid #ddd', 
                                            }}
                                        />
                                    )}
                                    </div>
                                    <div className="mb-3">
                                        <ReCAPTCHA
                                            sitekey="6LcP77EqAAAAANqRyQ9jTsVCLq_Vxl6W60rn3QNW" 
                                            onChange={handleRecaptchaChange}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success w-100">Sign Up</button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
                {/* Right Side: White Container */}
                <div className="col-md-6 d-none d-md-block">
                    <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                        <div className="bg-white p-5 shadow-lg rounded" style={{ width: '80%', maxWidth: '500px' }}>
                            <h3>Surge SE Internship</h3>
                            <h4>January 2025</h4>
                            <h3 className='pt-4'>Dewni Seneviratne</h3>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

export default RegisterPage;
