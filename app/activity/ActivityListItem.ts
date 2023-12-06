import { DomNode } from "common-app-module";
import KrewContractEvent, {
  EventType,
} from "../database-interface/KrewContractEvent.js";
import { ethers } from "ethers";

export default class ActivityListItem extends DomNode {
  constructor(event: KrewContractEvent) {
    super(".activity-list-item");

    if (event.event_type === EventType.KrewCreated) {
    }

    if (event.event_type === EventType.Trade) {
      const isBuy = event.args[2] === "true";
      const amount = event.args[3];
      const price = ethers.formatEther(event.args[4]);

      //console.log(isBuy, amount, price);
    }

    if (event.event_type === EventType.ClaimFee) {
    }

    this.append("TODO: ActivityListItem");
  }
}
