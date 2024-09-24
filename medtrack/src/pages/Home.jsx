import React from 'react';
import '../css/home.css';
import img from '../assets/medicine_supply.png';

const Home = () => {
    return (
        <div className='home'>
            <h2 className='welcome-home'>Welcome to MEDTRACK Dashboard</h2>
            <p className='home-text'>Empowering health through innovation, our application revolutionizes medicine tracking by harnessing blockchain and IoT technologies. Seamlessly monitor your medicine's journey and temperature, ensuring safety and reliability at every step. Embrace the future of healthcare with our cutting-edge solution. Trust in transparency, security, and efficiency with our integrated platform. Join us in shaping a healthier tomorrow through advanced tracking and monitoring.</p>
            <img src={img} alt="Logo" className="lp-logo" height={300} />
        </div>
    );
};

export default Home;

// cc: Adarsh Kashyap