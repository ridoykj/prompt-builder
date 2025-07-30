package io.bootify.my_app.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
public class TestController {


    @GetMapping("/hello")
    public String getMethodName(@RequestParam String param) {
        return "Hello, " + param + "!";
    }

}
