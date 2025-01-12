import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '/Surge/inrush/frontend/src/axiosInstance';


const LoginForm = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
      email: '',
      password: '',
    });

    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [errors, setErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate(); // Initialize navigate to handle redirects

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

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      if (!recaptchaToken) {
        alert('Please complete the reCAPTCHA');
        return;
      }
    
      setIsLoading(true); // Optional: Prevent multiple submissions
    
      try {
        const response = await axiosInstance.post(
          '/api/auth/login',
          {
            email: formData.email,
            password: formData.password,
            recaptchaToken: recaptchaToken,
          },
          {
            withCredentials: true, // IMPORTANT: Allows cookies to be sent and received
          }
        );
    
        if (response.status === 200) {
          alert('Login successful!');
          onLoginSuccess(); // Trigger callback for successful login
          navigate('/posts/list'); // Redirect to post list page
        }
      } catch (error) {
        if (error.response) {
          setErrors(error.response.data.errors || ['Invalid email or password.']);
        } else {
          setErrors(['Unable to connect to the server. Please try again later.']);
        }
      } finally {
        setIsLoading(false); // Reset loading state
      }
    };

    return (
      <div className="container-fluid" style={{ height: '100vh', display: 'flex', flexDirection: 'row' }}>
        {/* Left Side: Login Form */}
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
            <h2 className="text-center mb-4">Login</h2>
            <form onSubmit={handleSubmit}>
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
                <ReCAPTCHA
                  sitekey="6LcP77EqAAAAANqRyQ9jTsVCLq_Vxl6W60rn3QNW"
                  onChange={handleRecaptchaChange}
                />
              </div>
              {errors.length > 0 && (
                <div className="alert alert-danger">
                  {errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
              
              {/* Sign-Up Link */}
              <p className="mt-3 text-center">
                No account?{' '}
                <a href="/register" className="text-primary" style={{ textDecoration: 'none' }}>
                  Sign up
                </a>
              </p>
            </form>

          </div>
        </div>

        {/* Right Side: White Container */}
        <div className="col-md-6 d-none d-md-block">
          <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
            <div className="bg-white p-5 shadow-lg rounded" style={{ width: '80%', maxWidth: '500px' }}>
              <h3>Surge SE Internship</h3>
              <h4>January 2025</h4>
              <h3 className="pt-4">Dewni Seneviratne</h3>
            </div>
          </div>
        </div>
      </div>
    );
};

export default LoginForm;
