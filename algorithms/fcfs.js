// FCFS (First Come First Serve) Scheduling

module.exports = function fcfs(processes) {
    // Sort by arrival time
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
    let currentTime = 0;
    let result = [];
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
  
    for (let i = 0; i < processes.length; i++) {
      let p = processes[i];
      let startTime = Math.max(currentTime, p.arrivalTime);
      let waitingTime = startTime - p.arrivalTime;
      let turnaroundTime = waitingTime + p.burstTime;
  
      result.push({
        ...p,
        startTime,
        endTime: startTime + p.burstTime,
        waitingTime,
        turnaroundTime,
      });
  
      totalWaitingTime += waitingTime;
      totalTurnaroundTime += turnaroundTime;
      currentTime = startTime + p.burstTime;
    }
  
    return {
      processes: result,
      averageWaitingTime: totalWaitingTime / processes.length,
      averageTurnaroundTime: totalTurnaroundTime / processes.length,
    };
  };
  