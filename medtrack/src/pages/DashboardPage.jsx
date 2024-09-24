import React, { useState } from 'react';
import '../css/dashboard.css';
import Home from './Home';
import MedicineList from './MedicineList';
import MedicineForm from './MedicineForm';
import MedicineDetails from './MedicineDetails'; // Import the MedicineDetails component
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [selectedOption, setSelectedOption] = useState('home');
    const [medicine, setMedicine] = useState(null); // State to store medicine data
    const navigate = useNavigate();

    const handleMenuClick = (option) => {
        setSelectedOption(option);
    };

    const handleFormSubmit = (medicineData) => {
        setMedicine(medicineData); // Set medicine data when form is submitted
        setSelectedOption('medicineDetails'); // Switch to medicine details view
    };

    const handleMedicineClick = (medicineData) => {
        setMedicine(medicineData);
        setSelectedOption('medicineDetails'); // Switch to medicine details view
    };

    let content;
    switch (selectedOption) {
        case 'home':
            content = <Home />;
            navigate(`/dashboard`);
            break;
        case 'medicineList':
            content = <MedicineList onMedicineClick={handleMedicineClick} />;
            break;
        case 'createMedicine':
            content = <MedicineForm onSubmit={handleFormSubmit} />;
            break;
        case 'medicineDetails':
            content = <MedicineDetails medicine={medicine} />;
            break;
        default:
            content = <Home />;
    }

    return (
        <div className='dashboard-container'>
            <div className="sidebar">
                <ul>
                    <p className='company-title'>MEDTRACK</p>
                    <li onClick={() => handleMenuClick('home')} style={{ backgroundColor: selectedOption === 'home' ? '#555' : '' }}>Home</li>
                    <li onClick={() => handleMenuClick('medicineList')} style={{ backgroundColor: selectedOption === 'medicineList' ? '#555' : '' }}>List of Medicine</li>
                    <li onClick={() => handleMenuClick('createMedicine')} style={{ backgroundColor: selectedOption === 'createMedicine' ? '#555' : '' }}>Create Medicine</li>
                </ul>
            </div>
            <div className="content">
                {content}
            </div>
        </div>
    );
};

export default Dashboard;
