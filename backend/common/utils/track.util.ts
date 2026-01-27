import { Track } from '@prisma/client';

interface PrismaLike {
  camperPreRegistration: {
    findFirst: (args: {
      where: { claimedUserId: string; organizationId: string };
      select: { track: true };
    }) => Promise<{ track: Track } | null>;
  };
}

/**
 * 사용자가 특정 트랙의 이벤트에 참여할 수 있는지 확인
 * @returns true if eligible, false otherwise
 */
export async function isUserEligibleForTrack(
  prisma: PrismaLike,
  userId: string,
  eventTrack: Track,
  organizationId: string,
): Promise<boolean> {
  // COMMON 트랙은 모든 사용자 허용
  if (eventTrack === 'COMMON') return true;

  // 사용자의 트랙 확인
  const preReg = await prisma.camperPreRegistration.findFirst({
    where: {
      claimedUserId: userId,
      organizationId,
    },
    select: { track: true },
  });

  return preReg?.track === eventTrack;
}
