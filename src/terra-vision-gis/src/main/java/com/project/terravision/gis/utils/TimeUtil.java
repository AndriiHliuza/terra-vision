package com.project.terravision.gis.utils;

import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneOffset;

public abstract class TimeUtil {
    public static Instant startOfDay(Instant instant) {
        return instant.atZone(ZoneOffset.UTC)
                .toLocalDate()
                .atStartOfDay(ZoneOffset.UTC)
                .toInstant();
    }

    public static Instant endOfDay(Instant instant) {
        return instant.atZone(ZoneOffset.UTC)
                .toLocalDate()
                .atTime(LocalTime.MAX)
                .atZone(ZoneOffset.UTC)
                .toInstant();
    }
}
