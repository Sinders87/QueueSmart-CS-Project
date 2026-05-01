function estimateWait(service, position) {
  const expectedDuration = Number(service.expectedDuration || service.expected_duration || 10);

  let waitTime = (position - 1) * expectedDuration;

  if (service.priority === "high") {
    waitTime = Math.max(0, waitTime - 5);
  }

  if (position >= 4) {
    waitTime += 5;
  }

  return waitTime;
}

function recalcWaitTimes(queue, service) {
  const waiting = queue
    .filter(entry => entry.serviceId === service.id && entry.status === "waiting")
    .sort((a, b) => a.position - b.position);

  waiting.forEach((entry, index) => {
    entry.position = index + 1;
    entry.estimatedWait = estimateWait(service, entry.position);
  });
}

module.exports = {
  estimateWait,
  recalcWaitTimes
};
