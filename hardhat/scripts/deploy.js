async function main(){
    const [deployer] = await ethers.getSigners();

    const MedicineContract = await ethers.getContractFactory("MedicineContract");
    const medicineContract = await MedicineContract.deploy();
    console.log("Token address:",medicineContract.address);
}

main()
    .then(()=>process.exit(0))
    .catch((error)=>{
        console.error(error);
        process.exit(1);
    });