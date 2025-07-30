import { Test, TestingModule } from '@nestjs/testing';
import { WishlistServiceController } from './wishlist-service.controller';
import { WishlistServiceService } from './wishlist-service.service';

describe('WishlistServiceController', () => {
  let wishlistServiceController: WishlistServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WishlistServiceController],
      providers: [WishlistServiceService],
    }).compile();

    wishlistServiceController = app.get<WishlistServiceController>(WishlistServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(wishlistServiceController.getHello()).toBe('Hello World!');
    });
  });
});
