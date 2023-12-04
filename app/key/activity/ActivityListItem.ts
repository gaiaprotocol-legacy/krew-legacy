import { DomNode } from "common-app-module";
import KrewContractEvent from "../../database-interface/KrewContractEvent.js";

export default class ActivityListItem extends DomNode {
  constructor(event: KrewContractEvent) {
    super(".activity-list-item");
  }
}
