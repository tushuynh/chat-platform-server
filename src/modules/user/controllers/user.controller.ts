import { Routes } from '@common/constants/constant';
import { Controller } from '@nestjs/common';

@Controller(Routes.USER)
export class UserController {
  constructor() {}
}
