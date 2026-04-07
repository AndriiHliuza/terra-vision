package com.project.terravision.gis.config;

import java.util.TimeZone;

public class TimeZoneConfig {

    public static void configure() {
        String timezone = TimeZone.getDefault().getID();
        if (timezone.equals("Europe/Kiev")) {
            TimeZone.setDefault(TimeZone.getTimeZone("Europe/Kyiv"));
        }
    }
}
