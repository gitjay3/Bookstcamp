import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ApplyReservationDto } from './dto/apply-reservation.dto';
import { Reservation, Prisma } from '@prisma/client';
import {
  ReservationJobData,
  RESERVATION_QUEUE,
  PROCESS_RESERVATION_JOB,
} from './dto/reservation-job.dto';

type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: {
    slot: {
      include: {
        event: true;
      };
    };
  };
}>;

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    @InjectQueue(RESERVATION_QUEUE)
    private reservationQueue: Queue<ReservationJobData>,
  ) {}

  async apply(
    userId: string,
    dto: ApplyReservationDto,
  ): Promise<{ status: string; message: string }> {
    // 슬롯 정보 조회
    const slot = await this.prisma.eventSlot.findUnique({
      where: { id: dto.slotId },
    });

    if (!slot) {
      throw new NotFoundException('슬롯을 찾을 수 없습니다');
    }

    // Redis에서 재고 차감 시도
    const success = await this.redisService.decrementStock(dto.slotId);

    if (!success) {
      throw new BadRequestException('정원이 마감되었습니다');
    }

    // Queue에 Job 추가
    await this.reservationQueue.add(PROCESS_RESERVATION_JOB, {
      userId,
      slotId: dto.slotId,
      maxCapacity: slot.maxCapacity,
    });

    // 즉시 응답 (비동기 처리)
    return {
      status: 'PENDING',
      message: '예약이 접수되었습니다. 잠시 후 확정됩니다.', // 예약 대기 시간 확인하고 이 메세지 수정 혹은 생략 가능
    };
  }

  async findAllByUser(userId: string): Promise<ReservationWithRelations[]> {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: {
        slot: {
          include: {
            event: true,
          },
        },
      },
      orderBy: {
        reservedAt: 'desc',
      },
    }) as Promise<ReservationWithRelations[]>;
  }

  async findOne(id: number): Promise<ReservationWithRelations | null> {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: {
        slot: {
          include: {
            event: true,
          },
        },
      },
    }) as Promise<ReservationWithRelations | null>;
  }

  async findByUserAndEvent(
    userId: string,
    eventId: number,
  ): Promise<ReservationWithRelations | null> {
    return this.prisma.reservation.findFirst({
      where: {
        userId,
        slot: { eventId },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: { slot: { include: { event: true } } },
    }) as Promise<ReservationWithRelations | null>;
  }

  async cancel(id: number, userId: string): Promise<Reservation> {
    // apply와 동일
    const updated = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        throw new NotFoundException('예약을 찾을 수 없습니다');
      }

      if (reservation.userId !== userId) {
        throw new BadRequestException('본인의 예약만 취소할 수 있습니다');
      }

      if (reservation.status === 'CANCELLED') {
        throw new BadRequestException('이미 취소된 예약입니다');
      }

      const [updated] = await Promise.all([
        tx.reservation.update({
          where: { id },
          data: { status: 'CANCELLED' },
        }),
        tx.eventSlot.update({
          where: { id: reservation.slotId },
          data: { currentCount: { decrement: 1 } },
        }),
      ]);

      return { updated, userId: reservation.userId };
    });

    return updated.updated;
  }
}
