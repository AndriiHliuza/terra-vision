plugins {
	java
	id("org.springframework.boot") version "4.0.2"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.project.terra-vision"
version = "0.0.1-SNAPSHOT"
description = "Authentication microservice for Terra Vision"

val postgresVersion: String by project
val flywayVersion: String by project
val springBootAopVersion: String by project
val mapstructVersion: String by project

val springCloudVersion: String by project

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(25)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

dependencies {
	// --- Web ---
	implementation("org.springframework.boot:spring-boot-starter-webmvc")

	// -- Security ---
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.security:spring-security-oauth2-jose")
	implementation("org.springframework.boot:spring-boot-starter-security-oauth2-resource-server")

	// --- Spring Data ---
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-data-redis")

	// --- Database ---
	implementation("org.postgresql:postgresql:$postgresVersion")

	// --- Flyway ---
	implementation("org.springframework.boot:spring-boot-starter-flyway")
	implementation("org.flywaydb:flyway-core:$flywayVersion")
	runtimeOnly("org.flywaydb:flyway-database-postgresql:$flywayVersion")

	// --- Validation ---
	implementation("org.springframework.boot:spring-boot-starter-validation")

	// --- AOP
	implementation("org.springframework.boot:spring-boot-starter-aop:$springBootAopVersion")

	// --- Mail ---
	implementation("org.springframework.boot:spring-boot-starter-mail")

	// --- Thymeleaf ---
	implementation("org.springframework.boot:spring-boot-starter-thymeleaf")

	// --- Mapstruct ---
	implementation("org.mapstruct:mapstruct:$mapstructVersion")
	annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")

	// --- HashiCorp Vault ---
	implementation("org.springframework.cloud:spring-cloud-starter-vault-config")

	// --- Lombok ---
	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")

	// To have spring.cloud properties in application.yaml
	implementation(platform("org.springframework.cloud:spring-cloud-dependencies:$springCloudVersion"))

	/* <<<<<<<<< Tests >>>>>>>>> */

	// --- Web ---
	testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")

	// --- Security ---
	testImplementation("org.springframework.boot:spring-boot-starter-security-test")
	testImplementation("org.springframework.boot:spring-boot-starter-security-oauth2-resource-server-test")

	// --- JUnit Launcher ---
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
