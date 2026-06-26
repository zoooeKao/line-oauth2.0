package com.poc.lineauth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class LineAuthApplication {
    public static void main(String[] args) {
        SpringApplication.run(LineAuthApplication.class, args);
    }
}
