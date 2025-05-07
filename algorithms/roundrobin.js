module.exports = function roundRobin(processes, timeQuantum) {
    processes = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  
    const queue = [];
    let time = 0;
    const completed = [];
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
  
    let i = 0;
    while (i < processes.length || queue.length > 0) {
      // Add all arrived processes to the queue
      while (i < processes.length && processes[i].arrivalTime <= time) {
        queue.push({ ...processes[i] });
        i++;
      }
  
      if (queue.length === 0) {
        time++;
        continue;
      }
  
      const current = queue.shift();
  
      if (!current.started) {
        current.started = true;
        current.startTime = time;
      }
  
      // Execute for min(timeQuantum, remainingTime)
      const execTime = Math.min(current.remainingTime, timeQuantum);
      time += execTime;
      current.remainingTime -= execTime;
  
      // Add new arrivals during execution
      while (i < processes.length && processes[i].arrivalTime <= time) {
        queue.push({ ...processes[i] });
        i++;
      }
  
      if (current.remainingTime > 0) {
        queue.push(current); // Requeue the incomplete process
      } else {
        const endTime = time;
        const waitingTime = endTime - current.arrivalTime - current.burstTime;
        const turnaroundTime = endTime - current.arrivalTime;
  
        completed.push({
          ...current,
          endTime,
          waitingTime,
          turnaroundTime
        });
  
        totalWaitingTime += waitingTime;
        totalTurnaroundTime += turnaroundTime;
      }
    }
  
    return {
      processes: completed,
      averageWaitingTime: totalWaitingTime / completed.length,
      averageTurnaroundTime: totalTurnaroundTime / completed.length
    };
  };
  