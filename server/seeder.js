// server/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job'); // Make sure the path is correct

dotenv.config();


const jobListings = [
    {
        title: 'Account Director, Digital Native',
        department: 'Sales',
        location: 'Singapore',
        applyLink: '#'
    },
    {
        title: 'Data Engineer, Digital Natives',
        department: 'Engineering',
        location: 'Seoul, South Korea',
        applyLink: '#'
    },

    {
        title: 'Account Director, Federal DoD',
        department: 'Sales',
        location: 'Washington, DC',
        applyLink: '#'
    },
    {
        title: 'Account Director, Large Enterprise',
        department: 'Go To Market',
        location: 'Munich, Germany',
        applyLink: '#'
    },
    {
        title: 'Account Director, Large Enterprise',
        department: 'Go To Market',
        location: 'Seoul, South Korea',
        applyLink: '#'
    },
    {
        title: 'Account Director, Startups',
        department: 'Sales',
        location: 'Singapore',
        applyLink: '#'
    },
    {
        title: 'Account Director, State & Local Government',
        department: 'Sales',
        location: 'Remote - US',
        applyLink: '#'
    },
];
const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // Clear existing data
        await Job.deleteMany();
        console.log('Jobs destroyed...');

        // Insert new data
        await Job.insertMany(jobListings);
        console.log('Jobs imported...');

        process.exit();
    } catch (err) {
        console.error(`${err}`);
        process.exit(1);
    }
};
importData();