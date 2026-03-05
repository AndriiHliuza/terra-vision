plugins {
	java
	id("org.springframework.boot") version "4.0.2"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.project"
version = "0.0.1-SNAPSHOT"
description = "Gateway project for Spring WebFlux"

val commonsLang3Version: String by project

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(25)
	}
}

repositories {
	mavenCentral()
}

extra["springCloudVersion"] = "2025.1.0"

dependencies {
	// --- Web ---
	implementation("org.springframework.cloud:spring-cloud-starter-gateway-server-webflux")

	// -- Security ---
	implementation("org.springframework.boot:spring-boot-starter-security-oauth2-resource-server")

	// -- Spring Data ---
	implementation("org.springframework.boot:spring-boot-starter-data-redis")

	// --- Lombok ---
	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")

	// --- Commons Lang 3 (String Utils) ---
	implementation("org.apache.commons:commons-lang3:$commonsLang3Version")

	// --- Tests ---
	testImplementation("org.springframework.boot:spring-boot-starter-security-oauth2-resource-server-test")
	testImplementation("io.projectreactor:reactor-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

dependencyManagement {
	imports {
		mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}
