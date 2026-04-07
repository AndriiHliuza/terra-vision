plugins {
	java
	id("org.springframework.boot") version "4.0.5"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.project"
version = "0.0.1-SNAPSHOT"
description = "GIS microservice for Terra Vision"

val minioVersion: String by project
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

	// --- HashiCorp Vault ---
	implementation("org.springframework.cloud:spring-cloud-starter-vault-config")

	// --- MinIO ---
	implementation("io.minio:minio:$minioVersion")

	// --- Lombok ---
	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")

	// To have spring.cloud dependencies in build.gradle.kts without specifying version of the dependency
	implementation(platform("org.springframework.cloud:spring-cloud-dependencies:$springCloudVersion"))

	// --- Tests ---
	testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
