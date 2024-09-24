import hardhat from "hardhat";
import { expect } from "chai";

describe("Medicine contract", function(){
    
    it("should create a new medicine", async function(){
        // Deploy the MedicineContract
        const [owner] = await hardhat.ethers.getSigners();

        console.log("Signers object: ", owner);

        const MedicineContract = await hardhat.ethers.getContractFactory("MedicineContract");
        const medicineContract = await MedicineContract.deploy();

        // Add a new medicine
        const medicineNameBytes32 = ethers.utils.formatBytes32String("Asprin");

        // Call the addMedicine function with the correct _id parameter
        await medicineContract.addMedicine(medicineNameBytes32, "Asprin", 5, 25);
        // Check if the medicine was added successfully
        const medicineName = "Asprin";

        const medicineExists = await medicineContract.medicineExists(ethers.utils.formatBytes32String(medicineName));

        expect(medicineExists).to.be.true;

        // Get medicine details
        const medicineDetails = await medicineContract.getMedicine(ethers.utils.formatBytes32String(medicineName));
        const [name, minTemp, maxTemp] = medicineDetails;

        // Assert the medicine details
        expect(name).to.equal(medicineName);
        expect(minTemp.toNumber()).to.equal(5);
        expect(maxTemp.toNumber()).to.equal(25);
    });
});
