import express from 'express';
const router = express.Router();
router.route("/addProject").get(addProject);
function addProject(req, res) {
    res.json("hello world!");
}
export { router };
//# sourceMappingURL=ProjectServices.js.map