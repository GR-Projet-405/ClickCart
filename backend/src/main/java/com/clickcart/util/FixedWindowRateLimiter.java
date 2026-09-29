package com.clickcart.util;

import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Small in-memory fixed-window rate limiter (SRS SEC-007).
 * Per application instance; a shared store (e.g. Redis) is needed if the backend is scaled horizontally.
 */
public class FixedWindowRateLimiter {

    private static final int PRUNE_THRESHOLD = 10_000;

    private record Window(long startMillis, long lengthMillis, int count) {
        boolean expired(long now) {
            return now - startMillis >= lengthMillis;
        }
    }

    private final Clock clock;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public FixedWindowRateLimiter(Clock clock) {
        this.clock = clock;
    }

    /**
     * Records one request for the key.
     *
     * @return 0 if the request is allowed, otherwise the number of seconds until the window resets
     */
    public long tryAcquire(String key, int limit, Duration window) {
        long now = clock.millis();
        long length = window.toMillis();
        if (windows.size() > PRUNE_THRESHOLD) {
            windows.values().removeIf(w -> w.expired(now));
        }

        Window updated = windows.compute(key, (k, current) ->
                current == null || current.expired(now)
                        ? new Window(now, length, 1)
                        : new Window(current.startMillis(), length, current.count() + 1));

        if (updated.count() <= limit) {
            return 0;
        }
        long remainingMillis = updated.startMillis() + length - now;
        return Math.max(1, (remainingMillis + 999) / 1000);
    }
}
