// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// import "hardhat/console.sol";

//pragma experimental ABIEncoderV2; // Enable ABIEncoderV2

contract MedicineContract {
    // Structure to store medicine information
    struct Medicine {
        string name;
        uint256 minTemperature;
        uint256 maxTemperature;
        bool condition; // Initially true
        bool sold; // Initially false
        bytes32[] history; // Array to store history
        mapping(bytes32 => bool) historyExists; // Mapping to check existence of history
        mapping(bytes32 => HistoryDetail) historyDetails; // Mapping to store history details
    }

    // Structure to store detailed history information
    struct HistoryDetail {
        uint256 timestamp;
        uint256 currentTemperature;
        string location;
        int256 latitude;
        int256 longitude;
    }

    // Mapping to store medicine data by ID
    mapping(bytes32 => Medicine) public medicines;

    // Event emitted when a new medicine is added
    event MedicineAdded(bytes32 indexed id, string name, uint256 minTemperature, uint256 maxTemperature);

    // Event emitted when medicine history is updated
    event MedicineHistoryUpdated(bytes32 indexed id, uint256 timestamp, uint256 currentTemperature, string location, int256 latitude, int256 longitude);

    // Function to initialize a new medicine
    function initializeMedicine(bytes32 id, string memory _name, uint256 _minTemperature, uint256 _maxTemperature) internal {
        Medicine storage newMedicine = medicines[id];
        newMedicine.name = _name;
        newMedicine.minTemperature = _minTemperature;
        newMedicine.maxTemperature = _maxTemperature;
        newMedicine.condition = true;
        newMedicine.sold = false;
    }

    // Function to add medicine
    function addMedicine(bytes32 _id, string memory _name, uint256 _minTemperature, uint256 _maxTemperature) external {
        require(medicines[_id].minTemperature == 0, "Medicine already exists");

        initializeMedicine(_id, _name, _minTemperature, _maxTemperature);
        emit MedicineAdded(_id, _name, _minTemperature, _maxTemperature);
    }

   // Function to add medicine history
    function addMedicineHistory(bytes32 _id, uint256 _currentTemperature, string memory _location, int256 _latitude, int256 _longitude) external {
        Medicine storage medicine = medicines[_id];
        require(medicine.minTemperature != 0, "Medicine does not exist");

        // Check if current temperature is within the range of min and max temperature
        // require(_currentTemperature >= medicine.minTemperature && _currentTemperature <= medicine.maxTemperature, "Current temperature is out of range");

        bytes32 historyId = keccak256(abi.encodePacked(block.timestamp, _currentTemperature, _location, _latitude, _longitude));
        require(!medicine.historyExists[historyId], "History already exists");

        medicine.history.push(historyId);
        medicine.historyExists[historyId] = true;

        // Store detailed history information
        medicine.historyDetails[historyId] = HistoryDetail(block.timestamp, _currentTemperature, _location, _latitude, _longitude);

        emit MedicineHistoryUpdated(_id, block.timestamp, _currentTemperature, _location, _latitude, _longitude);

        // If current temperature is out of range, update medicine status to false
        if (_currentTemperature < medicine.minTemperature || _currentTemperature > medicine.maxTemperature) {
            _updateMedicineStatus(_id, false);
        }
    }

    // Internal function to update medicine status
    function _updateMedicineStatus(bytes32 _id, bool _condition) internal {
        Medicine storage medicine = medicines[_id];
        require(medicine.minTemperature != 0, "Medicine does not exist");

        medicine.condition = _condition;
    }


    // Function to check if medicine exists by ID
    function medicineExists(bytes32 _id) external view returns (bool) {
        return medicines[_id].minTemperature != 0;
    }

    // Function to update medicine status
    function updateMedicineStatus(bytes32 _id, bool _condition) external {
        Medicine storage medicine = medicines[_id];
        require(medicine.minTemperature != 0, "Medicine does not exist");

        medicine.condition = _condition;
    }

    // Function to update medicine sold status
    function updateMedicineSoldStatus(bytes32 _id, bool _sold) external {
        Medicine storage medicine = medicines[_id];
        require(medicine.minTemperature != 0, "Medicine does not exist");

        medicine.sold = _sold;
    }

    // Function to get medicine details by ID
    function getMedicine(bytes32 _id) external view returns (
        string memory name,
        uint256 minTemperature,
        uint256 maxTemperature,
        bool condition,
        bool sold,
        bytes32[] memory history
    ) {
        Medicine storage medicine = medicines[_id];
        require(medicine.minTemperature != 0, "Medicine does not exist");

        return (
            medicine.name,
            medicine.minTemperature,
            medicine.maxTemperature,
            medicine.condition,
            medicine.sold,
            medicine.history
        );
    }

    // Function to get detailed history of a medicine by ID
    function getMedicineHistory(bytes32 _id) external view returns (HistoryDetail[] memory) {
        Medicine storage medicine = medicines[_id];
        require(medicine.minTemperature != 0, "Medicine does not exist");

        HistoryDetail[] memory details = new HistoryDetail[](medicine.history.length);
        for (uint256 i = 0; i < medicine.history.length; i++) {
            details[i] = medicine.historyDetails[medicine.history[i]];
        }
        return details;
    }
}
