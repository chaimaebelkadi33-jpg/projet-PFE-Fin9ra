import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const error = queryParams.get('error');

        if (token) {
            loginWithToken(token);
            navigate('/', { replace: true });
        } else if (error) {
            console.error('Google Auth Error:', error);
            navigate('/login?error=' + error, { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, [location, navigate, loginWithToken]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>Connexion en cours... / جاري تسجيل الدخول...</h2>
        </div>
    );
};

export default AuthCallback;
