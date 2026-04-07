package com.project.terravision.gis;

import com.project.terravision.gis.config.TimeZoneConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TerraVisionGisApplication {

	static { TimeZoneConfig.configure(); }

	public static void main(String[] args) {
		SpringApplication.run(TerraVisionGisApplication.class, args);
	}

}
