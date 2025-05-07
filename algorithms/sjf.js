class MinHeap {
    constructor() {
      this.heap = [];
    }
  
    insert(proc) {
      this.heap.push(proc);
      this._heapifyUp();
    }
  
    extractMin() {
      if (this.heap.length === 0) return null;
      const min = this.heap[0];
      const end = this.heap.pop();
      if (this.heap.length > 0) {
        this.heap[0] = end;
        this._heapifyDown();
      }
      return min;
    }
      peek() {
      return this.heap[0];
    }
  
    _heapifyUp() {
      let index = this.heap.length - 1;
      const element = this.heap[index];
      while (index > 0) {
        let parentIndex = Math.floor((index - 1) / 2);
        let parent = this.heap[parentIndex];
        if (element.remainingTime >= parent.remainingTime) break;
        this.heap[index] = parent;
        index = parentIndex;
      }
      this.heap[index] = element;
    }
  
    _heapifyDown() {
      let index = 0;
      const length = this.heap.length;
      const element = this.heap[0];
  
      while (true) {
        let leftIdx = 2 * index + 1;
        let rightIdx = 2 * index + 2;
        let swap = null;
  
        if (leftIdx < length && this.heap[leftIdx].remainingTime < element.remainingTime) {
          swap = leftIdx;
        }
  
        if (
          rightIdx < length &&
          this.heap[rightIdx].remainingTime < (swap === null ? element.remainingTime : this.heap[leftIdx].remainingTime)
        ) {
          swap = rightIdx;
        }
  
        if (swap === null) break;
        this.heap[index] = this.heap[swap];
        index = swap;
      }
  
      this.heap[index] = element;
    }
  
    isEmpty() {
      return this.heap.length === 0;
    }
  }
  
  module.exports = function sjf(processes, isPreemptive = false) {
    // Deep copy to avoid mutation
    processes = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  
    let time = 0;
    const completed = [];
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
  
    if (!isPreemptive) {
      // Non-preemptive SJF
      processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
      while (processes.length > 0) {
        let available = processes.filter(p => p.arrivalTime <= time);
        if (available.length === 0) {
          time++;
          continue;
        }
  
        available.sort((a, b) => a.burstTime - b.burstTime);
        const current = available[0];
  
        const startTime = time;
        const endTime = time + current.burstTime;
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
      // Preemptive SJF (Shortest Remaining Time First)
      const heap = new MinHeap();
      let i = 0;
  
      while (completed.length < processes.length) {
        while (i < processes.length && processes[i].arrivalTime <= time) {
          heap.insert(processes[i]);
          i++;
        }
  
        if (!heap.isEmpty()) {
          let current = heap.extractMin();
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
          } else {
            heap.insert(current); // Reinsert with updated remaining time
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
  