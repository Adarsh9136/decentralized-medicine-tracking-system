import React, { useState, useEffect, useRef } from 'react';
import '../css/medicinelist.css';
import { collection, onSnapshot } from 'firebase/firestore';
import db from '../firebase';
import safeIcon from '../assets/safe.png';
import dangerIcon from '../assets/danger.png';
import { Html5QrcodeScanner } from 'html5-qrcode';

const MedicineList = ({ onMedicineClick }) => {
    const [dummyMedicines, setMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [showMedicineDetails, setShowMedicineDetails] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'medicines'), (snapshot) => {
            setMedicines(snapshot.docs.map((doc) => doc.data()));
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (showQRScanner && !showMedicineDetails) {
            startScanner();
        } else {
            stopScanner();
        }
    }, [showQRScanner, showMedicineDetails]);

    const startScanner = () => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 550,
                height: 550,
            },
            fps: 5,
        });

        scanner.render((result) => {
            handleQRScan(result);
        }, (error) => {
            console.warn(error);
        });

        scannerRef.current = scanner;
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current.stop();
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleQRScan = (data) => {
        console.log('Scanned QR ID:', data);
        setShowQRScanner(false);

        const foundMedicine = dummyMedicines.find((medicine) => medicine.medicineId === data);
        if (foundMedicine) {
            setShowMedicineDetails(true);
            onMedicineClick(foundMedicine);
            stopScanner();
        } else {
            alert('Medicine not found!');
        }
    };

    const toggleQRScanner = () => {
        setShowQRScanner(!showQRScanner);
    };

    const handleBackToSearch = () => {
        setShowMedicineDetails(false);
        startScanner(); // Start the scanner again when going back to search
    };

    const filteredMedicines = dummyMedicines.filter(
        (medicine) =>
            medicine.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            medicine.medicineId.includes(searchQuery)
    );

    return (
        <div className="medicine-list">
            <div className="search-area">
                <h2>Medicine List</h2>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search medicine by ID/Name..."
                        className="search-field"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <button onClick={toggleQRScanner} className='scan-button'>Scan QR Code</button>
                </div>
                {showQRScanner && !showMedicineDetails && (
                    <div id="reader" style={{ width: '100%', height: '100%' }}></div>
                )}
            </div>
            <ul>
                {filteredMedicines.map((medicine) => (
                    <div
                        key={medicine.medicineId}
                        className={`medicine-card ${medicine.status ? 'safe' : 'danger'}`}
                        onClick={() => onMedicineClick(medicine)}
                    >
                        <p className='none'>{"Medicine Id: "+medicine.medicineId+"   "}</p>
                        <span>{medicine.medicineName}</span>
                        {medicine.status ? (
                            <img src={safeIcon} alt="Safe" className="status-icon" />
                        ) : (
                            <img src={dangerIcon} alt="Danger" className="status-icon" />
                        )}
                    </div>
                ))}
            </ul>
            {showMedicineDetails && (
                <div className="medicine-info">
                    {/* Display medicine details here */}
                    <button onClick={handleBackToSearch}>Back to Search</button>
                </div>
            )}
        </div>
    );
};

export default MedicineList;
