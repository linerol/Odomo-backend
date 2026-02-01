import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { SigninDto } from './dto/signin.dto.js';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async signup(signupDto: SignupDto) {
    // Utilise UsersService pour créer l'utilisateur (qui gère déjà le hash argon2)
    const user = await this.usersService.create({
      email: signupDto.email,
      password: signupDto.password,
    });

    // Générer le token JWT
    const tokens = await this.getTokens(user.id, user.email);

    return {
      access_token: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async signin(signinDto: SigninDto) {
    // Rechercher l'utilisateur par email
    const user = await this.usersService.findOneByEmail(signinDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Vérifier le mot de passe avec argon2
    const passwordMatches = await argon2.verify(
      user.password,
      signinDto.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Générer le token JWT
    const tokens = await this.getTokens(user.id, user.email);

    return {
      access_token: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  private async getTokens(userId: string, email: string) {
    const payload = {
      sub: userId,
      email: email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }
}
