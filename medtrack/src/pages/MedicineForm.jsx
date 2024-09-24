import React, { useState } from 'react';
import '../css/medicineform.css';
import QRCode from 'qrcode.react'; // Import QRCode library

import db from "../firebase";
import { collection, onSnapshot, setDoc , doc, Timestamp } from 'firebase/firestore'; // Import Timestamp
import abi from '../utils/MedicineContract.json';
import { ethers } from 'ethers'; // Import ethers for Ethereum interaction


import Web3 from 'web3';


const MedicineForm = ({ onSubmit }) => {

    const contractAddress= "CONTRACT_ADDRESS";
    const contractABI = abi.abi;

    const [medicineName, setMedicineName] = useState('');
    const [minTemperature, setMinTemperature] = useState('');
    const [maxTemperature, setMaxTemperature] = useState('');
    const [qrLink, setQrLink] = useState(''); // State to hold QR code link
    const stringToBytes32 = (value) => {
        const utf8Encoder = new TextEncoder();
        const buffer = utf8Encoder.encode(value);
        const paddedBuffer = new Uint8Array(32);
        paddedBuffer.set(buffer);
        return '0x' + Buffer.from(paddedBuffer).toString('hex');    };
    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     // Generate unique QR ID
    //     const qrId = generateQrId();
        
    //     // Create Firestore document reference
    //     const docRef = doc(db, "medicines", qrId.toString());

    //     // Create medicine data object
    //     const medicineData = {
    //         medicineName: medicineName,
    //         minimumTemperature: minTemperature,
    //         maximumTemperature: maxTemperature,
    //         medicineId: qrId.toString(),
    //         createdOn: Timestamp.now(),
    //         // history: [],
    //         // qrLink: qrLink,  // QR link
    //         status: true,
    //         sold: false,
    //     };

    //     try {
    //         // Add medicine data to Firestore
    //         await setDoc(docRef, medicineData);
    //         alert("Transaction created successfully. Medicine added to blockchain.");
    //         onSubmit(medicineData);
    //         setQrLink(qrLink); // Set QR link state
    //     } catch (error) {
    //         console.error("Error adding medicine: ", error);
    //         // Handle error here
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Found:", window.ethereum);
    
        try {
            if (window.ethereum && window.ethereum.isMetaMask) {
                console.log("MetaMask detected. Requesting account access...");
                // Request access to the user's MetaMask account
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log("Account access granted.");
    
                // Create a Web3 instance
                const web3 = new Web3(window.ethereum);
    
                // Get the selected Ethereum network
                const networkId = await web3.eth.net.getId();
                console.log("Network ID:", networkId);
    
                // Initialize contract instance
                const contract = new web3.eth.Contract(contractABI, contractAddress);
    
                // Get the signer's address
                const accounts = await web3.eth.getAccounts();
                const signerAddress = accounts[0];
                const medicineNameBytes32 = generateMedicineId();
    
                // Call addMedicine function on the contract
                const tx = await contract.methods.addMedicine(
                    medicineNameBytes32,                   
                    medicineName,
                    minTemperature,
                    maxTemperature
                ).send({ from: signerAddress });
    
                // // // Wait for transaction to be mined
                console.log("Transaction hash:", tx.transactionHash);
    
                // Create Firestore document reference
                const docRef = doc(db, "medicines", medicineNameBytes32);
    
                // Create medicine data object
                const medicineData = {
                    medicineName: medicineName,
                    minimumTemperature: minTemperature,
                    maximumTemperature: maxTemperature,
                    medicineId: medicineNameBytes32,
                    createdOn: Timestamp.now(),
                    status: true,
                    sold: false,
                };
    
                // Add medicine data to Firestore
                await setDoc(docRef, medicineData);
                alert("Transaction created successfully. Medicine added to blockchain.");
                onSubmit(medicineData);
                setQrLink(qrLink); // Set QR link state
            } else {
                console.error("MetaMask not detected or not properly initialized.");
            }
        } catch (error) {
            console.error("Error adding medicine: ", error);
            // Handle error here
        }
    };
    

    // Function to generate unique QR ID
    const generateMedicineId   = () => {
        const characters = '0123456789abcdef';
        let id = '0x';
        for (let i = 0; i < 64; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          id += characters[randomIndex];
        }
        return id;
    };

    return (
        <div className='medicine-page'>
            <h2>Medicine Form</h2>
            <form onSubmit={handleSubmit} className='form'>
                <div>
                    <label htmlFor="medicineName">Medicine Name:</label>
                    <input 
                        type="text" 
                        id="medicineName" 
                        value={medicineName} 
                        onChange={(e) => setMedicineName(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="minTemperature">Minimum Temperature(°C): </label>
                    <input 
                        type="number" 
                        id="minTemperature" 
                        value={minTemperature} 
                        onChange={(e) => setMinTemperature(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="maxTemperature">Maximum Temperature(°C):</label>
                    <input 
                        type="number" 
                        id="maxTemperature" 
                        value={maxTemperature} 
                        onChange={(e) => setMaxTemperature(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
            {/* Display QR code if generated */}
            {qrLink && (
                <div className="qr-code">
                    <h3>QR Code</h3>
                    <QRCode value={qrLink} />
                </div>
            )}
        </div>
    );
};

export default MedicineForm;
