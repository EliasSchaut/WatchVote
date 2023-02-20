import { Injectable } from "@nestjs/common";
import { DiscordService } from "@/common/util_services/discord.service";
import { WatchListDBService } from "@/common/db_services/watchlist/watchListDB.service";
import { EmailService } from "@/common/util_services/email.service";
import { MovieInfoDBService } from "@/common/db_services/movie_infos/movieInfoDB.service";

@Injectable()
export class AnnounceJob {

  private readonly announce_discord;
  private readonly announce_email

  constructor(private readonly discordService: DiscordService,
              private readonly watchListDBService: WatchListDBService,
              private readonly movieInfoDBService: MovieInfoDBService,
              private readonly emailService: EmailService) {


    this.announce_discord = (watchlist: string[]) => `<@&1041714399964041286>\n` +
      `Die Wahl ist durch, diese Filme werden geschaut:\n${watchlist.join("\n")}\n` +
      `Mehr Infos siehe auch ${process.env.FRONTEND_URL}\n\n` +
      `Es gibt Getränke und Atmosphäre auf Spendenbasis!\n\n`

    this.announce_email = (watchlist: string[]) => `Die Wahl ist durch, diese Filme werden geschaut:\n${watchlist.join("\n")}\n` +
      `Mehr Infos siehe auch ${process.env.FRONTEND_URL}\n\n` +
      `Es gibt Getränke und Atmosphäre auf Spendenbasis!\n\n`
  }

  async run() {
    console.log("Announce job started");
    const watchlist = await this.watchListDBService.get_all();
    const output = [] as string[];

    for (const movie of watchlist) {
      const movie_info_data = await this.movieInfoDBService.get(movie.imdb_id);
      const start_time = movie.start_time.toLocaleString();
      output.push(`${start_time} - ${movie_info_data!.title}`);
    }

    await this.send_announce(output);
  }

  private async send_announce(watchlist: string[]) {
    await this.discordService.send_message(this.announce_discord(watchlist));
    await this.emailService.send_all_opt_in(this.announce_email(watchlist));
  }
}
