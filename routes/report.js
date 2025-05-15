const express = require("express")
const router = express.Router()
const { Lead } = require("../models/models.leads");

router.get("/report/pipeline", async (req, res) => {
    try {
        const leads = await Lead.find();

        const activeLeads = leads.filter(lead => lead.status !== "Closed");
        const closeLeads = leads.filter(lead => lead.status === "Closed");

    
        res.status(200).json({ totalCloseLeads: closeLeads.length, totalLeadsInPipeline: activeLeads.length });

    } catch (err) {
        res.status(500).json({ error: "Something went wrong. Please try again later."})
    }
})

router.get("/report/last-week", async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const leads = await Lead.find({ status: "Closed" })
            .populate("salesAgent", "name");

        const filteredLeads = leads.filter(lead => {
            return lead.closedAt && lead.closedAt >= sevenDaysAgo && lead.closedAt <= now;
        });

        const leadCountByAgent = {};
        filteredLeads.forEach(lead => {
            const agentName = lead.salesAgent?.name;
            if (!leadCountByAgent[agentName]) {
                leadCountByAgent[agentName] = 0;
            }
            leadCountByAgent[agentName]++;
        });

        const barData = Object.entries(leadCountByAgent).map(([agent, count]) => ({
            salesAgent: agent,
            closedLeads: count,
        }));

        res.status(200).json(barData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
});

router.get("/report/status-distribution", async (req, res) => {
    try {
        const leads = await Lead.find({}, { status: 1 });

        const statusCount = {};

        leads.forEach(lead => {
            const status = lead.status;
            statusCount[status] = (statusCount[status] || 0) + 1;
        });

        const data = Object.entries(statusCount).map(([status, count]) => ({
            label: status,
            value: count
        }));

        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
});

module.exports = router;
