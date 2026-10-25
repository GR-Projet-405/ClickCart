package com.clickcart.service;
import com.clickcart.model.Favorite;
import com.clickcart.repository.FavoriteRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class FavoriteServiceTest {
 @Test void repeatedSaveReturnsExistingAndEmptyReadDoesNotWrite() {
  var repo=mock(FavoriteRepository.class);var service=new FavoriteService();ReflectionTestUtils.setField(service,"favoriteRepository",repo);
  var existing=new Favorite("c","SERVICE","s");when(repo.findByCustomerIdAndTargetTypeAndTargetId("c","SERVICE","s")).thenReturn(Optional.of(existing));
  assertSame(existing,service.addFavorite("c","SERVICE","s"));verify(repo,never()).save(any());
  service.getCustomerFavorites("other");verify(repo,never()).save(any());
 }
 @Test void concurrentNewSavesUseSameIdButDifferentAccountsDoNot() {
  var repo=mock(FavoriteRepository.class);var service=new FavoriteService();ReflectionTestUtils.setField(service,"favoriteRepository",repo);when(repo.save(any())).thenAnswer(i->i.getArgument(0));
  String first=service.addFavorite("a","SERVICE","s").getId();assertEquals(first,service.addFavorite("a","SERVICE","s").getId());assertNotEquals(first,service.addFavorite("b","SERVICE","s").getId());
 }
}
