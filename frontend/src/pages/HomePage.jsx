import React, { useState } from 'react';
import { apiConnector } from '../services/apiConnector';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await apiConnector("POST", `${import.meta.env.VITE_BACKEND_URL}/login`, { username, password });
            console.log("response from login: ", response);

            if (response.data.success) {
                const data = await response.data;
                // Assuming the API returns the manager data if login is successful
                console.log('Login successful:', data.manager);
                localStorage.setItem('user', JSON.stringify(data.manager));
                // Redirect to the dashboard
                navigate(`/${data.manager.role}`)
            } else {
                console.error(response.data.message);
            }
        } catch (err) {
            console.error('Login failed:', err);
        }
    };


    return (
        <div className="h-screen flex items-center justify-center">
            <div className='bg-image w-full'></div>
            <div className="bg-white bg-opacity-75 shadow-md rounded px-8 py-8 w-2/4 bg-text">
                <h1 className="text-3xl font-bold mb-8 text-center">Welcome to the Hotel Management System</h1>
                <label className="block mb-2 text-xl float-start" htmlFor="username">Username</label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 leading-tight focus:outline-none focus:shadow-outline"
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <label className="block mb-2 text-xl float-start" htmlFor="password">Password</label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    onClick={handleLogin}
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default HomePage;
