package com.sidaf.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/api/hello")
    public String hello() {
        return "✅ Hola Rudy, el backend SIDAF está funcionando correctamente.";
    }
}
