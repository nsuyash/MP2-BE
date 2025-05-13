const express = require("express")
const router = express.Router()
const { Lead } = require("../models/models.leads")
const { Comment } = require("../models/models.comments")
const { SalesAgent } = require("../models/models.saleAgents")
const mongoose = require("mongoose")


router.post("/leads/:id/comments", async (req, res) => {
    try {
        const { id } = req.params
        const { commentText } = req.body

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ error: 'Invalid lead ID.' });
        }

        if(!commentText || typeof commentText !== "string"){
            return res.status(400).json({ error: "Invalid input: 'commentText' is required and must non-empty string."})
        }

        const lead = await Lead.findById(id).populate("salesAgent", "id")

        const agent = await SalesAgent.findById(lead.salesAgent.id)
        if (!agent) return res.status(404).json({error: `Sales agent with ID '${lead.salesAgent.id}' not found.`});

        if(!lead) {
            return res.status(404).json({error: `Lead with ID '${id}' not found.`});
        }

        const comment = new Comment({
            lead: lead.id,
            author: lead.salesAgent.id,
            commentText: commentText
        })

        await comment.save()
        res.status(200).json({
            id: comment._id,
            commentText: comment.commentText,
            author: agent.name,
            createdAt: comment.createdAt
        })


    } catch (err) {
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
})


router.get("/leads/:id/comments", async (req, res) => {
    try {
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ error: 'Invalid lead ID.' });
        }

        const lead = await Lead.findById(id)
        if(!lead){
            return res.status(404).json({error: `Lead with ID '${id}' not found.`});
        }

        const comments = await Comment.find().populate("author", "name")

        const filteredComments = comments.filter(comment => comment.lead == id)

        const response = filteredComments.map(comment => ({
            id: comment._id,
            commentText: comment.commentText,
            author: comment.author.name,
            createdAt: comment.createdAt
        }))

        res.status(200).json(response)

    } catch (err) {
        res.status(500).json({ error: "Something went wrong. Please try again later."})
    }
})

module.exports = router;