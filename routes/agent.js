const express = require("express");
const { SalesAgent } = require("../models/models.saleAgents");
const router = express.Router();

router.post("/agents", async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({ error: "Invalid input: 'name' is required and must be a non-empty string." });
        }

        if (!email || typeof email !== "string") {
            return res.status(400).json({ error: "Invalid input: 'email' is required and must be a string." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid input: 'email' must be a valid email address." });
        }

        const alreadyExist = await SalesAgent.findOne({ email });
        if (alreadyExist) {
            return res.status(409).json({ error: `Sales agent with email '${email}' already exists.` });
        }

        const agent = new SalesAgent({ name, email });
        await agent.save();

        res.status(201).json({
            id: agent._id,
            name: agent.name,
            email: agent.email,
            createdAt: agent.createdAt
        });

    } catch (err) {
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
});

router.get("/agents", async (req, res) => {
    try {
        const agents = await SalesAgent.find()

        if(!agents) return res.status(404).json({ error: "Agents not found."})

        const fetchAgents = agents.map(agent => ({
            id: agent._id,
            name: agent.name,
            email: agent.email
        }))
        res.status(200).json(fetchAgents)
        
    } catch (err) {
       res.status(500).json({error: "Server error while fetching agents."})
    }
})

module.exports = router;
