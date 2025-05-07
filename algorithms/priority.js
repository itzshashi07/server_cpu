module.exports = function priority(processes, isPreemptive = false) {
    processes = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  
    let time = 0;
    const completed = [];
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
  
    if (!isPreemptive) {
      // Non-preemptive Priority Scheduling
      processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
      while (processes.length > 0) {
        const available = processes.filter(p => p.arrivalTime <= time);
  
        if (available.length === 0) {
          time++;
          continue;
        }
  
        // Choose highest priority (lower number = higher priority)
        available.sort((a, b) => a.priority - b.priority);
        const current = available[0];
  
        const startTime = time;
        const endTime = startTime + current.burstTime;
        const waitingTime = startTime - current.arrivalTime;
        const turnaroundTime = waitingTime + current.burstTime;
  
        completed.push({
          ...current,
          startTime,
          endTime,
          waitingTime,
          turnaroundTime
        });
  
        totalWaitingTime += waitingTime;
        totalTurnaroundTime += turnaroundTime;
  
        time = endTime;
        processes = processes.filter(p => p.id !== current.id);
      }
    } else {
      // Preemptive Priority Scheduling
      const readyQueue = [];
      let i = 0;
  
      while (completed.length < processes.length) {
        // Add newly arrived processes to the ready queue
        while (i < processes.length && processes[i].arrivalTime <= time) {
          readyQueue.push(processes[i]);
          i++;
        }
  
        if (readyQueue.length > 0) {
          // Sort ready queue by priority
          readyQueue.sort((a, b) => a.priority - b.priority);
          const current = readyQueue[0];
  
          if (!current.started) {
            current.startTime = time;
            current.started = true;
          }
  
          current.remainingTime -= 1;
          time++;
  
          if (current.remainingTime === 0) {
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
            readyQueue.shift();
          }
        } else {
          time++;
        }
      }
    }
  
    return {
      processes: completed,
      averageWaitingTime: totalWaitingTime / completed.length,
      averageTurnaroundTime: totalTurnaroundTime / completed.length
    };
  };