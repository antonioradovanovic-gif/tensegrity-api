import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendNewsletterDto, NewsletterRecipientType } from './dto/send-newsletter.dto';
import { Resend } from 'resend';

@Injectable()
export class NewsletterService {
  private resend: Resend;

  constructor(private prisma: PrismaService) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async send(dto: SendNewsletterDto) {
    const where: any = { role: 'CLIENT', status: 'APPROVED', isActive: true };

    if (dto.recipientType === NewsletterRecipientType.ONLINE) {
      where.clientType = 'ONLINE';
    } else if (dto.recipientType === NewsletterRecipientType.IN_PERSON) {
      where.clientType = 'IN_PERSON';
    } else if (dto.recipientType === NewsletterRecipientType.SELECTED) {
      if (!dto.clientIds || dto.clientIds.length === 0) {
        throw new BadRequestException('clientIds su obavezni za SELECTED tip');
      }
      where.id = { in: dto.clientIds };
    }

    const clients = await this.prisma.user.findMany({
      where,
      select: { email: true, firstName: true, lastName: true },
    });

    if (clients.length === 0) {
      throw new BadRequestException('Nema primatelja za odabrane kriterije');
    }

    const emails = clients.map((c) => c.email);

    const { data, error } = await this.resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: emails,
      subject: dto.subject,
      html: `<p>${dto.message.replace(/\n/g, '<br/>')}</p>`,
    });

    if (error) {
      throw new BadRequestException(`Greška pri slanju: ${error.message}`);
    }

    return {
      sent: emails.length,
      recipients: emails,
      id: data?.id,
    };
  }
}
