import { DomNode, LottieAnimation } from "common-app-module";
import animationData from "./krew-loading-animation.json" assert {
  type: "json",
};

export default class KrewLoadingAnimation extends DomNode {
  constructor() {
    super(".krew-loading-animation");
    this.append(new LottieAnimation(animationData));
  }
}