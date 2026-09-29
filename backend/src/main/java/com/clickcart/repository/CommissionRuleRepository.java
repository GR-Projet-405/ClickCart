package com.clickcart.repository;

import com.clickcart.model.CommissionRule;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommissionRuleRepository extends MongoRepository<CommissionRule, String> {
    List<CommissionRule> findAllByOrderByPriorityDescEffectiveStartDateDesc();
}
