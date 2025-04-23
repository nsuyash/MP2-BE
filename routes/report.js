const express = require("express")
const router = express.Router()
const { Lead } = require("../models/models.leads");
const { SalesAgent } = require("../models/models.saleAgents");


router.get("/report/last-week", async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7)

        const leads = await Lead.find({
            status: "Closed"
        }).populate("salesAgent", "name")

        const filteredLeads = leads.filter(lead => {
            return lead.closedAt && lead.closedAt >= sevenDaysAgo && lead.closedAt <= now;
          });

        const response = filteredLeads.map(lead => ({
            id: lead._id,
            name: lead.name,
            salesAgent: lead.salesAgent.name,
            closedAt: lead.closedAt
        }))

        res.status(200).json(response)


    } catch (err) {
        res.status(500).json({ error: "Something went wrong. Please try again later."})
    }
})

router.get("/report/pipeline", async (req, res) => {
    try {
        const leads = await Lead.find({}, { status: 1 });

        const activeLeads = leads.filter(lead => lead.status !== "Closed");
    
        res.status(200).json({ totalLeadsInPipeline: activeLeads.length });

    } catch (err) {
        res.status(500).json({ error: "Something went wrong. Please try again later."})
    }
})

module.exports = router;