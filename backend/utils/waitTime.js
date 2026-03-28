const store = require('../data/store');

function estimateWait(serviceId, position) {
  const service = store.getServices().find(s => s.id === serviceId);
  if (!service) return 0;
  return Math.max(0, (position - 1) * service.expectedDuration);
}

function recalcWaitTimes(serviceId) {
  const queue = store.getQueue();
  const serviceEntries = queue
    .filter(e => e.serviceId === serviceId && e.status === 'waiting')
    .sort((a, b) => a.position - b.position);

  serviceEntries.forEach((entry, idx) => {
    entry.position = idx + 1;
    entry.estimatedWait = estimateWait(serviceId, idx + 1);
  });
}

module.exports = { estimateWait, recalcWaitTimes };