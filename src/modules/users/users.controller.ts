import { Controller, Post, Body, Delete, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('User')
@Controller('api/v1')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '회원가입', description: '새로운 유저를 생성합니다.' })
  @ApiResponse({ status: 201, description: '회원가입이 성공적으로 완료되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiBody({ type: CreateUserDto })
  @Post('signup')
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

  @ApiOperation({ summary: '회원 삭제', description: '유저를 삭제합니다.' })
  @ApiResponse({ status: 200, description: '회원 정보가 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '회원 정보를 찾을 수 없습니다.' })
  @ApiParam({ name: 'id', description: '삭제할 유저의 ID' })
  @Delete('signup/:id')
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