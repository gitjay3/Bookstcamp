import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation, Prisma } from '@prisma/client';

type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: {
    EventSlot: {
      include: {
        Event: true;
      };
    };
  };
}>;

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateReservationDto,
  ): Promise<Reservation> {
    return this.prisma.reservation.create({
      data: {
        userId,
        slotId: dto.slotId,
        status: 'PENDING',
      },
    }) as Promise<Reservation>;
  }

  async findAllByUser(userId: string): Promise<ReservationWithRelations[]> {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: {
        EventSlot: {
          include: {
            Event: true,
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
        EventSlot: {
          include: {
            Event: true,
          },
        },
      },
    }) as Promise<ReservationWithRelations | null>;
  }

  async cancel(id: number): Promise<Reservation> {
    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    }) as Promise<Reservation>;
  }
}
