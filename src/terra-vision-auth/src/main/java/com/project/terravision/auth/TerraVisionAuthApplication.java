package com.project.terravision.auth;

import com.project.terravision.auth.config.TimeZoneConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TerraVisionAuthApplication {

	static { TimeZoneConfig.configure(); }

	public static void main(String[] args) {
		SpringApplication.run(TerraVisionAuthApplication.class, args);
	}

}
