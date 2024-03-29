import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/common/db_services/prisma.service";

@Injectable()
export class WatchListDBService {

  constructor(private readonly prisma: PrismaService) {}

  async get_all() {
    return this.prisma.watchList.findMany()
  }

  async add(data: Prisma.WatchListCreateInput) {
    return this.prisma.watchList.create({ data })
  }

  async delete(imdb_id: string) {
    return this.prisma.watchList.delete({
      where: {
        imdb_id
      }
    })
  }
}
