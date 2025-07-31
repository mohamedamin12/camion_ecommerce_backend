import { BadRequestException, Body, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Between, FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });
  
    if (existing) throw new BadRequestException('User already exists');
  
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }
  
  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    let user;
    if (dto.email) {
      user = await this.userRepository.findOne({ where: { email: dto.email } });
    } else if (dto.phone) {
      user = await this.userRepository.findOne({ where: { phone: dto.phone } });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user,
    };
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: [
        { email: dto.email },
        { phone: dto.phone },
      ],
    });
  
    if (existing) {
      throw new BadRequestException('User already exists');
    }
  
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }
  
  
  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findUsersByFilters(filters: {
    identifier?: string;
    role?: UserRole;
    isActive?: boolean;
    joinedAfter?: Date;
    joinedBefore?: Date;
  }): Promise<User[]> {
    const where: FindOptionsWhere<User>[] = [];
  
    if (filters.identifier) {
      const pattern = ILike(`%${filters.identifier}%`);
      where.push(
        { email: pattern },
        { phone: pattern },
        { fullName: pattern }
      );
    }
  
    const commonFilters: Partial<FindOptionsWhere<User>> = {};
    if (filters.role) commonFilters.role = filters.role;
    if (typeof filters.isActive === 'boolean') commonFilters.isActive = filters.isActive;
  
    if (filters.joinedAfter && filters.joinedBefore) {
      commonFilters.createdAt = Between(filters.joinedAfter, filters.joinedBefore);
    } else if (filters.joinedAfter) {
      commonFilters.createdAt = MoreThanOrEqual(filters.joinedAfter);
    } else if (filters.joinedBefore) {
      commonFilters.createdAt = LessThanOrEqual(filters.joinedBefore);
    }
  
    const combinedWhere = where.length > 0
      ? where.map((w) => ({ ...w, ...commonFilters }))
      : [commonFilters];
  
    return this.userRepository.find({ where: combinedWhere });
  }
  

  async updateUser(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    Object.assign(user, updateData);
  
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
  
}

