plugins {
	java
	id("org.springframework.boot") version "4.0.5"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.project"
version = "0.0.1-SNAPSHOT"
description = "GIS microservice for Terra Vision"

val postgresVersion: String by project
val flywayVersion: String by project
val minioVersion: String by project
val mapstructVersion: String by project
val lombokMapstructBindingVersion: String by project
val jtsCoreVersion: String by project
val jacksonDatatypeJtsVersion: String by project
val springCloudVersion: String by project

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(25)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	// --- Web ---
	implementation("org.springframework.boot:spring-boot-starter-webmvc")

	// --- Spring Data ---
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.hibernate.orm:hibernate-spatial") // For GeoJSON

	// --- PostgreSQL ---
	implementation("org.postgresql:postgresql:$postgresVersion")

	// --- Flyway ---
	implementation("org.springframework.boot:spring-boot-starter-flyway")
	implementation("org.flywaydb:flyway-core:$flywayVersion")
	runtimeOnly("org.flywaydb:flyway-database-postgresql:$flywayVersion")

	// --- HashiCorp Vault ---
	implementation("org.springframework.cloud:spring-cloud-starter-vault-config")

	// --- MinIO ---
	implementation("io.minio:minio:$minioVersion")

	// --- Java Topology Suite (For GeoJson) ---
	implementation("org.locationtech.jts:jts-core:$jtsCoreVersion")
	implementation("org.n52.jackson:jackson-datatype-jts:$jacksonDatatypeJtsVersion")

	// --- Mapstruct ---
	implementation("org.mapstruct:mapstruct:$mapstructVersion")
	annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")

	// --- Validation ---
	implementation("org.springframework.boot:spring-boot-starter-validation")

	// --- Lombok ---
	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok-mapstruct-binding:$lombokMapstructBindingVersion")

	// To have spring.cloud dependencies in build.gradle.kts without specifying version of the dependency
	implementation(platform("org.springframework.cloud:spring-cloud-dependencies:$springCloudVersion"))

	// --- Tests ---
	testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
