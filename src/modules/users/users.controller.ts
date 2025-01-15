import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  HttpException,
  HttpStatus,
  Patch,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@UseInterceptors(ClassSerializerInterceptor) // class-transformer 적용
@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 회원가입
  @ApiOperation({ summary: '회원가입', description: '새로운 유저를 생성합니다.' })
  @ApiResponse({
    status: 201,
    description: '회원가입이 성공적으로 완료되었습니다.',
    schema: {
      example: {
        status: 201,
        message: '회원가입이 성공적으로 완료되었습니다.',
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
    schema: {
      example: {
        status: 400,
        message: '잘못된 요청입니다.',
        error: 'Invalid data',
      },
    },
  })
  @ApiBody({ type: CreateUserDto })
  @Post('signup')
  @Public()
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.createUser(createUserDto);
      return {
        status: 201,
        message: '회원가입이 성공적으로 완료되었습니다.',
        user,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          error: '잘못된 요청입니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 회원 정보 조회
  @ApiOperation({ summary: '회원 정보 조회', description: '특정 유저의 정보를 조회합니다.' })
  @ApiResponse({
    status: 200,
    description: '회원 정보 조회 성공',
    schema: {
      example: {
        user_id: '123',
        mail: 'john.doe@example.com',
        name: 'John Doe',
        profile_image: 'https://example.com/profile.jpg',
      },
    },
  })
  @ApiResponse({ status: 404, description: '회원 정보를 찾을 수 없습니다.' })
  @ApiParam({ name: 'id', description: '조회할 유저의 ID', example: '123' })
  @Get(':id')
  @ApiBearerAuth('access-token') // Bearer 인증 추가
  async getUser(@Param('id') id: string) {
    try {
      const user = await this.userService.findUserById(id);
      return user;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: error.message,
          error: '회원 정보를 찾을 수 없습니다.',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // 회원 정보 수정
  @ApiOperation({ summary: '회원 정보 수정', description: '특정 유저의 정보를 수정합니다.' })
  @ApiResponse({
    status: 200,
    description: '회원 정보 수정 성공',
    schema: {
      example: {
        user_id: '123',
        mail: 'updated.email@example.com',
        name: 'Updated Name',
        profile_image: 'https://example.com/new-profile.jpg',
      },
    },
  })
  @ApiResponse({ status: 404, description: '회원 정보를 찾을 수 없습니다.' })
  @ApiParam({ name: 'id', description: '수정할 유저의 ID', example: '123' })
  @ApiBody({
    type: UpdateUserDto,
    description: '수정할 이름 또는 비밀번호를 포함합니다.',
    examples: {
      updateName: {
        summary: '이름만 변경',
        value: { name: 'Updated Name' },
      },
      updatePassword: {
        summary: '비밀번호만 변경',
        value: { currentPassword: 'oldPassword123', password: 'newPassword123!' },
      },
      updateBoth: {
        summary: '이름과 비밀번호 모두 변경',
        value: { name: 'Updated Name', currentPassword: 'oldPassword123', password: 'newPassword123!' },
      },
    },
  })
  @Patch(':id')
  @ApiBearerAuth('access-token') // Bearer 인증 추가
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto & { currentPassword?: string }) {
    try {
      const updatedUser = await this.userService.updateUser(id, updateUserDto);
      return updatedUser;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          error: '잘못된 요청입니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 회원 삭제
  @ApiOperation({ summary: '회원 삭제', description: '유저를 삭제합니다.' })
  @ApiResponse({
    status: 200,
    description: '회원 정보가 성공적으로 삭제되었습니다.',
    schema: {
      example: {
        status: 200,
        message: '회원 정보가 성공적으로 삭제되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '회원 정보를 찾을 수 없습니다.',
    schema: {
      example: {
        status: 404,
        message: '유저를 찾을 수 없습니다.',
        error: 'Not Found',
      },
    },
  })
  @ApiParam({ name: 'id', description: '삭제할 유저의 ID', example: '123' }) // URL 파라미터 명시
  @Delete('signup/:id')
  @ApiBearerAuth('access-token') // Bearer 인증 추가
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.deleteUser(id);
      return {
        status: 200,
        message: '회원 정보가 성공적으로 삭제되었습니다.',
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: error.message,
          error: '회원 정보를 찾을 수 없습니다.',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
