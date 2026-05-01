function estimateWait(service, position, history = []) {
  const expectedDuration = Number(service.expectedDuration || 10);

  let historicalAdjustment = 1;

  if (history.length > 5) {
    historicalAdjustment = 0.9;
  }

  let waitTime = (position - 1) * expectedDuration * historicalAdjustment;

  return Math.max(0, Math.round(waitTime));
}

function recalcWaitTimes(queue, service, history = []) {
  const waiting = queue
    .filter(e => e.serviceId === service.id && e.status === 'waiting')
    .sort((a, b) => a.position - b.position);

  waiting.forEach((entry, index) => {
    entry.position = index + 1;
    entry.estimatedWait = estimateWait(service, entry.position, history);
  });
}

module.exports = {
  estimateWait,
  recalcWaitTimes
};
