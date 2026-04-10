//const store = require('../data/store');

function estimateWait(service, position) {
  //const service = store.getServices().find(s => s.id === serviceId);
  if (!service) return 0;
  return Math.max(0, (position - 1) * service.expectedDuration);
}

function recalcWaitTimes(queue, service) {
  //const queue = store.getQueue();
  const serviceEntries = queue
    .filter(e => e.serviceId === service.id && e.status === 'waiting')
    .sort((a, b) => a.position - b.position);

  serviceEntries.forEach((entry, idx) => {
    entry.position = idx + 1;
    entry.estimatedWait = estimateWait(service, idx + 1);
  });

  return serviceEntries;
}

module.exports = { estimateWait, recalcWaitTimes };