const experss = require('express')
const { createNewProject , getAllProjects } = require('../controller/project');
const { requireAuth , requireRole } = require('../middleware/auth');



const router = experss.Router();


router.post('/' , requireAuth , requireRole('admin', 'manager') , createNewProject);
router.get('/' , requireAuth , getAllProjects);

module.exports = router;