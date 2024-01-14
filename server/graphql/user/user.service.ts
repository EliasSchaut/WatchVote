import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CtxType } from '@/types/ctx.type';
import { UserModel } from '@/types/models/user.model';
import { UserUpdateInputModel } from '@/types/models/inputs/user_update.input';
import { PasswordService } from '@/common/services/password.service';
import { WarningException } from '@/common/exceptions/warning.exception';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async find_by_id(ctx: CtxType): Promise<UserModel> {
    const user = await this.prisma.user.findUnique({
      where: { id: ctx.user_id },
    });
    if (user === null) {
      throw new WarningException(ctx.i18n.t('user.exception.not_found'));
    }
    return new UserModel(user);
  }

  async update(
    user_update_input_data: UserUpdateInputModel,
    ctx: CtxType,
  ): Promise<UserModel | null> {
    return new UserModel(
      await this.prisma.user.update({
        where: { id: ctx.user_id },
        data: user_update_input_data,
      }),
    );
  }

  async delete(ctx: CtxType): Promise<UserModel | null> {
    return new UserModel(
      await this.prisma.user.delete({
        where: { id: ctx.user_id },
      }),
    );
  }
}
