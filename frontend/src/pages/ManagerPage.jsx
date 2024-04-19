import React, { useState, useEffect } from 'react';
import { apiConnector } from '../services/apiConnector'; // Assuming apiConnector is exported from a separate file
import { toast } from "react-hot-toast"
import { useNavigate } from 'react-router-dom';

const ManagerPage = () => {
    const [roomDetails, setRoomDetails] = useState({
        roomNumber: '',
        isAC: 'true', // Default value for acType dropdown
        roomType: 'single', // Default value for bedType dropdown
        pricePerDay: 0,
    });
    const [loginDetails, setLoginDetails] = useState({
        name: '',
        role: 'receptionist', // Default value for role dropdown
        username: '',
        password: '',
    });
    const [tariffAmount, setTariffAmount] = useState(0);
    const [loginError, setLoginError] = useState(null);
    const [roomError, setRoomError] = useState(null);
    const [occupancy, setOccupancy] = useState(null);

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            setRoomError(null);
            // setRoomSuccess(null);
            console.log("roomDetails: ", roomDetails)
            const response = await apiConnector('POST', `${import.meta.env.VITE_BACKEND_URL}/addRoom`, roomDetails);
            console.log("response from addRoom: ", response);
            if (response.data.success) {
                console.log(response.data.message);
                // setRoomSuccess(response.data.message)
                toast.success(response.data.message);
            } else {
                console.error(response.data.message);
                setRoomError(response.data.message);
            }
        } catch (err) {
            console.error('Failed to add room:', err);
        }
    };

    const handleGenerateLogin = async (e) => {
        e.preventDefault();
        try {
            setLoginError(null);
            const response = await apiConnector('POST', `${import.meta.env.VITE_BACKEND_URL}/generateLoginDetails`, loginDetails);
            console.log("response from generateLogin: ", response);
            if (response.data.success) {
                console.log('Login details generated successfully');
                toast.success(response.data.message);
            } else {
                console.error(response.data.message);
                setLoginError(response.data.message);
            }
        } catch (err) {
            console.error('Failed to generate login details:', err);
        }
    };

    const handleSetTariff = async (e) => {
        e.preventDefault();
        try {
            const response = await apiConnector('PUT', `${import.meta.env.VITE_BACKEND_URL}/changeTariff`, { tariffAmount });
            if (response.data.success) {
                console.log('Tariff set successfully');
                toast.success(response.data.message);
            } else {
                console.error('Failed to set tariff');
            }
        } catch (err) {
            console.error('Failed to set tariff:', err);
        }
    };

    const fetchOccupancy = async () => {
        try {
            const response = await apiConnector('GET', `${import.meta.env.VITE_BACKEND_URL}/occupancyRate`);
            console.log("response from getOccupancy: ", response);
            if (response.data.success) {
                setOccupancy(response.data.occupancyRate);
                console.log(response.data.occupancyRate);
            } else {
                console.error(response.data.message);
            }
        } catch (err) {
            console.error('Failed to get occupancy:', err);
        }
    }

    useEffect(() => {
        fetchOccupancy();
    }, []);

    const navigate = useNavigate();
    const logout = () => {
        localStorage.setItem("user", null);
        navigate("/");
    }

    return (
        <div className="flex flex-col w-[50%] mx-auto relative">
            <div onClick={logout} className='absolute right-0 max-w-fit px-4 py-2 rounded bg-blue-900 text-white font-semibold hover:bg-blue-950'>logout</div>
            <h2 className="text-4xl font-bold mb-4 text-center">Manager page</h2>
            <h2 className="text-2xl font-bold mb-4">Add Room</h2>
            {/* <form onSubmit={handleAddRoom} className="mb-8"> */}
            <label className="block mb-2">Room Number:</label>
            <input type="text" value={roomDetails.roomNumber} onChange={(e) => setRoomDetails({ ...roomDetails, roomNumber: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />
            <label className="block mb-2">AC Type:</label>
            <select value={roomDetails.isAC} onChange={(e) => setRoomDetails({ ...roomDetails, isAC: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4">
                <option value="true">True</option>
                <option value="false">False</option>
            </select>
            <label className="block mb-2">Bed Type:</label>
            <select value={roomDetails.roomType} onChange={(e) => setRoomDetails({ ...roomDetails, roomType: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4">
                <option value="single">Single</option>
                <option value="double">Double</option>
            </select>
            <label className="block mb-2">Price per day:</label>
            <input type="text" value={roomDetails.pricePerDay} onChange={(e) => setRoomDetails({ ...roomDetails, pricePerDay: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />
            <button onClick={handleAddRoom} className="bg-blue-500 text-white px-4 py-2 rounded-md">Add Room</button>
            {roomError && <p className="text-red-500">{roomError}</p>}
            {/* {roomSuccess && <p className="text-green-500">{roomSuccess}</p>} */}
            {/* </form> */}
            <div className='border-b-[3px] border-gray-600 w-[100%] mx-auto my-3'></div>

            <h2 className="text-2xl font-bold my-4">Generate Login Details</h2>
            {/* <form onSubmit={handleGenerateLogin} className="mb-8"> */}
            <label className="block mb-2">Name:</label>
            <input type="text" value={loginDetails.name} onChange={(e) => setLoginDetails({ ...loginDetails, name: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />
            <label className="block mb-2">Role:</label>
            <select value={loginDetails.role} onChange={(e) => setLoginDetails({ ...loginDetails, role: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4">
                <option value="receptionist">Receptionist</option>
                <option value="caterer">Caterer</option>
            </select>
            <label className="block mb-2">Username:</label>
            <input type="text" value={loginDetails.username} onChange={(e) => setLoginDetails({ ...loginDetails, username: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />
            <label className="block mb-2">Password:</label>
            <input type="password" value={loginDetails.password} onChange={(e) => setLoginDetails({ ...loginDetails, password: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />
            <button onClick={handleGenerateLogin} className="bg-blue-500 text-white px-4 py-2 rounded-md">Generate Login</button>
            {loginError && <p className="text-red-500">{loginError}</p>}
            {/* </form> */}
            <div className='border-b-[3px] border-gray-600 w-[100%] mx-auto my-3'></div>

            <h2 className="text-2xl font-bold my-4">Set Tariff</h2>
            <p className="mb-4">Current Occupancy Rate: {occupancy}%</p>
            {/* <form onSubmit={handleSetTariff}> */}
            <label className="block mb-2">Tariff Offset Amount:</label>
            <input type="number" value={tariffAmount} onChange={(e) => setTariffAmount(e.target.value)} className="border border-gray-300 rounded-md p-2 mb-4" />
            <button onClick={handleSetTariff} className="bg-blue-500 text-white px-4 py-2 rounded-md">Change Tariff</button>
            {/* </form> */}
            <div className='border-b-[3px] border-gray-600 w-[100%] mx-auto my-3'></div>
        </div>
    );
};

export default ManagerPage;
