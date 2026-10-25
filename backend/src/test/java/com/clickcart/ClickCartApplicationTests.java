package com.clickcart;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    // A test-only override allows a disposable MongoDB instance without changing application settings.
    "spring.data.mongodb.uri=${CLICKCART_TEST_MONGODB_URI:mongodb://localhost:27017/clickcart-test}",
    "clickcart.security.enabled=false"
})
class ClickCartApplicationTests {

    @Test
    void contextLoads() {
    }
}

