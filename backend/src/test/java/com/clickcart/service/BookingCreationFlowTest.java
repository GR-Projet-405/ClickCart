package com.clickcart.service;
import com.clickcart.dto.*;
import com.clickcart.model.*;
import com.clickcart.repository.*;
import org.junit.jupiter.api.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.test.util.ReflectionTestUtils;

class BookingCreationFlowTest {
 BookingRepository bookings=mock(BookingRepository.class);
 ServiceListingRepository listings=mock(ServiceListingRepository.class);
 UserRepository users=mock(UserRepository.class);
 ConversationService chats=mock(ConversationService.class);
 BookingServiceImpl service=new BookingServiceImpl(bookings);
 ServiceListing listing=new ServiceListing();
 @BeforeEach void setup(){
  ReflectionTestUtils.setField(service,"listings",listings);ReflectionTestUtils.setField(service,"users",users);ReflectionTestUtils.setField(service,"conversations",chats);
  var verifications=mock(ProviderVerificationRepository.class); ReflectionTestUtils.setField(service,"verifications",verifications); var approved=new ProviderVerification();approved.setStatus("APPROVED");when(verifications.findByUserId("provider")).thenReturn(Optional.of(approved));
  listing.setId("service");listing.setProviderId("provider");listing.setTitle("Cleaning");listing.setCategory("Cleaning");listing.setPriceFrom(new BigDecimal("2500"));listing.setStatus(ServiceListingStatus.ACTIVE);
  when(listings.findById("service")).thenReturn(Optional.of(listing));
  User u=new User();u.setId("provider");u.setRole(Role.SERVICE_PROVIDER);u.setFullName("Actual provider");when(users.findById("provider")).thenReturn(Optional.of(u));
  when(bookings.save(any())).thenAnswer(i->{Booking b=i.getArgument(0);b.setId("booking");return b;});
 }
 BookingCreateDTO request(){BookingCreateDTO r=new BookingCreateDTO();r.setCustomerId("customer");r.setServiceId("service");r.setProviderId("spoofed");r.setTotalCost(1.0);r.setServiceTitle("spoofed");r.setCustomerName("Customer");r.setCustomerPhone("0771234567");r.setAddress("10 Test Road");r.setLocation("Colombo");r.setBookingDate(LocalDate.now().plusDays(2).toString());r.setTimeSlot("09:00");return r;}
 @Test void usesStoredServiceAndCreatesPendingBookingWithChat(){var result=service.createBooking(request());assertEquals(2500.0,result.getTotalCost());assertEquals("provider",result.getProviderId());assertEquals("Cleaning",result.getServiceTitle());assertEquals("PENDING_APPROVAL",result.getStatus());verify(chats).getOrCreateConversation(eq("customer"),argThat(r->"booking".equals(r.getBookingId())&&"provider".equals(r.getProviderId())));}
 @Test void rejectsUnverifiedProvider(){var repo=mock(ProviderVerificationRepository.class);ReflectionTestUtils.setField(service,"verifications",repo);assertThrows(IllegalArgumentException.class,()->service.createBooking(request()));verify(bookings,never()).save(any());}
 @Test void rejectsPastDateBeforeWriting(){var r=request();r.setBookingDate(LocalDate.now().minusDays(1).toString());assertThrows(IllegalArgumentException.class,()->service.createBooking(r));verify(bookings,never()).save(any());}
 @Test void rejectsInactiveServiceBeforeWriting(){listing.setStatus(ServiceListingStatus.PAUSED);assertThrows(IllegalArgumentException.class,()->service.createBooking(request()));verify(bookings,never()).save(any());}
}
