package com.clickcart.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class FixedWindowRateLimiterTest {

    /** Clock that tests can move forward. */
    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-09-27T10:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }

    @Test
    void allowsUpToTheLimitThenReportsSecondsUntilReset() {
        MutableClock clock = new MutableClock();
        FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(clock);

        for (int i = 0; i < 3; i++) {
            assertEquals(0, limiter.tryAcquire("login|1.2.3.4", 3, Duration.ofMinutes(1)));
        }
        clock.advance(Duration.ofSeconds(20));
        long retryAfter = limiter.tryAcquire("login|1.2.3.4", 3, Duration.ofMinutes(1));

        assertEquals(40, retryAfter);
    }

    @Test
    void windowResetsAfterItsDuration() {
        MutableClock clock = new MutableClock();
        FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(clock);
        limiter.tryAcquire("k", 1, Duration.ofMinutes(1));
        assertTrue(limiter.tryAcquire("k", 1, Duration.ofMinutes(1)) > 0);

        clock.advance(Duration.ofMinutes(1));

        assertEquals(0, limiter.tryAcquire("k", 1, Duration.ofMinutes(1)));
    }

    @Test
    void keysAreCountedSeparately() {
        FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(new MutableClock());
        limiter.tryAcquire("login|1.1.1.1", 1, Duration.ofMinutes(1));

        assertEquals(0, limiter.tryAcquire("login|2.2.2.2", 1, Duration.ofMinutes(1)));
    }
}
