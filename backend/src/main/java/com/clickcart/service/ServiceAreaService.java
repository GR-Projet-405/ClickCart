package com.clickcart.service;

import java.util.List;
import com.clickcart.dto.PagedResponse;
import com.clickcart.dto.ServiceAreaRequest;
import com.clickcart.dto.ServiceAreaResponse;
import com.clickcart.dto.ServiceAreaStatusRequest;
import com.clickcart.dto.ServiceAreaSummaryResponse;

public interface ServiceAreaService {

    ServiceAreaResponse createServiceArea(String providerId, ServiceAreaRequest request);

    PagedResponse<ServiceAreaResponse> getServiceAreas(String providerId, String search, String status, String district, int page, int size);

    ServiceAreaResponse getServiceAreaById(String providerId, String id);

    ServiceAreaResponse updateServiceArea(String providerId, String id, ServiceAreaRequest request);

    ServiceAreaResponse updateStatus(String providerId, String id, ServiceAreaStatusRequest statusRequest);

    void archiveServiceArea(String providerId, String id);

    ServiceAreaSummaryResponse getSummary(String providerId);

    List<ServiceAreaResponse> findCoveringServiceAreas(String district, String cityName);
}
