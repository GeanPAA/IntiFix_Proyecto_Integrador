package com.intifix.intifix_proyecto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IntifixProyectoApplication {

    public static void main(String[] args) {
        SpringApplication.run(IntifixProyectoApplication.class, args);
    }
}
