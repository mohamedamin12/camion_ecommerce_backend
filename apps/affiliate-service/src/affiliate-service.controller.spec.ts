import { Test, TestingModule } from '@nestjs/testing';
import { AffiliateServiceController } from './affiliate-service.controller';
import { AffiliateServiceService } from './affiliate-service.service';

describe('AffiliateServiceController', () => {
  let affiliateServiceController: AffiliateServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AffiliateServiceController],
      providers: [AffiliateServiceService],
    }).compile();

    affiliateServiceController = app.get<AffiliateServiceController>(AffiliateServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(affiliateServiceController.getHello()).toBe('Hello World!');
    });
  });
});
