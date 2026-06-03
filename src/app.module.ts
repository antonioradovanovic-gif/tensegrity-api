import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { ExerciseModule } from './exercise/exercise.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkoutModule } from './workout/workout.module';
import { WorkoutTemplatesModule } from './workout-templates/workout-templates.module';
import { PostsModule } from './posts/posts.module';
import { NewsletterModule } from './newsletter/newsletter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    AuthModule,
    AdminModule,
    UserModule,
    ExerciseModule,
    PrismaModule,
    WorkoutModule,
    WorkoutTemplatesModule,
    PostsModule,
    NewsletterModule,
  ],
})
export class AppModule {}
