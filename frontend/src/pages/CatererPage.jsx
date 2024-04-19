import React, { useState, useEffect } from 'react';
import { apiConnector } from '../services/apiConnector';
import { useNavigate } from 'react-router-dom';

function CatererPage() {
    const [occupiedRooms, setOccupiedRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [foodItem, setFoodItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOccupiedRooms = async () => {
            try {
                const response = await apiConnector('GET', `${import.meta.env.VITE_BACKEND_URL}/occupiedRooms`);
                if (response.data.success) {
                    setOccupiedRooms(response.data.occupiedRooms);
                    console.log('Occupied rooms:', response.data.occupiedRooms);
                } else {
                    setError('Failed to fetch occupied rooms');
                }
            } catch (err) {
                console.error('Error fetching occupied rooms:', err);
                setError('Failed to fetch occupied rooms');
            }
        };

        fetchOccupiedRooms();
    }, []);

    const handleAddFoodItem = async (e) => {
        e.preventDefault();
        if (!selectedRoom || !foodItem || !quantity || !totalPrice) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const response = await apiConnector('POST', `${import.meta.env.VITE_BACKEND_URL}/searchAndAddFoodPrice`, { roomNumber: selectedRoom, totalPrice });
            if (response.data.success) {
                console.log('Food item added successfully');
                // Reset form fields
                setFoodItem('');
                setQuantity('');
                setTotalPrice('');
                setError('');
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error adding food item:', err);
            setError('Failed to add food item');
        }
    };
    const navigate = useNavigate();
    const logout = () => {
        localStorage.setItem("user", null);
        navigate("/");
    }

    return (
        <div className="flex flex-col w-[50%] mx-auto min-h-[100vh] relative">
            <div onClick={logout} className='absolute right-0 max-w-fit px-4 py-2 rounded bg-blue-900 text-white font-semibold hover:bg-blue-950'>logout</div>
            <h2 className="text-4xl font-bold mb-4 text-center">Caterer Page</h2>
            <h3 className="text-xl font-bold mb-2">Search and Add Food Price</h3>
            {/* <form onSubmit={handleAddFoodItem} className="mb-8"> */}
            <label className="block mb-2">Room Number:</label>
            <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="border border-gray-300 rounded-md p-2 mb-4">
                <option value="">Select Room Number</option>
                {occupiedRooms.map(room => (
                    <option key={room.roomNumber} value={room.roomNumber}>{room.roomNumber}</option>
                ))}
            </select>
            <label className="block mb-2">Food Item:</label>
            <input type="text" value={foodItem} onChange={(e) => setFoodItem(e.target.value)} className="border border-gray-300 rounded-md p-2 mb-4" />
            <label className="block mb-2">Quantity:</label>
            <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="border border-gray-300 rounded-md p-2 mb-4" />
            <label className="block mb-2">Total Price:</label>
            <input type="text" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} className="border border-gray-300 rounded-md p-2 mb-4" />
            <button onClick={handleAddFoodItem} className="bg-blue-500 text-white px-4 py-2 rounded-md">Add Food Item</button>
            {error && <p className="text-red-500">{error}</p>}
            {/* </form> */}
            <div className='border-b-[3px] border-gray-600 w-[100%] mx-auto my-3'></div>
        </div>
    );
}

export default CatererPage;
