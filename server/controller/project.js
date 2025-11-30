const {z} = require('zod');
const Project = require('../models/Project');
const {requireAuth , requireRole} = require('../middleware/auth');

// Create a new project


const createNewProject = async (req , res) => {
  try {
        const body = z.object({ name: z.string().min(2), key: z.string().min(2), description: z.string().optional() }).parse(req.body)
        const exists = await Project.findOne({ key: body.key.toUpperCase() })
        if (exists) return res.status(409).json({ error: 'Key already exists' })
        const project = await Project.create({ ...body, key: body.key.toUpperCase(), owner: req.user.id, members: [req.user.id] })
        res.status(201).json(project)
}
    catch(err){
        return res.status(500).json({error: 'Server error' , details: err.message});
    }
}

const getAllProjects = async (req , res) => {
    try {
        console.log('Fetching all projects');
        const Projects = await Project.find({}).populate('owner', 'name email').sort('-createdAt');
        res.status(200).json(Projects);
        console.log('Fetched all projects successfully');
    }
    catch(err){
        return res.status(500).json({error: 'Server error' , details: err.message});
    }
}
module.exports = { createNewProject , getAllProjects };