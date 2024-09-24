import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to access URL parameters
import QRCode from 'qrcode.react'; // Import QRCode library
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import db from '../firebase';
import abi from '../utils/MedicineContract.json';
import Web3 from 'web3';

// link navigator page 
const MedicineShow = () => {
    const { id } = useParams(); // Get the ID parameter from the URL
    const [medicine, setMedicine] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [verifiedByBlockchain, setVerifiedByBlockchain] = useState({condition: true});

    // Ethereum contract details
    const contractAddress = "CONTRCATRA";
    const contractABI = abi.abi;

    useEffect(() => {
        const fetchMedicine = async () => {
            try {
                const docRef = doc(db, 'medicines', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const fetchedMedicine = { id: docSnap.id, ...docSnap.data() };
                    setMedicine(fetchedMedicine);

                    // Check verification by blockchain
                    const verified = await verifyByBlockchain(fetchedMedicine);
                    setVerifiedByBlockchain(verified);

                    // Subscribe to the collection of transactions for this medicine
                    const unsubscribe = onSnapshot(collection(db, `medicines/${id}/transactions`), (snapshot) => {
                        setTransactions(snapshot.docs.map(doc => doc.data()));
                    });

                    // Clean up function
                    return () => unsubscribe();
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching document: ', error);
            }
        };

        fetchMedicine();
    }, [id]);

    const verifyByBlockchain = async (medicineData) => {
        try {
            const web3 = new Web3(window.ethereum);
    
            // Initialize contract instance
            const contract = new web3.eth.Contract(contractABI, contractAddress);
    
            // Call the getMedicine function on the contract
            const result = await contract.methods.getMedicine(medicine.id).call();
    
            // Parse the returned values
            const name = result[0];
            const minTemperature = parseInt(result[1]);
            const maxTemperature = parseInt(result[2]);
            const condition = result[3];
            const sold = result[4];
            const history = result[5]; // Assuming history is an array of bytes32
            setVerifiedByBlockchain({condition:condition});
            return result;
        } catch (error) {
            console.error('Error verifying medicine by blockchain: ', error);
            return false;
        }
    };

    if (!medicine) {
        return <div>Loading...</div>;
    }

    return (
        <div className='medicine-show'>
            <div className="medicine-details">
                <div className="medicine">
                    <div className="medicine-left">
                        <h2>Medicine Details</h2>
                        <p>Medicine Name: {medicine.medicineName}</p>
                        <p>Minimum Temperature: {medicine.minimumTemperature} °C</p>
                        <p>Maximum Temperature: {medicine.maximumTemperature} °C</p>
                        <p>Medicine ID: {medicine.id}</p>
                        <p>Condition: {medicine.status ? 'Safe' : 'Damaged'}</p>
                        <p>Verified by Blockchain: {verifiedByBlockchain.condition===medicine.status ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="medicine-right">
                        <QRCode value={medicine.id} size={250} />
                    </div>
                </div>
                {/* Display medicine history */}
                <div className="medicine-history">
                    <h3>Medicine History</h3>
                    <div className="timeline-container">
                        <div className="timeline-line"></div>
                        <ul>
                            {transactions.map((entry, index) => (
                                <li key={index}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <p className="location-text">Location: {entry.location}</p>
                                        <p>Temperature: {entry.temperature} °C</p>
                                        <p>Time: {entry.time.toDate().toString()}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicineShow;
