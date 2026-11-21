import { Registration } from '../../domain/entities';
import { RegistrationNotFoundError } from '../../domain/errors';
import { IRegistrationRepository } from '../../domain/repositories';

export interface UploadPaymentProofDTO {
  registrationIdOrMagicToken: string;
  paymentProofUrl: string;
}

export class UploadPaymentProofUseCase {
  constructor(private readonly registrationRepository: IRegistrationRepository) {}

  public async execute(dto: UploadPaymentProofDTO): Promise<Registration> {
    const key = dto.registrationIdOrMagicToken.trim();

    let registration = await this.registrationRepository.findById(key);
    if (!registration) {
      registration = await this.registrationRepository.findByMagicToken(key);
    }
    if (!registration) {
      registration = await this.registrationRepository.findByTicketCode(key);
    }
    if (!registration) {
      throw new RegistrationNotFoundError('Data pendaftaran tidak ditemukan');
    }

    registration.submitPaymentProof(dto.paymentProofUrl);
    return await this.registrationRepository.update(registration);
  }
}
