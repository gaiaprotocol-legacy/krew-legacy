import { TopicService } from "@common-module/social";

class KrewTopicService extends TopicService {
  constructor() {
    super("topics", "*", 50);
  }
}

export default new KrewTopicService();
