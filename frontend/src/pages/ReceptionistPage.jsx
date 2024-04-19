import React, { useState, useEffect } from 'react';
import { apiConnector } from '../services/apiConnector';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function ReceptionistPage() {
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        email: '',
        address: '',
    });
    const [checkinDetails, setCheckinDetails] = useState({
        customerEmail: '',
        checkinDate: '',
        expectedCheckoutDate: '',
        roomNumber: '',
    });
    const [checkoutDetails, setCheckoutDetails] = useState({
        roomNumber: '',
    });
    const [checkinBill, setCheckinBill] = useState(0);
    const [checkinDiscount, setCheckinDiscount] = useState(0);
    const [checkoutBill, setCheckoutBill] = useState(0);
    const [toggle, setToggle] = useState(false);

    const [freeRooms, setFreeRooms] = useState([]);
    const [occupiedRooms, setOccupiedRooms] = useState([]);

    const handleFetchFreeRooms = async () => {
        try {
            const response = await apiConnector('GET', `${import.meta.env.VITE_BACKEND_URL}/freeRooms`);
            if (response.data.success) {
                setFreeRooms(response.data.freeRooms);
                setCheckinDetails({ ...checkinDetails, roomNumber: response.data.freeRooms[0].roomNumber });
            } else {
                console.error('Failed to fetch free rooms');
            }
        } catch (err) {
            console.error('Failed to fetch free rooms:', err);
        }
    };

    const handleOccupiedRooms = async () => {
        try {
            const response = await apiConnector('GET', `${import.meta.env.VITE_BACKEND_URL}/occupiedRooms`);
            if (response.data.success) {
                setOccupiedRooms(response.data.occupiedRooms);
                setCheckoutDetails({ ...checkoutDetails, roomNumber: response.data.occupiedRooms[0]?.roomNumber });
            } else {
                console.error('Failed to fetch occupied rooms');
            }
        } catch (err) {
            console.error('Failed to fetch occupied rooms:', err);
        }
    };

    const handleCreateBooking = async (e) => {
        e.preventDefault();
        try {
            const createBookingResponse = await apiConnector('POST', `${import.meta.env.VITE_BACKEND_URL}/createBooking`, {
                advancePaid: checkinBill,
                ...checkinDetails
            });
            if (createBookingResponse.data.success) {
                setToggle(!toggle);
                toast.success(createBookingResponse.data.message);
                setCheckinDetails({
                    customerEmail: '',
                    checkinDate: '',
                    expectedCheckoutDate: '',
                });
                console.log(createBookingResponse.data.message);
            } else {
                console.error('Failed to create booking');
            }
        } catch (err) {
            console.error('Failed to create booking:', err);
        }
    };

    // Fetch free rooms on component mount
    useEffect(() => {
        handleFetchFreeRooms();
        handleOccupiedRooms();
    }, [toggle]);

    const handleRegisterCustomer = async (e) => {
        e.preventDefault();
        try {
            const response = await apiConnector('POST', `${import.meta.env.VITE_BACKEND_URL}/registerCustomer`, customerDetails);
            if (response.data.success) {
                console.log('Customer registered successfully');
                toast.success(response.data.message);
                setCustomerDetails({
                    name: '',
                    email: '',
                    address: '',
                });
            } else {
                console.error('Failed to register customer');
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error('Failed to register customer:', err);
        }
    };

    const handleCalculateCheckinBill = async (e) => {
        e.preventDefault();
        try {
            console.log("checkinDetails: ", checkinDetails);
            const response = await apiConnector('POST', `${import.meta.env.VITE_BACKEND_URL}/checkinBill`, checkinDetails);
            if (response.data.success) {
                setCheckinBill(response.data.advance - response.data.discount);
                setCheckinDiscount(response.data.discount);
            } else {
                console.error('Failed to calculate checkin bill');
            }
        } catch (err) {
            console.error('Failed to calculate checkin bill:', err);
        }
    };

    const handleCalculateCheckoutBill = async (e) => {
        e.preventDefault();
        try {
            const response = await apiConnector('POST', `${import.meta.env.VITE_BACKEND_URL}/checkoutBill`, checkoutDetails);
            if (response.data.success) {
                setCheckoutBill(response.data.totalBalance);
                console.log(response.data.totalBalance);
            } else {
                console.error('Failed to calculate checkout bill');
            }
        } catch (err) {
            console.error('Failed to calculate checkout bill:', err);
        }
    };

    const handleCreateCheckout = async (e) => {
        e.preventDefault();
        try {
            const response = await apiConnector('POST', `${import.meta.env.VITE_BACKEND_URL}/createCheckout`, {
                checkoutDate: new Date(),
                totalBalance: checkoutBill,
                ...checkoutDetails
            });
            if (response.data.success) {
                console.log('Checkout created successfully');
                setToggle(!toggle);
                toast.success(response.data.message);
            } else {
                console.error('Failed to create checkout');
            }
        } catch (err) {
            console.error('Failed to create checkout:', err);
        }
    };

    const navigate = useNavigate();
    const logout = () => {
        localStorage.setItem("user", null);
        navigate("/");
    }

    return (
        <div className="flex flex-col mx-auto w-[50%] relative">
            <div onClick={logout} className='absolute right-0 max-w-fit px-4 py-2 rounded bg-blue-900 text-white font-semibold hover:bg-blue-950'>logout</div>
            <h2 className="text-4xl font-bold mb-4 text-center">Receptionist Page</h2>
            <h2 className="text-2xl font-bold mb-4">Register Customer</h2>
            {/* <form onSubmit={handleRegisterCustomer} className="mb-8"> */}
            <label className="block mb-2">Name:</label>
            <input type="text" value={customerDetails.name} onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />

            <label className="block mb-2">Email:</label>
            <input type="email" value={customerDetails.email} onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />

            <label className="block mb-2">Address:</label>
            <input type="text" value={customerDetails.address} onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />

            <button onClick={handleRegisterCustomer} className="bg-blue-500 text-white px-4 py-2 rounded-md">Register Customer</button>
            {/* </form> */}
            <div className='border-b-[3px] border-gray-600 w-[100%] mx-auto my-3'></div>

            <h2 className="text-2xl font-bold my-4">Create Booking</h2>
            {/* <form onSubmit={handleCreateBooking} className="mb-8"> */}
            <label className="block mb-2">Customer Email:</label>
            <input type="email" value={checkinDetails.customerEmail} onChange={(e) => setCheckinDetails({ ...checkinDetails, customerEmail: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />
            <label className="block mb-2">Room Number:</label>
            <select value={checkinDetails.roomNumber} onChange={(e) => {
                setCheckinDetails({ ...checkinDetails, roomNumber: e.target.value });
                console.log(checkinDetails.roomNumber)
            }} className="border border-gray-300 rounded-md p-2 mb-4">
                {freeRooms.map(room => (
                    <option key={room.roomNumber} value={room.roomNumber}>{room.roomNumber}</option>
                ))}
            </select>

            <label className="block mb-2">Checkin Date:</label>
            <input type="date" value={checkinDetails.checkinDate} onChange={(e) => setCheckinDetails({ ...checkinDetails, checkinDate: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />

            <label className="block mb-2">Expected Checkout Date:</label>
            <input type="date" value={checkinDetails.expectedCheckoutDate} onChange={(e) => setCheckinDetails({ ...checkinDetails, expectedCheckoutDate: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4" />

            {/* Display checkin bill */}
            {checkinBill > 0 && (
                <div>
                    <span className='mr-2'>Checkin Bill: {checkinBill}</span>
                    <span>Discount: {checkinDiscount}</span>
                </div>
            )}
            <button onClick={handleCalculateCheckinBill} className="bg-blue-500 my-2 text-white px-4 py-2 rounded-md">Calculate Advance</button>
            <button onClick={handleCreateBooking} className="bg-blue-500 text-white px-4 py-2 rounded-md">Create Booking</button>
            {/* </form> */}
            <div className='border-b-[3px] border-gray-600 w-[100%] mx-auto my-3'></div>

            <h2 className="text-2xl font-bold my-4">Create Checkout</h2>
            {/* <form onSubmit={handleCreateCheckout} className="mb-8"> */}
            <label className="block mb-2">Room Number:</label>
            <select value={checkoutDetails.roomNumber} onChange={(e) => setCheckoutDetails({ ...checkoutDetails, roomNumber: e.target.value })} className="border border-gray-300 rounded-md p-2 mb-4">
                {occupiedRooms.map(room => (
                    <option key={room.roomNumber} value={room.roomNumber}>{room.roomNumber}</option>
                ))}
            </select>
            {/* Display checkout bill */}
            {checkoutBill > 0 && (
                <span>Checkout Bill: {checkoutBill}</span>
            )}
            <button onClick={handleCalculateCheckoutBill} className="bg-blue-500 my-2 text-white px-4 py-2 rounded-md">Calculate bill</button>
            <button onClick={handleCreateCheckout} className="bg-blue-500 text-white px-4 py-2 rounded-md">Create Checkout</button>
            {/* </form> */}
            <div className='border-b-[3px] border-gray-600 w-[100%] mx-auto my-3'></div>
        </div>
    );
}

export default ReceptionistPage;
