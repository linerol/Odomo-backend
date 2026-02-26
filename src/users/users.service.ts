import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { UserEntity } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hasher le mot de passe avec argon2
    const hashedPassword = await argon2.hash(createUserDto.password);

    // Créer l'utilisateur
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async getUserWithStats(id: string): Promise<Partial<UserEntity>> {
    const user = await this.findById(id);

    // Get all daily logs for the user, ordered by date descending
    const logs = await this.prisma.dailyStepLog.findMany({
      where: { userId: id },
      orderBy: { date: 'desc' },
    });

    let totalSteps = 0;
    let streak = 0;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      totalSteps += log.steps;

      const logDate = new Date(log.date);
      logDate.setUTCHours(0, 0, 0, 0);

      // Check if the log is for today
      if (logDate.getTime() === today.getTime()) {
        if (log.steps >= user.stepGoal) {
          streak++;
        }
        continue;
      }

      // Past days
      // If we miss a day entirely, the streak is broken, but we have to check actual dates.
      // So let's do a proper date-based streak calculation.
    }

    // A better streak calculation:
    streak = 0;
    let currentDateToCheck = new Date(today);

    // Check if today is completed
    const todayLog = logs.find(l => {
      const d = new Date(l.date);
      return d.setUTCHours(0, 0, 0, 0) === today.getTime();
    });

    if (todayLog && todayLog.steps >= user.stepGoal) {
      streak++;
    }

    // Look back day by day
    currentDateToCheck.setUTCDate(currentDateToCheck.getUTCDate() - 1);
    while (true) {
      const pastLog = logs.find(l => {
        const d = new Date(l.date);
        return d.setUTCHours(0, 0, 0, 0) === currentDateToCheck.getTime();
      });

      if (pastLog && pastLog.steps >= user.stepGoal) {
        streak++;
        currentDateToCheck.setUTCDate(currentDateToCheck.getUTCDate() - 1);
      } else {
        break; // Streak broken
      }
    }

    return {
      ...user,
      totalSteps,
      streak,
    };
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Vérifier que l'utilisateur existe
    await this.findById(id);

    // Si le password est fourni, le hasher avec argon2
    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(updateUserDto.password);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string): Promise<User> {
    // Vérifier que l'utilisateur existe
    await this.findById(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
