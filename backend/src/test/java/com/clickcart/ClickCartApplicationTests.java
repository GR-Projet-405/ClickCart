package com.clickcart;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.data.mongodb.uri=mongodb://localhost:27017/clickcart-test")
class ClickCartApplicationTests {

    @Test
    void contextLoads() {
    }
}

