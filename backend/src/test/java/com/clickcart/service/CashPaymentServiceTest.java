package com.clickcart.service;
import com.clickcart.dto.*;
import com.clickcart.model.*;
import com.clickcart.repository.*;
import com.clickcart.util.CurrentCustomerResolver;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CashPaymentServiceTest {
 @Mock PaymentRepository payments; @Mock BookingRepository bookings; @Mock ProviderJobRepository jobs;
 @Mock CommissionTransactionService commissions; @Mock CurrentCustomerResolver identity;
 @InjectMocks PaymentServiceImpl service;
 @AfterEach void clear(){SecurityContextHolder.clearContext();}
 void login(String id,String role){SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(id,"",List.of(new SimpleGrantedAuthority("ROLE_"+role))));}
 Booking booking(){Booking b=new Booking();b.setId("b");b.setCustomerId("customer");b.setProviderId("provider");b.setTotalCost(2500.0);b.setCurrency("LKR");b.setStatus(BookingStatus.CONFIRMED);return b;}
 @Test void cashSelectionUsesStoredPriceAndDoesNotMarkPaid(){
  login("customer","CUSTOMER");when(identity.getCurrentCustomerId()).thenReturn("customer");when(bookings.findById("b")).thenReturn(Optional.of(booking()));when(payments.save(any())).thenAnswer(i->i.getArgument(0));
  CreatePaymentIntentRequest r=new CreatePaymentIntentRequest();r.setBookingId("b");r.setAmount(java.math.BigDecimal.ONE);r.setCustomerId("victim");
  var result=service.createPaymentIntent(r);assertEquals("PENDING",result.getStatus());assertEquals(2500,result.getAmount().intValue());assertEquals("customer",result.getCustomerId());assertNull(result.getReceiptNumber());
 }
 @Test void customerCannotAccessAnotherBooking(){login("other","CUSTOMER");when(identity.getCurrentCustomerId()).thenReturn("other");when(bookings.findById("b")).thenReturn(Optional.of(booking()));CreatePaymentIntentRequest r=new CreatePaymentIntentRequest();r.setBookingId("b");assertThrows(com.clickcart.exception.ForbiddenException.class,()->service.createPaymentIntent(r));verifyNoInteractions(payments);}
 @Test void fakeGatewayAndWebhookCannotMarkPaid(){ProcessPaymentRequest r=new ProcessPaymentRequest();r.setPaymentMethod("CREDIT_CARD");assertThrows(com.clickcart.exception.PaymentException.class,()->service.processPayment(r));assertThrows(com.clickcart.exception.ForbiddenException.class,()->service.handleWebhook(new WebhookEventRequest()));verifyNoInteractions(payments);}
 @Test void cashRequiresCompletedJobAndCorrectProvider(){login("provider","SERVICE_PROVIDER");when(bookings.findById("b")).thenReturn(Optional.of(booking()));assertThrows(com.clickcart.exception.PaymentException.class,()->service.confirmCash("b"));login("other","SERVICE_PROVIDER");assertThrows(com.clickcart.exception.ForbiddenException.class,()->service.confirmCash("b"));verifyNoInteractions(payments);}
}
