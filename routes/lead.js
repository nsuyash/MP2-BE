const express = require('express');
const { Lead } = require("../models/models.leads")
const { SalesAgent } = require("../models/models.saleAgents")
const router = express.Router()

router.post("/leads", async (req, res) => {
    try {
        const { name, source, salesAgent, status, tags, timeToClose, priority } = req.body

        if (!name) return res.status(404).json({error: "Invalid input: 'name' is required."});
        if (!source) return res.status(404).json({error: "Invalid input: 'source' is required."});
        if (!salesAgent) return res.status(404).json({error: "Invalid input: 'salesAgent' is required."});
        if (!status) return res.status(404).json({error: "Invalid input: 'status' is required."});
        if (!tags) return res.status(404).json({error: "Invalid input: 'tags' is required."});
        if (!timeToClose) return res.status(404).json({error: "Invalid input: 'timeToClose' is required."});
        if (!priority) return res.status(404).json({error: "Invalid input: 'priority' is required."});

        const agent = await SalesAgent.findById(salesAgent)
        if (!agent) return res.status(404).json({error: `Sales agent with ID '${salesAgent}' not found.`});
         
        const lead = new Lead({
          name, 
          source,
          salesAgent,
          status,
          tags,
          timeToClose,
          priority
        })
        

        await lead.save()
        res.status(201).json({
          id: lead._id,
          name: lead.name,
          source: lead.source,
          salesAgent: {
            id: agent._id,
            name: agent.name
          },
          status: lead.status,
          tags: lead.tags,
          timeToClose: lead.timeToClose,
          priority: lead.priority,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt
        });
        
    } catch (err) { 
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
})

const allowedStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'];
const allowedSources = ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'];

router.get("/leads", async (req, res) => {
    try {
        const { salesAgent, status, tags, source} = req.query
        const filter = {}

        if (salesAgent) {
            if(!mongoose.Types.ObjectId.isValid(salesAgent)){
                return res.status(404).json({error: "Invalid input: 'salesAgent' must be a valid ObjectId."})
            }
            
            filter.salesAgent = salesAgent
        }

        if (status) {
            if (!allowedStatuses.includes(status)) {
              return res.status(400).json({
                error: `Invalid input: 'status' must be one of ${JSON.stringify(allowedStatuses)}.`
              });
            }
            filter.status = status;
          }
      

          if (source) {
            if (!allowedSources.includes(source)) {
              return res.status(400).json({
                error: `Invalid input: 'source' must be one of ${JSON.stringify(allowedSources)}.`
              });
            }
            filter.source = source;
          } 

           if (tags){
                const tagsArray = Array.isArray(tags) ? tags : tags.split(",")
                filter.tags = {$all: tagsArray}
           }

           const leads = await Lead.find(filter).populate("salesAgent", "name")

           if (!leads) return res.status(404).json({ message: "Leads not found."})

           const response = leads.map(lead => ({
            id: lead._id,
            name: lead.name,
            source: lead.source,
            salesAgent: {
                id: lead.salesAgent?._id,
                name: lead.salesAgent?.name
            },
            status: lead.status,
            tags: lead.tags,
            timeToClose: lead.timeToClose,
            priority: lead.priority,
            createdAt: lead.createdAt
           }))

           res.status(200).json(response)
    } catch (err) {
        res.status(500).json({error: "Server error while fetching leads."})
    }
})


router.put("/leads/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, source, salesAgent, status, tags, timeToClose, priority } = req.body

        if(!mongoose.Types.objectId.isValid(id)) return res.status(400).json({ error: "Invalid lead ID." });

        if (!name || !source || !salesAgent || !status || !timeToClose || !priority) {
            return res.status(400).json({ error: "All required fields must be provided." });
        }
        
        const allowedStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'];
        const allowedSources = ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'];
        const allowedPriorities = ['High', 'Medium', 'Low'];
    
        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({ error: `Invalid status. Must be one of ${allowedStatuses.join(', ')}` });
        }
    
        if (!allowedSources.includes(source)) {
          return res.status(400).json({ error: `Invalid source. Must be one of ${allowedSources.join(', ')}` });
        }
    
        if (!allowedPriorities.includes(priority)) {
          return res.status(400).json({ error: `Invalid priority. Must be one of ${allowedPriorities.join(', ')}` });
        }
    
        if (!mongoose.Types.ObjectId.isValid(salesAgent)) {
          return res.status(400).json({ error: "Invalid sales agent ID." });
        }
    
        const agent = await SalesAgent.findById(salesAgent);
        if (!agent) {
          return res.status(404).json({ error: `Sales agent with ID '${salesAgent}' not found.` });
        }

        const updatedLead = await Lead.findByIdAndUpdate(
            id,
            {
              name,
              source,
              salesAgent,
              status,
              tags,
              timeToClose,
              priority,
              updatedAt: new Date(),
              ...(status === 'Closed' ? { closedAt: new Date() } : { closedAt: undefined })
            },
            { new: true }
          ).populate('salesAgent', 'name');
      
          if (!updatedLead) {
            return res.status(404).json({ error: `Lead with ID '${id}' not found.` });
          }
          
          res.status(200).json({
            id: updatedLead._id,
            name: updatedLead.name,
            source: updatedLead.source,
            salesAgent: {
              id: updatedLead.salesAgent._id,
              name: updatedLead.salesAgent.name
            },
            status: updatedLead.status,
            tags: updatedLead.tags,
            timeToClose: updatedLead.timeToClose,
            priority: updatedLead.priority,
            updatedAt: updatedLead.updatedAt
          });
    } catch (err){
        res.status(500).json({ error: "Server error while updating the lead." });
    }
})

router.delete('/leads/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid lead ID.' });
      }

      const deletedLead = await Lead.findByIdAndDelete(id);
  
      if (!deletedLead) {
        return res.status(404).json({ error: `Lead with ID '${id}' not found.` });
      }
  
      res.status(200).json({ message: 'Lead deleted successfully.' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error while deleting the lead.' });
    }
  });

module.exports = router;