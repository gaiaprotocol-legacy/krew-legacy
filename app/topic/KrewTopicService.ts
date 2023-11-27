import { TopicService } from "sofi-module";

class KrewTopicService extends TopicService {
  constructor() {
    super("topics", "*", 50);
  }
}

export default new KrewTopicService();
