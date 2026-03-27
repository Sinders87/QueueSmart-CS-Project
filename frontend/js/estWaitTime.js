function estWaitTime(position, expectedDuration) {
    if (position <= 1) {
        return 0;
    }

    else {
        return (position - 1) * expectedDuration;
    }
}

window.estWaitTime = estWaitTime;