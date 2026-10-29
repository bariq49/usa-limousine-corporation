import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { EmailModule } from "../../infrastructure/email/email.module";
import { NotificationModule } from "../notification/notification.module";
import { AdminBlogController } from "./controllers/admin-blog.controller";
import { AdminCommentController } from "./controllers/admin-comment.controller";
import { AdminTaxonomyController } from "./controllers/admin-taxonomy.controller";
import { PublicBlogController } from "./controllers/public.controller";
import { BlogRepository } from "./repositories/blog.repository";
import { CategoryRepository } from "./repositories/category.repository";
import { CommentRepository } from "./repositories/comment.repository";
import { TagRepository } from "./repositories/tag.repository";
import { BlogEmailQueueService } from "./jobs/blog-email-queue.service";
import { BlogService } from "./services/blog.service";
import { CommentService } from "./services/comment.service";
import { NotificationService } from "./services/notification.service";
import { TaxonomyService } from "./services/taxonomy.service";

@Module({
  imports: [DatabaseModule, EmailModule, NotificationModule],
  controllers: [
    AdminBlogController,
    AdminTaxonomyController,
    AdminCommentController,
    PublicBlogController,
  ],
  providers: [
    BlogRepository,
    CategoryRepository,
    TagRepository,
    CommentRepository,
    BlogService,
    TaxonomyService,
    CommentService,
    NotificationService,
    BlogEmailQueueService,
  ],
})
export class BlogModule {}

