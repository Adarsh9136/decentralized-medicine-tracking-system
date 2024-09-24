import React, { useState, useEffect } from 'react';
import '../css/medicinedetails.css';
import QRCode from 'qrcode.react'; // Import QRCode library
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import db from '../firebase';
import abi from '../utils/MedicineContract.json';
import { ethers } from 'ethers'; // Import ethers for Ethereum interaction
import Web3 from 'web3';

const MedicineDetails = ({ medicine }) => {

    const [medicineByBlockchain, setMedicineByBlockchain] = useState({condition: true});


    const [transactions, setTransactions] = useState([]);
    const [sold, setSold] = useState(medicine.sold);
    const contractAddress= "contract_Address";
    const contractABI = abi.abi;
    const WALLET_ADDRESS ='WALLET_ADDRESS';
    useEffect(() => {
        // Subscribe to the collection of transactions for this medicine
        const fetchMedicine = async () => {
            try {
                const medicineData = await getMedicineById(medicine.medicineId);
                setMedicineByBlockchain(medicineData);
                console.log("Medicine:", medicineData);
                if(medicine.status!== medicineData.condition){
                    updateToDamaged();
                }
            } catch (error) {
                console.error("Error fetching medicine data:", error);
            }
        };
    
        fetchMedicine();
        const unsubscribe = onSnapshot(collection(db, `medicines/${medicine.medicineId}/transactions`), (snapshot) => {
            setTransactions(snapshot.docs.map(doc => doc.data()));
        });
        console.log(medicine.status,medicineByBlockchain.condition);
        return () => {
            // Unsubscribe when component unmounts
            unsubscribe();
        };
    }, [medicine.medicineId]);
    const getMedicineById = async (medicineId) => {
        try {
            // Create a Web3 instance
            const web3 = new Web3(window.ethereum);
    
            // Initialize contract instance
            const contract = new web3.eth.Contract(contractABI, contractAddress);
    
            // Call the getMedicine function on the contract
            const result = await contract.methods.getMedicine(medicineId).call();
    
            // Parse the returned values
            const name = result[0];
            const minTemperature = parseInt(result[1]);
            const maxTemperature = parseInt(result[2]);
            const condition = result[3];
            const sold = result[4];
            const history = result[5]; // Assuming history is an array of bytes32

            // Do something with the retrieved data
            console.log("Medicine Name:", name);
            console.log("Min Temperature:", minTemperature);
            console.log("Max Temperature:", maxTemperature);
            console.log("Condition:", condition);
            console.log("Sold:", sold);
            console.log("History:", history);

    
            return { name:name,minTemperature: minTemperature,maxTemperature: maxTemperature, condition:condition,sold: sold,history: history };
        } catch (error) {
            console.error("Error fetching medicine data:", error);
            // Handle error here
            return null;
        }
    };
    const handleSold = async () => {

        try {
            const web3 = new Web3(window.ethereum);
        
            // Initialize contract instance
            const contract = new web3.eth.Contract(contractABI, contractAddress);
        
            // Call the updateMedicineSoldStatus function on the contract
            await contract.methods.updateMedicineSoldStatus(medicine.medicineId, true).send({ from: WALLET_ADDRESS });
            
            // Update sold status to true
            await updateDoc(doc(db, `medicines/${medicine.medicineId}`), {
                sold: true
            });
            alert("Medicine marked as sold successfully.");
            setSold(true);
        } catch (error) {
            console.error("Error updating sold status: ", error);
            // Handle error here
        }
    };

    const updateToDamaged = async () => {

        try {
            const web3 = new Web3(window.ethereum);
        
            // Initialize contract instance
            const contract = new web3.eth.Contract(contractABI, contractAddress);
        
            // Call the updateMedicineSoldStatus function on the contract
            await contract.methods.updateMedicineStatus(medicine.medicineId, false).send({ from: WALLET_ADDRESS });
            
            alert("Medicine marked as damaged successfully.");
            setSold(true);
        } catch (error) {
            console.error("Error updating sold status: ", error);
        }
    };


    return (
        <div className='medicine-details'>
            <div className='medicine'>
                <div className='medicine-left'>
                    <h2>Medicine Details</h2>
                    <p>Medicine Name: {medicine.medicineName}</p>
                    <p>Minimum Temperature: {medicine.minimumTemperature} °C</p>
                    <p>Maximum Temperature: {medicine.maximumTemperature} °C</p>
                    <p>Medicine ID: {medicine.medicineId}</p>
                    <p>Condition: {medicine.status ? 'Safe' : 'Damaged'} || {(medicine.status===medicineByBlockchain.condition) ? 'Verified by Blockchain':'Node currupted'}</p>
                    {medicine.status && <p>Status: {sold ? 'Sold' : 'Available'}</p>}
                    {medicine.status && <div className={`button-sold${sold ? ' sold' : ' available'}`}>{sold?<p>Sold</p>:
                    <p onClick={handleSold}>Mark as Sold</p>}</div>}
                
                </div>
                <div className='medicine-right'>
                    <QRCode value={medicine.medicineId} size={250} />
                </div>
            </div>
            {/* Display medicine transactions */}
            <div className="medicine-history">
                <h3>Medicine History</h3>
                <div className="timeline-container">
                    <div className="timeline-line"></div>
                    <ul>
                        {transactions.map((transaction, index) => (
                            
                            <li key={index} className={`transaction-item 
                            ${transaction.temperature <parseFloat(medicine.minTemperature)
                            || transaction.temperature > parseFloat(medicine.maximumTemperature) ? 'red-bg' : ''}`}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                <p className="location-text">Location: {transaction.location}</p>
                                    <p>Temperature: {transaction.temperature} °C</p>
                                    <p>Time: {transaction.time.toDate().toString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MedicineDetails;
