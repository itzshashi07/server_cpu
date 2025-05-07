const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const fcfs = require('./algorithms/fcfs');
const sjf = require('./algorithms/sjf');
const priority = require('./algorithms/priority');
const roundRobin = require('./algorithms/roundRobin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// API endpoint to handle simulation
app.post('/simulate', (req, res) => {
  const { processes, algorithm, timeQuantum, preemptive } = req.body;

  if (!processes || !Array.isArray(processes) || processes.length === 0) {
    return res.status(400).json({ error: 'Processes list is required' });
  }

  for (const proc of processes) {
    if (
      typeof proc.id === 'undefined' ||
      typeof proc.arrivalTime !== 'number' ||
      typeof proc.burstTime !== 'number'
    ) {
      return res.status(400).json({ error: 'Each process must have id, arrivalTime, burstTime' });
    }
  }

  try {
    let result;
    switch (algorithm) {
      case 'FCFS':
        result = fcfs(processes);
        break;
      case 'SJF':
        result = sjf(processes, preemptive);
        break;
      case 'Priority':
        result = priority(processes, preemptive);
        break;
      case 'RR':
        if (!timeQuantum || typeof timeQuantum !== 'number') {
          return res.status(400).json({ error: 'Time Quantum required for Round Robin' });
        }
        result = roundRobin(processes, timeQuantum);
        break;
      default:
        return res.status(400).json({ error: 'Invalid algorithm selected' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Simulation error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
