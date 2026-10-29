import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";
import { CreateCommentDto, FeaturedQueryDto, PublicQueryDto } from "../dto/blog.dto";
import { BlogService } from "../services/blog.service";
import { CommentService } from "../services/comment.service";
import { TaxonomyService } from "../services/taxonomy.service";

@Controller("public")
@UseGuards(ThrottlerGuard)
export class PublicBlogController {
  constructor(
    @Inject(BlogService) private readonly blogs: BlogService,
    @Inject(CommentService) private readonly comments: CommentService,
    @Inject(TaxonomyService) private readonly taxonomy: TaxonomyService,
  ) {}

  @Get("blog-categories")
  categories() {
    return this.taxonomy.publicCategories();
  }

  @Get("blog-tags")
  tags() {
    return this.taxonomy.publicTags();
  }

  @Get("blogs")
  list(@Query() query: PublicQueryDto) {
    return this.blogs.listPublic(query);
  }

  @Get("blogs/featured")
  featured(@Query() query: FeaturedQueryDto) {
    return this.blogs.featured(query);
  }

  @Get("blogs/sitemap")
  sitemap() {
    return this.blogs.sitemap();
  }

  @Get("blogs/:slug")
  getOne(@Param("slug") slug: string) {
    return this.blogs.getPublic(slug);
  }

  @Post("blogs/:slug/views")
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  recordView(@Param("slug") slug: string) {
    return this.blogs.recordView(slug);
  }

  @Get("blogs/:slug/comments")
  listComments(@Param("slug") slug: string, @Query() query: ApiFeatureQueryDto) {
    return this.comments.listApproved(slug, query.page, Math.min(query.limit, 50));
  }

  @Post("blogs/:slug/comments")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  createComment(@Param("slug") slug: string, @Body() body: CreateCommentDto) {
    return this.comments.create(slug, body);
  }
}
