import { Test, TestingModule } from '@nestjs/testing';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';

const createQueueServiceMock = () => ({
  enterQueue: jest.fn(),
  getQueueStatus: jest.fn(),
});

describe('QueueController', () => {
  let controller: QueueController;
  let serviceMock: ReturnType<typeof createQueueServiceMock>;

  beforeEach(async () => {
    serviceMock = createQueueServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [{ provide: QueueService, useValue: serviceMock }],
    }).compile();

    controller = module.get<QueueController>(QueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('enterQueue', () => {
    it('대기열에 진입하고 결과를 반환한다', async () => {
      serviceMock.enterQueue.mockResolvedValue({
        position: 5,
        isNew: true,
      });

      const result = await controller.enterQueue(1, 'user-123');

      expect(result.success).toBe(true);
      expect(result.data.position).toBe(5);
      expect(result.data.isNew).toBe(true);
      expect(result.data.sessionId).toBeDefined();
      expect(serviceMock.enterQueue).toHaveBeenCalledWith(
        1,
        'user-123',
        expect.any(String),
      );
    });

    it('기존 사용자 재진입 시 isNew가 false이다', async () => {
      serviceMock.enterQueue.mockResolvedValue({
        position: 3,
        isNew: false,
      });

      const result = await controller.enterQueue(1, 'user-123');

      expect(result.data.isNew).toBe(false);
    });
  });

  describe('getQueueStatus', () => {
    it('대기열 상태를 반환한다', async () => {
      serviceMock.getQueueStatus.mockResolvedValue({
        position: 10,
        totalWaiting: 50,
        hasToken: false,
      });

      const result = await controller.getQueueStatus(1, 'user-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        position: 10,
        totalWaiting: 50,
        hasToken: false,
        inQueue: true,
        tokenExpiresAt: null,
      });
    });

    it('토큰이 있으면 hasToken이 true이다', async () => {
      const expiresAt = Date.now() + 300000;
      serviceMock.getQueueStatus.mockResolvedValue({
        position: null,
        totalWaiting: 50,
        hasToken: true,
        tokenExpiresAt: expiresAt,
      });

      const result = await controller.getQueueStatus(1, 'user-123');

      expect(result.data.hasToken).toBe(true);
      expect(result.data.inQueue).toBe(false);
      expect(result.data.tokenExpiresAt).toBe(expiresAt);
    });

    it('대기열에 없으면 inQueue가 false이다', async () => {
      serviceMock.getQueueStatus.mockResolvedValue({
        position: null,
        totalWaiting: 0,
        hasToken: false,
      });

      const result = await controller.getQueueStatus(1, 'user-123');

      expect(result.data.inQueue).toBe(false);
    });
  });
});
