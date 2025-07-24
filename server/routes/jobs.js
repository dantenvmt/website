const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');
// @route   GET /api/jobs
// @desc    Get all job listings
// @access  Public

router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route   GET /api/jobs/:id
// @desc    Get a single job by its ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        res.json(job);
    } catch (err) {
        console.error(err.message);
        // If the ID format is invalid, it might throw an error
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/jobs
// @desc    Add a new job listing
// @access  Private (but public for now)
router.post('/', auth, async (req, res) => {
    try {
        // Create a new job object from the request body
        const newJob = new Job({
            title: req.body.title,
            department: req.body.department,
            location: req.body.location,
            applyLink: req.body.applyLink
        });

        // Save the new job to the database
        const job = await newJob.save();
        res.status(201).json(job); // Respond with the created job and a 201 status
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update an existing job listing
// @access  Private (but public for now)
router.put('/:id', auth, async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Update the job fields from the request body
        job = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true } // Return the modified document
        );

        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job listing
// @access  Private (but public for now)
router.delete('/:id', auth, async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        await Job.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Job removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;